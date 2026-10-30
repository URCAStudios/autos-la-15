/**
 * Creates or updates a Sanity project webhook that POSTs to a hosting deploy hook URL.
 *
 * Required env (use --env-file=.env locally; never commit secrets):
 *   SANITY_PROJECT_ID, SANITY_TOKEN, PAGES_DEPLOY_HOOK_URL
 *
 * PAGES_DEPLOY_HOOK_URL must be a Pages hook:
 *   https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/<uuid>
 * (Recreate the hook in Cloudflare if the Pages project was deleted/recreated.)
 *
 * Usage:
 *   node --env-file=.env scripts/setup-cms-redeploy-webhook.mjs
 */
import { execFileSync } from 'node:child_process';

const projectId = process.env.SANITY_PROJECT_ID;
const token = process.env.SANITY_TOKEN;
const deployHookUrl = process.env.PAGES_DEPLOY_HOOK_URL?.trim();
const hookName = 'Production rebuild (CMS publish)';
const legacyHookNamesToDelete = ['Vercel production rebuild (CMS publish)'];
const documentFilter = '_type in ["car", "siteSettings", "homePage", "vehiclePage"]';

const required = ['SANITY_PROJECT_ID', 'SANITY_TOKEN'];
for (const key of required) {
  if (!process.env[key]?.trim()) {
    console.error(`Missing ${key}. Set it in .env (see scripts/setup-cms-redeploy-webhook.mjs).`);
    process.exit(1);
  }
}
if (!deployHookUrl) {
  console.error(
    'Missing PAGES_DEPLOY_HOOK_URL. Create a Cloudflare Pages deploy hook (branch main) and add the URL to .env.',
  );
  process.exit(1);
}

const hooksApiVersion = process.env.SANITY_HOOKS_API_VERSION ?? 'v2021-06-07';
const hooksBase = `https://${projectId}.api.sanity.io/${hooksApiVersion}/hooks/projects/${projectId}`;

const listResponse = await fetch(hooksBase, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!listResponse.ok) {
  console.error(`Sanity webhook list failed (${listResponse.status}): ${await listResponse.text()}`);
  process.exit(1);
}

const hooks = await listResponse.json();

for (const legacyName of legacyHookNamesToDelete) {
  const legacy = hooks.find((hook) => hook.name === legacyName);
  if (!legacy) continue;
  const del = await fetch(`${hooksBase}/${legacy.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (del.ok) {
    console.log(`Deleted legacy webhook id=${legacy.id} name="${legacy.name}"`);
  } else {
    console.warn(`Could not delete legacy webhook "${legacyName}" (${del.status})`);
  }
}

const webhookBody = {
  name: hookName,
  url: deployHookUrl,
  dataset: process.env.SANITY_DATASET ?? 'production',
  description: 'Triggers a production rebuild when car, siteSettings, homePage, or vehiclePage documents are published.',
  type: 'document',
  apiVersion: hooksApiVersion,
  rule: {
    on: ['create', 'update', 'delete'],
    filter: documentFilter,
    projection: '{_id}',
  },
  httpMethod: 'POST',
};

const existing = hooks.find((hook) => hook.name === hookName);
if (existing) {
  const urlMatches = existing.url === deployHookUrl;
  const filterMatches = existing.rule?.filter === documentFilter;
  if (urlMatches && filterMatches) {
    console.log(`Webhook already up to date id=${existing.id} name="${existing.name}"`);
    process.exit(0);
  }

  const response = await fetch(`${hooksBase}/${existing.id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...existing, ...webhookBody, id: existing.id }),
  });

  if (!response.ok) {
    console.error(`Sanity webhook update failed (${response.status}): ${await response.text()}`);
    process.exit(1);
  }

  console.log(`Updated Sanity webhook id=${existing.id} name="${hookName}"`);
  process.exit(0);
}

const response = await fetch(hooksBase, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(webhookBody),
});

if (!response.ok) {
  const text = await response.text();
  if (response.status === 409 && text.includes('already exists')) {
    try {
      execFileSync('npx', ['sanity', 'hooks', 'delete', hookName], {
        encoding: 'utf8',
        stdio: 'inherit',
        env: process.env,
      });
    } catch {
      console.error(
        `Webhook "${hookName}" exists but could not be replaced automatically. Run: npx sanity hooks delete "${hookName}"`,
      );
      process.exit(1);
    }
    const retry = await fetch(hooksBase, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookBody),
    });
    if (!retry.ok) {
      console.error(`Sanity webhook create failed (${retry.status}): ${await retry.text()}`);
      process.exit(1);
    }
    const hook = await retry.json();
    console.log(`Created Sanity webhook id=${hook.id} name="${hook.name}"`);
    process.exit(0);
  }
  console.error(`Sanity webhook create failed (${response.status}): ${text}`);
  process.exit(1);
}

const hook = await response.json();
console.log(`Created Sanity webhook id=${hook.id} name="${hook.name}"`);
