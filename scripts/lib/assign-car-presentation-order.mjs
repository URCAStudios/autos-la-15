import { LexoRank } from 'lexorank';

/**
 * Assigns `orderRank` for drag-and-drop ordering in Sanity Studio.
 * Cars without `orderRank` are appended after the current tail, sorted by legacy `order` when present.
 */
export async function assignCarPresentationOrder(client, { onlyMissing = true } = {}) {
  const cars = await client.fetch(
    `*[_type == "car" && ${onlyMissing ? '!defined(orderRank)' : 'true'}]
      | order(coalesce(order, 9999) asc, _createdAt asc, _id asc){ _id, name, order }`,
  );

  if (cars.length === 0) {
    return 0;
  }

  let rank;
  if (onlyMissing) {
    const tail = await client.fetch(
      `*[_type == "car" && defined(orderRank)] | order(orderRank desc)[0].orderRank`,
    );
    rank = tail ? LexoRank.parse(tail).genNext() : LexoRank.min();
  } else {
    rank = LexoRank.min();
  }

  let updated = 0;
  for (const car of cars) {
    await client
      .patch(car._id)
      .set({ orderRank: rank.toString() })
      .unset(['order'])
      .commit();
    rank = rank.genNext();
    updated += 1;
  }

  return updated;
}

/** Removes deprecated numeric `order` from car documents (not in schema after drag-and-drop). */
export async function removeLegacyCarOrderFields(client) {
  const cars = await client.fetch(`*[_type == "car" && defined(order)]{ _id }`);

  for (const car of cars) {
    await client.patch(car._id).unset(['order']).commit();
  }

  return cars.length;
}
