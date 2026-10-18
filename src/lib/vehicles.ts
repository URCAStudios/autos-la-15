export type VehicleIdentity = {
  _id: string;
  name: string;
};

export type VehicleFact = {
  label: string;
  value: string;
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

export const statusLabel = (status: string) => {
  if (status === 'reserved') return 'Reservado';
  if (status === 'sold') return 'Vendido';
  if (status === 'archived') return 'Archivado';
  return 'Disponible';
};

const pushFact = (facts: VehicleFact[], label: string, value: string) => {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (!clean || facts.some((fact) => fact.label === label)) return;
  facts.push({ label, value: clean });
};

/** Reads only phrases that are already in the vehicle description. */
export const descriptionFacts = (description: string | undefined): VehicleFact[] => {
  const text = description?.trim() ?? '';
  if (!text) return [];
  const facts: VehicleFact[] = [];

  if (/\bpickup\b/i.test(text)) pushFact(facts, 'Tipo', 'Pickup');

  if (/\b0\s*km\b/i.test(text)) {
    pushFact(facts, 'Condición', '0 km');
  } else {
    const thousandKm = text.match(/(\d+(?:[.,]\d+)?)\s*mil\s*km/i);
    const plainKm = text.match(/(\d{1,3}(?:[.,]\d{3})+|\d+)\s*km/i);
    if (thousandKm) pushFact(facts, 'Kilometraje', `${thousandKm[1]} mil km`);
    else if (plainKm) pushFact(facts, 'Kilometraje', `${plainKm[1]} km`);
  }

  const color = Object.keys(colorLabels).find((word) => new RegExp(`\\b${word}\\b`, 'i').test(text));
  if (color) pushFact(facts, 'Color', colorLabels[color]);

  const motor = text.match(/motor\s+(\d+(?:[.,]\d+)?\s*L(?:\s*,\s*(?:tres|cuatro|cinco|seis|ocho)\s+cilindros)?)/i);
  if (motor) pushFact(facts, 'Motor', motor[1]);

  if (/\b4x4\b/i.test(text)) pushFact(facts, 'Tracción', '4x4');
  else if (/\b4x2\b/i.test(text)) pushFact(facts, 'Tracción', '4x2');

  const passengers = text.match(/\b(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho)\s+pasajeros\b/i);
  if (passengers) {
    const count = passengerWords[passengers[1].toLowerCase()] ?? passengers[1];
    pushFact(facts, 'Pasajeros', /tres filas/i.test(text) ? `${count}, tres filas` : count);
  }

  if (/único dueño/i.test(text)) pushFact(facts, 'Dueño', 'Único dueño');

  const title = text.match(/título\s+(\d+(?:\s*[–-]\s*\d+)?)/i);
  if (title) pushFact(facts, 'Título', title[1].replace(/\s*[–-]\s*/g, '-'));

  if (/garantía full/i.test(text)) pushFact(facts, 'Garantía', 'Full');
  else if (/garantía de fábrica/i.test(text)) pushFact(facts, 'Garantía', 'De fábrica');

  return facts;
};
