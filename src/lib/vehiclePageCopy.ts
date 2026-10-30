export const vehiclePageCopy = {
  breadcrumbLabel: 'Vehículos',
  detailsLinkLabel: 'Ver ficha',
  primaryButton: 'Consultar vehículo',
  secondaryButton: 'Agendar visita',
  factsTitle: 'Datos en corto',
  descriptionTitle: 'Descripción',
  recordTitle: 'Datos del anuncio',
  visitTitle: 'Coordinar la visita',
  visitLead: '{vehicle} se ve en {city}.',
  mapLink: 'Ver el mapa de {city}',
  mapLinkWithoutCity: 'Ver el mapa',
  relatedTitle: 'Otros anuncios del lote',
  enlargePhoto: 'Ampliar foto',
  closePhoto: 'Cerrar',
  previousPhoto: 'Foto anterior',
  nextPhoto: 'Foto siguiente',
  photoLabel: 'Foto {number}',
  featuredValue: 'Sí',
  modelIncluded: 'Abrir modelo',
  modelMissing: 'No incluido',
  recordLabels: {
    name: 'Nombre',
    year: 'Año',
    price: 'Precio',
    status: 'Estado',
    badge: 'Insignia',
    featured: 'Destacado',
    photos: 'Fotos',
    model3d: 'Modelo 3D',
  },
  factLabels: {
    type: 'Tipo',
    condition: 'Condición',
    mileage: 'Kilometraje',
    color: 'Color',
    engine: 'Motor',
    drivetrain: 'Tracción',
    passengers: 'Pasajeros',
    owner: 'Dueño',
    titleStatus: 'Título',
    warranty: 'Garantía',
  },
  statusLabels: {
    available: 'Disponible',
    reserved: 'Reservado',
    sold: 'Vendido',
    archived: 'Archivado',
  },
};

type Copy = typeof vehiclePageCopy;

const text = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

const mergeGroup = <T extends Record<string, string>>(fallback: T, value: unknown): T => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    Object.entries(fallback).map(([key, label]) => [key, text(source[key], label)]),
  ) as T;
};

export const resolveVehiclePageCopy = (input: Partial<Copy> | null | undefined): Copy => ({
  breadcrumbLabel: text(input?.breadcrumbLabel, vehiclePageCopy.breadcrumbLabel),
  detailsLinkLabel: text(input?.detailsLinkLabel, vehiclePageCopy.detailsLinkLabel),
  primaryButton: text(input?.primaryButton, vehiclePageCopy.primaryButton),
  secondaryButton: text(input?.secondaryButton, vehiclePageCopy.secondaryButton),
  factsTitle: text(input?.factsTitle, vehiclePageCopy.factsTitle),
  descriptionTitle: text(input?.descriptionTitle, vehiclePageCopy.descriptionTitle),
  recordTitle: text(input?.recordTitle, vehiclePageCopy.recordTitle),
  visitTitle: text(input?.visitTitle, vehiclePageCopy.visitTitle),
  visitLead: text(input?.visitLead, vehiclePageCopy.visitLead),
  mapLink: text(input?.mapLink, vehiclePageCopy.mapLink),
  mapLinkWithoutCity: text(input?.mapLinkWithoutCity, vehiclePageCopy.mapLinkWithoutCity),
  relatedTitle: text(input?.relatedTitle, vehiclePageCopy.relatedTitle),
  enlargePhoto: text(input?.enlargePhoto, vehiclePageCopy.enlargePhoto),
  closePhoto: text(input?.closePhoto, vehiclePageCopy.closePhoto),
  previousPhoto: text(input?.previousPhoto, vehiclePageCopy.previousPhoto),
  nextPhoto: text(input?.nextPhoto, vehiclePageCopy.nextPhoto),
  photoLabel: text(input?.photoLabel, vehiclePageCopy.photoLabel),
  featuredValue: text(input?.featuredValue, vehiclePageCopy.featuredValue),
  modelIncluded: text(input?.modelIncluded, vehiclePageCopy.modelIncluded),
  modelMissing: text(input?.modelMissing, vehiclePageCopy.modelMissing),
  recordLabels: mergeGroup(vehiclePageCopy.recordLabels, input?.recordLabels),
  factLabels: mergeGroup(vehiclePageCopy.factLabels, input?.factLabels),
  statusLabels: mergeGroup(vehiclePageCopy.statusLabels, input?.statusLabels),
});
