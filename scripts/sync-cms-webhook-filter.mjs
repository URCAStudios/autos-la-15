/**
 * Updates the CMS rebuild webhook filter to include all published document types.
 *
 * Usage: node --env-file=.env scripts/sync-cms-webhook-filter.mjs
 */
const projectId = process.env.SANITY_PROJECT_ID;
const token = process.env.SANITY_AUTH_TOKEN?.trim() || process.env.SANITY_TOKEN?.trim();
const hookName = 'Production rebuild (CMS publish)';
const documentFilter = '_type in ["car", "siteSettings", "homePage", "vehiclePage"]';

const required = ['SANITY_PROJECT_ID'];
for (const key of required) {
  if (!process.env[key]?.trim()) {
    console.error(`Missing ${key}`);
    process.exit(1);
  }
}

if (!token) {
  console.error('Missing SANITY_AUTH_TOKEN or SANITY_TOKEN');
  process.exit(1);
}

const hooksApiVersion = process.env.SANITY_HOOKS_API_VERSION ?? 'v2021-06-07';
const hooksBase = `https://${projectId}.api.sanity.io/${hooksApiVersion}/hooks/projects/${projectId}`;

const listResponse = await fetch(hooksBase, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!listResponse.ok) {
  console.error(`List failed (${listResponse.status}): ${await listResponse.text()}`);
  process.exit(1);
}

const hooks = await listResponse.json();
const hook = hooks.find((entry) => entry.name === hookName);
if (!hook) {
  console.error(`Webhook not found: "${hookName}". Run setup-cms-redeploy-webhook.mjs first.`);
  process.exit(1);
}

if (hook.rule?.filter === documentFilter) {
  console.log(`Webhook filter already correct (id=${hook.id}).`);
  process.exit(0);
}

const response = await fetch(`${hooksBase}/${hook.id}`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...hook,
    rule: {
      ...hook.rule,
      filter: documentFilter,
    },
  }),
});

if (!response.ok) {
  console.error(`Update failed (${response.status}): ${await response.text()}`);
  process.exit(1);
}

console.log(`Updated webhook id=${hook.id} filter="${documentFilter}"`);
