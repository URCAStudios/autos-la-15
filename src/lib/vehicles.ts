export type VehicleIdentity = {
  _id: string;
  name: string;
};

export type FactKey =
  | 'type'
  | 'condition'
  | 'mileage'
  | 'color'
  | 'engine'
  | 'drivetrain'
  | 'passengers'
  | 'owner'
  | 'titleStatus'
  | 'warranty';

export type VehicleFact = {
  key: FactKey;
  value: string;
};

export type StatusLabels = {
  available: string;
  reserved: string;
  sold: string;
  archived: string;
};

const colorLabels: Record<string, string> = {
  negro: 'Negro',
  negra: 'Negro',
  blanco: 'Blanco',
  blanca: 'Blanco',
  rojo: 'Rojo',
  roja: 'Rojo',
  gris: 'Gris',
  azul: 'Azul',
  plateado: 'Plateado',
  plateada: 'Plateado',
  beige: 'Beige',
  verde: 'Verde',
  dorado: 'Dorado',
  dorada: 'Dorado',
};

const passengerWords: Record<string, string> = {
  uno: '1',
  dos: '2',
  tres: '3',
  cuatro: '4',
  cinco: '5',
  seis: '6',
  siete: '7',
  ocho: '8',
};

export const vehicleSlug = (name: string, id: string) => {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (base) return base;
  return id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'vehiculo';
};

export const assignSlugs = <T extends VehicleIdentity>(cars: T[]): Array<T & { slug: string }> => {
  const counts = new Map<string, number>();
  return cars.map((car) => {
    const base = vehicleSlug(car.name, car._id);
    const seen = counts.get(base) ?? 0;
    counts.set(base, seen + 1);
    return { ...car, slug: seen === 0 ? base : `${base}-${seen + 1}` };
  });
};

export type VehicleWithOrderRank = VehicleIdentity & { orderRank?: string };

/** Same lexicographic sort as homepage catalog and Sanity Studio list. */
export const sortCarsForPresentation = <T extends VehicleWithOrderRank>(list: T[]) =>
  [...list].sort((a, b) => {
    const rankA = a.orderRank?.trim() || '\uffff';
    const rankB = b.orderRank?.trim() || '\uffff';
    const byRank = rankA.localeCompare(rankB);
    if (byRank !== 0) return byRank;
    return a._id.localeCompare(b._id);
  });

export const statusLabel = (status: string, labels: StatusLabels) => {
  if (status === 'reserved') return labels.reserved;
  if (status === 'sold') return labels.sold;
  if (status === 'archived') return labels.archived;
  return labels.available;
};

const pushFact = (facts: VehicleFact[], key: FactKey, value: string) => {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (!clean || facts.some((fact) => fact.key === key)) return;
  facts.push({ key, value: clean });
};

/** Reads only phrases that are already in the vehicle description. */
export const descriptionFacts = (description: string | undefined): VehicleFact[] => {
  const text = description?.trim() ?? '';
  if (!text) return [];
  const facts: VehicleFact[] = [];

  if (/\bpickup\b/i.test(text)) pushFact(facts, 'type', 'Pickup');

  if (/\b0\s*km\b/i.test(text)) {
    pushFact(facts, 'condition', '0 km');
  } else {
    const thousandKm = text.match(/(\d+(?:[.,]\d+)?)\s*mil\s*km/i);
    const plainKm = text.match(/(\d{1,3}(?:[.,]\d{3})+|\d+)\s*km/i);
    if (thousandKm) pushFact(facts, 'mileage', `${thousandKm[1]} mil km`);
    else if (plainKm) pushFact(facts, 'mileage', `${plainKm[1]} km`);
  }

  const color = Object.keys(colorLabels).find((word) => new RegExp(`\\b${word}\\b`, 'i').test(text));
  if (color) pushFact(facts, 'color', colorLabels[color]);

  const motor = text.match(/motor\s+(\d+(?:[.,]\d+)?\s*L(?:\s*,\s*(?:tres|cuatro|cinco|seis|ocho)\s+cilindros)?)/i);
  if (motor) pushFact(facts, 'engine', motor[1]);

  if (/\b4x4\b/i.test(text)) pushFact(facts, 'drivetrain', '4x4');
  else if (/\b4x2\b/i.test(text)) pushFact(facts, 'drivetrain', '4x2');

  const passengers = text.match(/\b(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho)\s+pasajeros\b/i);
  if (passengers) {
    const count = passengerWords[passengers[1].toLowerCase()] ?? passengers[1];
    pushFact(facts, 'passengers', /tres filas/i.test(text) ? `${count}, tres filas` : count);
  }

  if (/único dueño/i.test(text)) pushFact(facts, 'owner', 'Único dueño');

  const title = text.match(/título\s+(\d+(?:\s*[–-]\s*\d+)?)/i);
  if (title) pushFact(facts, 'titleStatus', title[1].replace(/\s*[–-]\s*/g, '-'));

  if (/garantía full/i.test(text)) pushFact(facts, 'warranty', 'Full');
  else if (/garantía de fábrica/i.test(text)) pushFact(facts, 'warranty', 'De fábrica');

  return facts;
};
