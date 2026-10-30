import { defineField, defineType } from 'sanity';
import { vehiclePageCopy } from '../../lib/vehiclePageCopy';

const stringField = (name: string, title: string, initialValue: string, description?: string) =>
  defineField({ name, title, type: 'string', description, initialValue });

export const vehiclePage = defineType({
  name: 'vehiclePage',
  title: 'Página: Vehículo',
  type: 'document',
  groups: [
    { name: 'actions', title: 'Botones', default: true },
    { name: 'sections', title: 'Secciones' },
    { name: 'visit', title: 'Visita' },
    { name: 'record', title: 'Datos del anuncio' },
    { name: 'facts', title: 'Datos en corto' },
    { name: 'status', title: 'Estados' },
    { name: 'photos', title: 'Fotos' },
  ],
  fields: [
    stringField('breadcrumbLabel', 'Miga de navegación', vehiclePageCopy.breadcrumbLabel, 'Enlace de regreso al catálogo.', ),
    stringField('detailsLinkLabel', 'Enlace en la tarjeta del catálogo', vehiclePageCopy.detailsLinkLabel),
    stringField('primaryButton', 'Botón consultar', vehiclePageCopy.primaryButton),
    stringField('secondaryButton', 'Botón agendar visita', vehiclePageCopy.secondaryButton),
    stringField('descriptionTitle', 'Título de la descripción', vehiclePageCopy.descriptionTitle),
    stringField('factsTitle', 'Título de los datos en corto', vehiclePageCopy.factsTitle, 'Se usa como título accesible de la ficha breve.'),
    stringField('recordTitle', 'Título de los datos del anuncio', vehiclePageCopy.recordTitle),
    stringField('relatedTitle', 'Título de otros vehículos', vehiclePageCopy.relatedTitle),
    stringField('visitTitle', 'Título de la visita', vehiclePageCopy.visitTitle),
    stringField('visitLead', 'Texto de la visita', vehiclePageCopy.visitLead, 'Puedes usar {vehicle} y {city}.'),
    stringField('mapLink', 'Enlace del mapa', vehiclePageCopy.mapLink, 'Puedes usar {city}.'),
    stringField('mapLinkWithoutCity', 'Enlace del mapa sin ciudad', vehiclePageCopy.mapLinkWithoutCity),
    stringField('featuredValue', 'Valor cuando el vehículo está destacado', vehiclePageCopy.featuredValue),
    stringField('modelIncluded', 'Enlace cuando hay modelo 3D', vehiclePageCopy.modelIncluded),
    stringField('modelMissing', 'Texto cuando no hay modelo 3D', vehiclePageCopy.modelMissing),
    defineField({
      name: 'recordLabels',
      title: 'Etiquetas de los datos del anuncio',
      type: 'object',
      group: 'record',
      fields: [
        stringField('name', 'Nombre', vehiclePageCopy.recordLabels.name),
        stringField('year', 'Año', vehiclePageCopy.recordLabels.year),
        stringField('price', 'Precio', vehiclePageCopy.recordLabels.price),
        stringField('status', 'Estado', vehiclePageCopy.recordLabels.status),
        stringField('badge', 'Insignia', vehiclePageCopy.recordLabels.badge),
        stringField('featured', 'Destacado', vehiclePageCopy.recordLabels.featured),
        stringField('photos', 'Fotos', vehiclePageCopy.recordLabels.photos),
        stringField('model3d', 'Modelo 3D', vehiclePageCopy.recordLabels.model3d),
      ],
    }),
    defineField({
      name: 'factLabels',
      title: 'Etiquetas de los datos en corto',
      type: 'object',
      group: 'facts',
      description: 'Los valores salen de la descripción del vehículo. Aquí solo se editan los nombres de cada dato.',
      fields: [
        stringField('type', 'Tipo', vehiclePageCopy.factLabels.type),
        stringField('condition', 'Condición', vehiclePageCopy.factLabels.condition),
        stringField('mileage', 'Kilometraje', vehiclePageCopy.factLabels.mileage),
        stringField('color', 'Color', vehiclePageCopy.factLabels.color),
        stringField('engine', 'Motor', vehiclePageCopy.factLabels.engine),
        stringField('drivetrain', 'Tracción', vehiclePageCopy.factLabels.drivetrain),
        stringField('passengers', 'Pasajeros', vehiclePageCopy.factLabels.passengers),
        stringField('owner', 'Dueño', vehiclePageCopy.factLabels.owner),
        stringField('titleStatus', 'Título', vehiclePageCopy.factLabels.titleStatus),
        stringField('warranty', 'Garantía', vehiclePageCopy.factLabels.warranty),
      ],
    }),
    defineField({
      name: 'statusLabels',
      title: 'Nombres de los estados',
      type: 'object',
      group: 'status',
      fields: [
        stringField('available', 'Disponible', vehiclePageCopy.statusLabels.available),
        stringField('reserved', 'Reservado', vehiclePageCopy.statusLabels.reserved),
        stringField('sold', 'Vendido', vehiclePageCopy.statusLabels.sold),
        stringField('archived', 'Archivado', vehiclePageCopy.statusLabels.archived),
      ],
    }),
    stringField('enlargePhoto', 'Ampliar foto', vehiclePageCopy.enlargePhoto),
    stringField('closePhoto', 'Cerrar foto', vehiclePageCopy.closePhoto),
    stringField('previousPhoto', 'Foto anterior', vehiclePageCopy.previousPhoto),
    stringField('nextPhoto', 'Foto siguiente', vehiclePageCopy.nextPhoto),
    stringField('photoLabel', 'Etiqueta de cada foto', vehiclePageCopy.photoLabel, 'Puedes usar {number}.'),
  ].map((field) => {
    const name = 'name' in field ? field.name : '';
    const group =
      ['breadcrumbLabel', 'detailsLinkLabel', 'primaryButton', 'secondaryButton'].includes(name) ? 'actions'
      : ['descriptionTitle', 'factsTitle', 'recordTitle', 'relatedTitle'].includes(name) ? 'sections'
      : ['visitTitle', 'visitLead', 'mapLink', 'mapLinkWithoutCity'].includes(name) ? 'visit'
      : ['featuredValue', 'modelIncluded', 'modelMissing'].includes(name) ? 'record'
      : ['enlargePhoto', 'closePhoto', 'previousPhoto', 'nextPhoto', 'photoLabel'].includes(name) ? 'photos'
      : undefined;
    return group ? { ...field, group } : field;
  }),
  preview: {
    prepare() {
      return { title: 'Página: Vehículo' };
    },
  },
});
