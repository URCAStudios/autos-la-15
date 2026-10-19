# Autos La 15 — guía para el cliente

Su sitio web ya está publicado en internet. Esta guía explica **cómo verlo** y **cómo actualizar vehículos y textos** sin conocimientos técnicos.

---

## Sus enlaces

| Qué | Dirección |
|-----|-----------|
| **Sitio web** (lo que ven sus clientes) | https://autosla15.com |
| **Panel de edición** (donde usted cambia contenido) | https://autosla15.com/studio |
| **Código del proyecto** (repositorio público) | https://github.com/URCAStudios/autos-la-15 |

Si escribe **www.autosla15.com**, llegará igual al sitio principal.

El enlace de **GitHub** es un repositorio **público**: puede abrirlo en el navegador y leer el archivo **README.md** (hosting en Cloudflare, dominio, instrucciones técnicas) **sin** contraseña ni cuenta de GitHub. **Usted no necesita usarlo** en el día a día; sirve si trabaja con un programador, si un técnico pide referencia del proyecto, o si quiere comprobar que el código está disponible para consulta.

---

## Entrar al panel de edición

1. Abra **https://autosla15.com/studio** en el navegador (Chrome, Edge o Safari).
2. Inicie sesión con el **correo y contraseña** que le haya dado el equipo (cuenta del panel de contenido).
3. Si no puede entrar, pida al administrador que lo **invite** de nuevo.

Si ve un mensaje en inglés pidiendo “conectar” el panel, **avise al desarrollador**; es un ajuste de una sola vez del lado técnico.

---

## Qué puede cambiar

- **Vehículos:** nombre, año, precio, descripción, foto, si está disponible / reservado / vendido, mensaje de WhatsApp, etc.
- **Datos del negocio:** textos de la página de inicio, contacto, horarios, direcciones, redes sociales.

---

## Cómo publicar un cambio en la web

1. Edite lo que necesite en el panel.
2. Pulse **Publish** (Publicar). **Guardar borrador no actualiza la página pública.**
3. Espere **1 a 3 minutos**.
4. Abra **https://autosla15.com** y actualice la página (si no se ve, pruebe recarga forzada o una ventana privada).

---

## WhatsApp

Los botones verdes del sitio usan los números y mensajes que configure en el panel. Después de cambiar un vehículo, **publíquelo** y pruebe un enlace en el celular.

---

## Google Analytics y Search Console (cuentas suyas)

Para ver **cuántas personas visitan** autosla15.com y cómo aparece el sitio en **búsquedas de Google**, las herramientas deben crearse en **su cuenta de Google (Gmail del negocio)**, no en la del desarrollador. El sitio y el panel `/studio` **siguen funcionando** aunque esto aún no esté hecho.

| Herramienta | Para qué sirve | Dónde entra usted |
|-------------|----------------|-------------------|
| **Google Analytics 4** | Estadísticas de visitas al sitio | [analytics.google.com](https://analytics.google.com) |
| **Google Search Console** | Avisos y rendimiento en Google Search | [search.google.com/search-console](https://search.google.com/search-console) |

**Guía paso a paso (PDF):** pida al desarrollador el archivo **`Google-Autos-La-15-Guia-Analytics-Search-Cliente.pdf`** (también en el repositorio: `odd/handoff/`). Ahí se explica solo lo que **usted** debe hacer: crear las propiedades, enviar el código **G-…** al desarrollador, copiar el **TXT** de verificación de Search Console e **invitar** al desarrollador (`furdac14@gmail.com`) como administrador en Analytics y con permiso completo en Search Console.

**Lo que hace el desarrollador después** (usted no tiene que hacerlo): conectar la medición en el hosting Cloudflare, publicar el registro DNS del TXT, enviar el mapa del sitio a Google y comprobar que todo funciona.

**Orden sugerido:** complete la guía de Google **antes o junto** con la entrega final del sitio, si quiere que las estadísticas empiecen desde el lanzamiento. Si ya recibió la guía principal de este documento, puede usar el sitio y el panel mientras termina Google.

---

## Si algo no funciona

| Situación | Qué hacer |
|-----------|-----------|
| No veo el cambio en la web | ¿Pulsó **Publish**? ¿Esperó unos minutos? Pruebe recargar la página. |
| No puedo entrar al panel | Pida invitación al administrador o contacte al desarrollador. |
| Error al subir una foto | Use JPG, PNG o WebP; no muy pesada; reintente. |
| Pantalla confusa o error | Tome una **captura de pantalla** y envíela al desarrollador. No pulse “Eliminar” ni “Delete”. |

---

## Ayuda

Para dudas sobre el sitio o el panel de edición, contacte al desarrollador del proyecto Autos La 15.

Si alguien de su equipo necesita información técnica, comparta el enlace público de GitHub de la tabla anterior; dentro del repositorio, abra **README.md**.

---

*Autos La 15 · Guía para el cliente · Octubre 2026*
