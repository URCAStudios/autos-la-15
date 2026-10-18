import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';
import { loadEnv } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const projectId = env.SANITY_PROJECT_ID;
const dataset = env.SANITY_DATASET;
const apiVersion = env.SANITY_API_VERSION;

if (!projectId || !dataset || !apiVersion) {
  throw new Error('SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_API_VERSION are required.');
}

const sanityEntry = path.resolve(projectRoot, 'node_modules/sanity/lib/index.js');
const sanityDir = path.resolve(projectRoot, 'node_modules/sanity');
const reactCompilerRuntimeEntry = path.resolve(
  projectRoot,
  'node_modules/react-compiler-runtime/dist/index.js',
);
const styledComponentsEntry = path.resolve(
  projectRoot,
  'node_modules/styled-components/dist/styled-components.browser.esm.js',
);

function normalizeId(id) {
  return id.replace(/\\/g, '/').split('?')[0];
}

function isSanityRootId(id) {
  const normalized = normalizeId(id);
  return (
    id === 'sanity' ||
    normalized === 'sanity' ||
    normalized === normalizeId(sanityDir) ||
    normalized.endsWith('/node_modules/sanity') ||
    normalized.endsWith('/node_modules/sanity/package.json')
  );
}

function rewriteStudioAliases(alias) {
  if (!Array.isArray(alias)) {
    return;
  }

  for (const entry of alias) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const find = entry.find;
    const findSource = typeof find === 'string' ? find : find instanceof RegExp ? find.source : '';

    if (findSource === '^sanity$' || find === 'sanity') {
      entry.replacement = sanityEntry;
    }

    if (findSource === '^styled-components$' || find === 'styled-components') {
      entry.replacement = styledComponentsEntry;
    }
  }
}

/**
 * @sanity/astro aliases `sanity` to the package directory. Vite 7 then serves
 * `/node_modules/sanity/package.json?import`, which has no named ESM exports.
 */
function sanityStudioDevPlugin() {
  return {
    name: 'autosla15:sanity-studio-dev',
    apply: 'serve',
    enforce: 'pre',
    configResolved(config) {
      rewriteStudioAliases(config.resolve.alias);
    },
    resolveId(source) {
      if (isSanityRootId(source)) {
        return sanityEntry;
      }

      if (source === 'react/compiler-runtime') {
        return reactCompilerRuntimeEntry;
      }

      if (source === 'styled-components') {
        return styledComponentsEntry;
      }

      return null;
    },
  };
}

export default defineConfig({
  output: 'static',
  site: env.PUBLIC_SITE_URL || undefined,
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [sanityStudioDevPlugin()],
    define: {
      'import.meta.env.SANITY_PROJECT_ID': JSON.stringify(projectId),
      'import.meta.env.SANITY_DATASET': JSON.stringify(dataset),
      'import.meta.env.SANITY_API_VERSION': JSON.stringify(apiVersion),
    },
    resolve: {
      alias: [
        { find: /^sanity$/, replacement: sanityEntry },
        { find: 'react/compiler-runtime', replacement: reactCompilerRuntimeEntry },
        { find: /^styled-components$/, replacement: styledComponentsEntry },
      ],
      dedupe: ['react', 'react-dom', 'react-dom/client', 'styled-components', 'sanity', '@sanity/ui'],
    },
    optimizeDeps: {
      // Sanity lazy-loads these for UploadProgress / code blocks; pre-bundle to avoid
      // "504 Outdated Optimize Dep" when Vite re-optimizes during a dev session.
      include: [
        'sanity',
        'sanity/structure',
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/compiler-runtime',
        'react-compiler-runtime',
        'react-is',
        'styled-components',
        'use-sync-external-store/shim',
        'use-sync-external-store/shim/with-selector',
        'react-refractor',
        'refractor/bash',
        'refractor/javascript',
        'refractor/json',
        'refractor/jsx',
        'refractor/typescript',
        '@sanity/prism-groq',
      ],
    },
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/studio'),
    }),
    sanity({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      studioBasePath: '/studio',
      studioRouterHistory: 'hash',
    }),
  ],
});
