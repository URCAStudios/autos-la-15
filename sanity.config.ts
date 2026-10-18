import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { defineConfig, type ConfigContext } from 'sanity';
import { structureTool, type StructureBuilder } from 'sanity/structure';
import { carDocumentNormalizationPlugin } from './src/sanity/plugins/carDocumentNormalization';
import { schemaTypes } from './src/sanity/schemaTypes';

const viteEnv = import.meta.env as Record<string, string | undefined>;
const nodeEnv = typeof process === 'undefined' ? undefined : process.env;
const projectId = viteEnv.SANITY_PROJECT_ID ?? nodeEnv?.SANITY_PROJECT_ID;
const dataset = viteEnv.SANITY_DATASET ?? nodeEnv?.SANITY_DATASET ?? 'production';

if (!projectId) {
  throw new Error('SANITY_PROJECT_ID is required to load Sanity Studio.');
}

const singletonIds = new Set(['siteSettings', 'homePage']);

const structure = (S: StructureBuilder, context: ConfigContext) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Configuración del sitio')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.listItem()
        .title('Página: Inicio')
        .id('homePage')
        .child(S.document().schemaType('homePage').documentId('homePage')),
      S.divider(),
      orderableDocumentListDeskItem({
        type: 'car',
        title: 'Vehículos',
        S,
        context,
      }),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() ?? '';
        return !singletonIds.has(id) && id !== 'car';
      }),
    ]);

export default defineConfig({
  name: 'autosla15',
  title: 'Autos La 15',
  projectId,
  dataset,
  plugins: [structureTool({ structure }), carDocumentNormalizationPlugin()],
  schema: {
    types: schemaTypes,
  },
});
