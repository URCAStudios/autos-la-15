import { createClient } from '@sanity/client';

const required = ['SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_API_VERSION'];
for (const name of required) {
  if (!process.env[name]?.trim()) throw new Error(`Missing ${name}`);
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION,
  useCdn: false,
});

const summary = await client.fetch(`{
  "cars": count(*[_type == "car"]),
  "siteSettings": count(*[_type == "siteSettings"]),
  "homePage": count(*[_type == "homePage"]),
  "vehiclePage": count(*[_type == "vehiclePage"]),
  "heroTitle": *[_type == "homePage"][0].hero.intro.title,
  "hasLogo": defined(*[_type == "siteSettings"][0].identity.logo.asset)
}`);

console.log(JSON.stringify(summary, null, 2));
