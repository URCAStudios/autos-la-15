# Google Search — logo y visibilidad en Venezuela

## Problema reportado

- En resultados de Google no aparece el favicon/logo del sitio (icono genérico).
- La búsqueda **«Autos la 15»** no muestra bien el sitio en Venezuela (o no aparece).

## Causas técnicas encontradas (producción antes del fix)

1. **`/robots.txt` y `/favicon.ico` no existían** — Cloudflare Pages devolvía el HTML de la home (`not_found_handling`), así que Google no podía leer un robots válido ni el favicon clásico en la raíz.
2. **Favicon solo en CDN de Sanity** — Google prefiere iconos en el **mismo dominio** que la página (`autosla15.com`), múltiplo de 48px.
3. **Sitemap incluía `/studio/`** — ruido para el rastreo; el CMS no debe indexarse.

## Cambios en código

- `public/robots.txt` con `Sitemap` y `Disallow: /studio/`
- `public/favicon.ico` y `public/apple-touch-icon.png` (desde el logo local)
- `<head>`: iconos en dominio propio, `og:url`, `og:locale` `es_VE`, `hreflang`
- JSON-LD `AutoDealer`: `logo` e `image` en `autosla15.com`
- `@astrojs/sitemap`: excluir `/studio/`

## Tras el deploy (operativo — no automatizable en repo)

1. **Google Search Console** — propiedad `https://autosla15.com`, verificar dominio, enviar sitemap `https://autosla15.com/sitemap-index.xml`.
2. **Inspección de URL** — solicitar indexación de la home.
3. **Perfil de Google Business** — Maracaibo / Ciudad Ojeda, mismo nombre «Autos la 15», web `https://autosla15.com`, Instagram enlazado.
4. **Favicon en resultados** — puede tardar **días o semanas** tras el deploy; comprobar en Search Console → Apariencia en el buscador → Favicon.
5. **Venezuela** — en GSC, revisar informes de rendimiento filtrando país **Venezuela**; el ranking de marca mejora con GSC + GBP + enlaces (Instagram, WhatsApp, directorios locales).

## Verificación rápida post-deploy

```bash
curl -sI https://autosla15.com/robots.txt    # Content-Type: text/plain
curl -sI https://autosla15.com/favicon.ico   # Content-Type: image/*
curl -s https://autosla15.com/robots.txt     # debe listar Sitemap
```
