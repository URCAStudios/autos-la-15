/**
 * Creates the vehicle page copy document when it does not exist yet.
 * Does not overwrite edits already saved in Sanity.
 *
 * Usage: node --env-file=.env scripts/seed-vehicle-page.mjs
 *        npx sanity exec scripts/seed-vehicle-page.mjs --with-user-token
 */
import { createClient } from '@sanity/client';
import { vehiclePageCopy } from '../src/lib/vehiclePageCopy.ts';

const token = process.env.SANITY_AUTH_TOKEN?.trim() || process.env.SANITY_TOKEN?.trim();
const required = ['SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_API_VERSION'];
for (const name of required) {
  if (!process.env[name]?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}
if (!token) {
  throw new Error('Missing SANITY_AUTH_TOKEN or SANITY_TOKEN');
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION,
  token,
  useCdn: false,
});

const result = await client.createIfNotExists({
  _id: 'vehiclePage',
  _type: 'vehiclePage',
  ...vehiclePageCopy,
});

console.log(`vehiclePage ready (${result._id})`);
