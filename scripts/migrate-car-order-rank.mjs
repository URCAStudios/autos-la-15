import { createClient } from '@sanity/client';
import {
  assignCarPresentationOrder,
  removeLegacyCarOrderFields,
} from './lib/assign-car-presentation-order.mjs';

const requiredEnv = ['SANITY_PROJECT_ID', 'SANITY_TOKEN', 'SANITY_DATASET', 'SANITY_API_VERSION'];

for (const name of requiredEnv) {
  if (!process.env[name]?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION,
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

const rewriteAll = process.argv.includes('--all');

const main = async () => {
  const updated = await assignCarPresentationOrder(client, { onlyMissing: !rewriteAll });
  const cleaned = await removeLegacyCarOrderFields(client);

  console.log(
    rewriteAll
      ? `Reassigned presentation order for ${updated} vehicle(s).`
      : `Assigned orderRank to ${updated} vehicle(s) missing it.`,
  );
  if (cleaned > 0) {
    console.log(`Removed legacy "order" field from ${cleaned} vehicle(s).`);
  }
};

main().catch((error) => {
  console.error(`Car order migration failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
