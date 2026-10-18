import { useEffect, useRef } from 'react';
import { LexoRank } from 'lexorank';
import { definePlugin, useClient, type LayoutProps } from 'sanity';

const viteEnv = import.meta.env as Record<string, string | undefined>;
const apiVersion = viteEnv.SANITY_API_VERSION ?? '2026-09-21';

const CAR_QUERY = `*[_type == "car"]{
  _id,
  name,
  order,
  orderRank,
  image,
  images[]{ _key, asset, alt, crop, hotspot }
}`;

type SanityImage = {
  _key?: string;
  _type?: string;
  asset?: { _ref?: string };
  alt?: string;
  crop?: unknown;
  hotspot?: unknown;
};

type CarRow = {
  _id: string;
  name?: string;
  order?: number | string;
  orderRank?: string;
  image?: SanityImage;
  images?: SanityImage[];
};

function randomKey() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

function legacyImageEntry(image: SanityImage | undefined): SanityImage | null {
  if (!image?.asset?._ref) return null;
  return {
    _key: randomKey(),
    _type: 'image',
    asset: image.asset,
    ...(image.alt ? { alt: image.alt } : {}),
    ...(image.crop ? { crop: image.crop } : {}),
    ...(image.hotspot ? { hotspot: image.hotspot } : {}),
  };
}

function buildImages(car: CarRow): SanityImage[] | null {
  const legacy = legacyImageEntry(car.image);
  const existing = Array.isArray(car.images) ? car.images : [];
  const hasImages = existing.some((item) => item?.asset?._ref);

  if (!legacy && hasImages) {
    return null;
  }

  if (!legacy && !hasImages) {
    return null;
  }

  const legacyRef = legacy?.asset?._ref;
  const alreadyIncluded = legacyRef && existing.some((item) => item?.asset?._ref === legacyRef);

  const merged = hasImages
    ? alreadyIncluded || !legacy
      ? existing
      : [legacy, ...existing]
    : legacy
      ? [legacy]
      : [];

  return merged.map((item) => ({
    ...item,
    _key: item._key ?? randomKey(),
    _type: 'image',
  }));
}

function hasLegacyOrderValue(order: CarRow['order']) {
  return order !== undefined && order !== null && order !== '';
}

function needsNormalization(car: CarRow) {
  const hasLegacyImage = Boolean(car.image?.asset?._ref);
  const hasLegacyOrder = hasLegacyOrderValue(car.order);
  const missingRank = !car.orderRank;
  const images = buildImages(car);
  const needsImageMerge = images !== null && hasLegacyImage;
  return hasLegacyOrder || missingRank || needsImageMerge;
}

async function normalizeCars(client: ReturnType<typeof useClient>) {
  const cars = await client.fetch<CarRow[]>(CAR_QUERY, {}, { perspective: 'raw' });
  const toFix = cars.filter(needsNormalization);
  if (toFix.length === 0) return 0;

  const sortedForRank = [...cars].sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : Number(a.order) || 9999;
    const orderB = typeof b.order === 'number' ? b.order : Number(b.order) || 9999;
    if (orderA !== orderB) return orderA - orderB;
    return a._id.localeCompare(b._id);
  });

  let rank = LexoRank.min();
  const rankById = new Map<string, string>();
  for (const car of sortedForRank) {
    if (car.orderRank) {
      try {
        rank = LexoRank.parse(car.orderRank).genNext();
      } catch {
        rank = rank.genNext();
      }
      continue;
    }
    rankById.set(car._id, rank.toString());
    rank = rank.genNext();
  }

  const transaction = client.transaction();

  for (const car of toFix) {
    const images = buildImages(car);
    const nextRank = rankById.get(car._id);
    const unsetFields: string[] = [];
    if (hasLegacyOrderValue(car.order)) unsetFields.push('order');
    if (car.image) unsetFields.push('image');

    transaction.patch(car._id, (patch) => {
      if (images) patch.set({ images });
      if (nextRank) patch.set({ orderRank: nextRank });
      if (unsetFields.length > 0) patch.unset(unsetFields);
    });
  }

  await transaction.commit({ visibility: 'sync' });
  return toFix.length;
}

const PUBLISHED_CARS_QUERY = `*[_type == "car" && !(_id in path("drafts.**"))]
  | order(orderRank asc, _id asc){ _id, orderRank }`;

async function rebalanceCatalogOrderRanksIfNeeded(client: ReturnType<typeof useClient>) {
  const cars = await client.fetch<{ _id: string; orderRank?: string }[]>(PUBLISHED_CARS_QUERY);
  if (cars.length === 0) return 0;

  const ranks = cars.map((car) => car.orderRank?.trim()).filter(Boolean) as string[];
  const hasMissing = cars.some((car) => !car.orderRank?.trim());
  const hasDuplicate = new Set(ranks).size !== ranks.length;

  if (!hasMissing && !hasDuplicate) return 0;

  let rank = LexoRank.min();
  const transaction = client.transaction();
  for (const car of cars) {
    transaction.patch(car._id, (patch) => patch.set({ orderRank: rank.toString() }));
    rank = rank.genNext();
  }
  await transaction.commit({ visibility: 'sync' });
  return cars.length;
}

async function stripLegacyOrderFields(client: ReturnType<typeof useClient>) {
  const ids = await client.fetch<string[]>(
    `*[_type == "car" && defined(order)]._id`,
    {},
    { perspective: 'raw' },
  );
  if (ids.length === 0) return 0;

  const transaction = client.transaction();
  for (const id of ids) {
    transaction.patch(id, (patch) => patch.unset(['order']));
  }
  await transaction.commit({ visibility: 'sync' });
  return ids.length;
}

function CarDocumentNormalizationEffect() {
  const client = useClient({ apiVersion });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void (async () => {
      const stripped = await stripLegacyOrderFields(client);
      const fixed = await normalizeCars(client);
      const rebalanced = await rebalanceCatalogOrderRanksIfNeeded(client);
      if (stripped > 0 || fixed > 0 || rebalanced > 0) {
        console.info(
          `[car-document-normalization] order removed: ${stripped}, normalized: ${fixed}, rebalanced ranks: ${rebalanced}.`,
        );
      }
    })().catch((error) => {
      console.warn('[car-document-normalization]', error);
    });
  }, [client]);

  return null;
}

function StudioLayoutWithCarNormalization(props: LayoutProps) {
  return (
    <>
      <CarDocumentNormalizationEffect />
      {props.renderDefault(props)}
    </>
  );
}

export const carDocumentNormalizationPlugin = definePlugin({
  name: 'car-document-normalization',
  studio: {
    components: {
      layout: StudioLayoutWithCarNormalization,
    },
  },
});
