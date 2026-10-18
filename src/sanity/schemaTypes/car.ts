import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';
import { defineField, defineType } from 'sanity';

export const car = defineType({
  name: 'car',
  title: 'Vehículo',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'car' }),
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'name', title: 'Nombre del vehículo', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'year', title: 'Año', type: 'number', validation: (Rule) => Rule.required().integer().min(1900) }),
    defineField({ name: 'price', title: 'Precio', type: 'number', validation: (Rule) => Rule.required().positive() }),
    defineField({ name: 'description', title: 'Descripción', type: 'text', rows: 5 }),
    defineField({
      name: 'images',
      title: 'Imágenes',
      type: 'array',
      options: { layout: 'grid' },
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Texto alternativo',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1).error('Agrega al menos 1 imagen del vehículo'),
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: 'Disponible', value: 'available' },
          { title: 'Reservado', value: 'reserved' },
          { title: 'Vendido', value: 'sold' },
          { title: 'Archivado', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'available',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'featured', title: 'Destacado', type: 'boolean', initialValue: false }),
    defineField({ name: 'badge', title: 'Insignia', type: 'string', description: 'Texto breve como 0 KM o Único dueño.' }),
    defineField({ name: 'whatsappMessage', title: 'Mensaje de WhatsApp', type: 'text', rows: 3 }),
    defineField({ name: 'model3d', title: 'Modelo 3D', type: 'file', options: { accept: '.glb,.gltf,model/gltf-binary,model/gltf+json' } }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'year', media: 'images.0' },
    prepare: ({ title, subtitle, media }) => ({ title, subtitle: subtitle ? String(subtitle) : undefined, media }),
  },
});
