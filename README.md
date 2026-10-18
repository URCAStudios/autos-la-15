# Autos La 15 — sitio en producción

Sitio estático **Astro 6** con **Sanity Studio** embebido en `/studio`. Build: `npm run build` → `dist/`.

| Entorno | URL |
|---------|-----|
| **Producción (canónica)** | https://autosla15.com |
| **Studio** | https://autosla15.com/studio |
| **Pages (respaldo)** | https://autos-la-15.pages.dev |

Guía para el cliente (sin detalle técnico): [odd/handoff/autosla15-real-site.md](odd/handoff/autosla15-real-site.md) · PDF: [odd/handoff/Autos-La-15-Entrega-Sitio.pdf](odd/handoff/Autos-La-15-Entrega-Sitio.pdf)

## Hosting y dominio

- **Cloudflare Pages** — proyecto `autos-la-15`, rama de producción `main` (Git: repositorio **público** [URCAStudios/autos-la-15](https://github.com/URCAStudios/autos-la-15)).
- **Cuenta cliente** — account ID `4d7b9cf1dfdca6bf57d5e857bc381f8d` (facturación del dominio en esa cuenta).
- **Dominio** — `autosla15.com` (apex canónico); `www` → redirect 301 al apex.
- Guías PDF onboarding cliente: `odd/handoff/Cloudflare-Autos-La-15-Guia-Cliente.pdf`, `odd/handoff/Cloudflare-Autos-La-15-Guia-Dominio-Cliente.pdf`.

## Variables de entorno (Pages — Production y Preview)

| Variable | Valor |
|----------|--------|
| `SANITY_PROJECT_ID` | `7mz74qpp` |
| `SANITY_DATASET` | `production` |
| `SANITY_API_VERSION` | `2026-09-21` |
| `NODE_VERSION` | `22` |
| `PUBLIC_SITE_URL` | `https://autosla15.com` |

Tras cambiar la URL pública: actualizar `PUBLIC_SITE_URL`, CORS + `sanity deploy --external`, redeploy Pages.

## Sanity (producción)

CORS con credenciales: `https://autosla15.com` (opcional mantener `https://autos-la-15.pages.dev` para pruebas).

```bash
npx sanity cors add https://autosla15.com --credentials -p 7mz74qpp -y
npx sanity@6.15.0 deploy --external --url https://autosla15.com/studio -y
```

`basePath`: `/studio` en `sanity.cli.ts`.

## CMS → redeploy

Publicar `car` o `siteSettings` en Sanity dispara un webhook → **Cloudflare Pages deploy hook** (rama `main`).

Recrear webhook localmente (no commitear secretos):

```bash
# SANITY_TOKEN + URL del deploy hook de Pages en .env — ver scripts/setup-cms-redeploy-webhook.mjs
node --env-file=.env scripts/setup-cms-redeploy-webhook.mjs
```

Requiere `PAGES_DEPLOY_HOOK_URL` en `.env` (URL del deploy hook de **Pages**, rama `main`).

## Desarrollo local

1. `cp .env.example .env` — `SANITY_*`, `SANITY_TOKEN` (scripts), `PUBLIC_SITE_URL` opcional.
2. `npm install`
3. `npm run dev` — Studio en `/studio`
4. `npm run check && npm run build`

| Script | Uso |
|--------|-----|
| `npm run dev` | Servidor de desarrollo |
| `npm run check` | `astro check` |
| `npm run build` | Salida estática `dist/` |
| `npm run seed:sanity` | Semilla CMS (`SANITY_TOKEN`) |
| `npm run migrate:car-order-rank` | Migra `order` legado → `orderRank` (una vez tras deploy; requiere `SANITY_TOKEN`) |
| `npm run migrate:car-images` | Migra campo `image` → array `images` |

### Orden del catálogo (Studio)

Los vehículos se ordenan en **Studio → Vehículos** (drag-and-drop). El carrusel de la home usa el mismo `orderRank`.

Tras el primer deploy de esta funcionalidad, ejecutar `npm run migrate:car-order-rank` (o abrir `/studio` con sesión de editor para que el plugin normalice datos legados). Publicar borradores pendientes si el estado lo indica.

## Rama y despliegue

- **`main`** → producción (Pages).
- Trabajo en ramas feature → PR a `main`.

No commitear `.env` ni tokens.

## Verificación rápida

- https://autosla15.com/
- https://autosla15.com/studio
- https://autosla15.com/sitemap-index.xml
- https://www.autosla15.com/ → apex

## Regenerar PDF de entrega al cliente

```bash
node odd/handoff/render-handoff-pdf.mjs
```
