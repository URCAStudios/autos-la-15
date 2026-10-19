/**
 * Renders odd/handoff/Google-Autos-La-15-Guia-Analytics-Search-Cliente.html to PDF (A4).
 * Usage: node odd/handoff/render-google-analytics-guia-pdf.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'Google-Autos-La-15-Guia-Analytics-Search-Cliente.html');
const pdfPath = path.join(__dirname, 'Google-Autos-La-15-Guia-Analytics-Search-Cliente.pdf');
const htmlUrl = `file://${htmlPath.replace(/\\/g, '/')}`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.emulateMedia({ media: 'print' });
await page.goto(htmlUrl, { waitUntil: 'networkidle' });
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
await browser.close();
console.log('Wrote', pdfPath);
