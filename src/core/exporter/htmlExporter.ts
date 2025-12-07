/**
 * HTML Exporter
 * Exports Netral content to standalone HTML files using ReactDOMServer
 * This ensures PIXEL-PERFECT consistency with the preview
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { StaticNetralRenderer } from '../renderer/StaticNetralRenderer';
import { parseNetralDocument } from '../parser/netralParser';
import { getTheme, generateThemeCSS } from '../themes/themes';

/**
 * Generate a complete HTML document from Netral syntax
 * Uses the EXACT SAME React components as the preview for pixel-perfect consistency
 */
export function exportToHtml(content: string, title: string = 'Netral Document'): string {
  const doc = parseNetralDocument(content);
  const theme = getTheme(doc.theme);
  const themeCSS = generateThemeCSS(theme);

  // Render the React component to static HTML
  const renderedContent = renderToStaticMarkup(
    createElement(StaticNetralRenderer, { content })
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="Netral Block">
  <title>${escapeHtml(doc.title || title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* Reset */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: ${theme.fontFamily};
      line-height: 1.6;
      min-height: 100vh;
    }
    
    /* Tailwind-like utility classes used by the React components */
    .min-h-full { min-height: 100%; }
    .h-full { height: 100%; }
    .w-full { width: 100%; }
    .max-w-sm { max-width: 24rem; }
    .max-w-xs { max-width: 20rem; }
    .max-w-md { max-width: 28rem; }
    .max-w-2xl { max-width: 42rem; }
    .max-w-3xl { max-width: 48rem; }
    .max-w-4xl { max-width: 56rem; }
    .max-w-5xl { max-width: 64rem; }
    .max-w-6xl { max-width: 72rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    
    /* Flexbox */
    .flex { display: flex; }
    .inline-flex { display: inline-flex; }
    .flex-wrap { flex-wrap: wrap; }
    .flex-col { flex-direction: column; }
    .flex-shrink-0 { flex-shrink: 0; }
    .flex-1 { flex: 1 1 0%; }
    .items-center { align-items: center; }
    .items-start { align-items: start; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    .gap-12 { gap: 3rem; }
    
    /* Grid */
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    
    /* Spacing */
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .p-5 { padding: 1.25rem; }
    .p-6 { padding: 1.5rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .px-8 { padding-left: 2rem; padding-right: 2rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
    .py-24 { padding-top: 6rem; padding-bottom: 6rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mt-0\\.5 { margin-top: 0.125rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-12 { margin-top: 3rem; }
    .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
    .my-6 { margin-top: 1.5rem; margin-bottom: 1.5rem; }
    .my-8 { margin-top: 2rem; margin-bottom: 2rem; }
    .my-12 { margin-top: 3rem; margin-bottom: 3rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    
    /* Typography */
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-5xl { font-size: 3rem; line-height: 1; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .italic { font-style: italic; }
    .uppercase { text-transform: uppercase; }
    .tracking-wider { letter-spacing: 0.05em; }
    .leading-tight { line-height: 1.25; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-white { color: white; }
    
    /* Borders */
    .border { border-width: 1px; }
    .border-t { border-top-width: 1px; }
    .border-l-4 { border-left-width: 4px; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-2xl { border-radius: 1rem; }
    .rounded-full { border-radius: 9999px; }
    .rounded-r-lg { border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; }
    .overflow-hidden { overflow: hidden; }
    
    /* Shadows */
    .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
    .shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
    
    /* Images */
    .object-cover { object-fit: cover; }
    .h-12 { height: 3rem; }
    .h-24 { height: 6rem; }
    .h-48 { height: 12rem; }
    .h-96 { height: 24rem; }
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
    .w-5 { width: 1.25rem; }
    .h-5 { height: 1.25rem; }
    .w-6 { width: 1.5rem; }
    .h-6 { height: 1.5rem; }
    .w-12 { width: 3rem; }
    .w-24 { width: 6rem; }
    .w-0\\.5 { width: 0.125rem; }
    .h-3 { height: 0.75rem; }
    .w-3 { width: 0.75rem; }
    
    /* Position */
    .relative { position: relative; }
    .absolute { position: absolute; }
    .fixed { position: fixed; }
    .sticky { position: sticky; }
    .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
    .top-0 { top: 0; }
    .bottom-0 { bottom: 0; }
    .left-0 { left: 0; }
    .right-0 { right: 0; }
    .left-4 { left: 1rem; }
    .z-10 { z-index: 10; }
    .z-99 { z-index: 99; }
    .z-100 { z-index: 100; }
    
    /* Transform */
    .transform { transform: translateX(var(--tw-translate-x, 0)) translateY(var(--tw-translate-y, 0)); }
    .-translate-x-1\\/2 { --tw-translate-x: -50%; transform: translateX(-50%); }
    
    /* Display */
    .hidden { display: none; }
    .block { display: block; }
    .inline-block { display: inline-block; }
    
    /* Other */
    .cursor-pointer { cursor: pointer; }
    .transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-colors { transition-property: color, background-color, border-color; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-opacity { transition-property: opacity; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .duration-300 { transition-duration: 300ms; }
    .opacity-0 { opacity: 0; }
    .opacity-100 { opacity: 100; }
    .fill-current { fill: currentColor; }
    
    /* Ring */
    .ring-2 { box-shadow: 0 0 0 2px var(--ring-color, hsl(var(--primary) / 0.3)); }
    .ring-4 { box-shadow: 0 0 0 4px var(--ring-color, hsl(var(--primary) / 0.2)); }
    .ring-primary\\/20 { --ring-color: hsl(var(--primary) / 0.2); }
    .ring-primary\\/30 { --ring-color: hsl(var(--primary) / 0.3); }
    .ring-background { --ring-color: hsl(var(--background)); }
    .bg-primary { background-color: hsl(var(--primary)); }
    
    /* Responsive widths */
    .w-full { width: 100%; }
    .w-\\[calc\\(50\\%-8px\\)\\] { width: calc(50% - 8px); }
    .w-\\[calc\\(50\\%-12px\\)\\] { width: calc(50% - 12px); }
    
    /* Responsive */
    @media (min-width: 640px) {
      .sm\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
      .sm\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
      .sm\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
      .sm\\:p-6 { padding: 1.5rem; }
      .sm\\:p-8 { padding: 2rem; }
      .sm\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
      .sm\\:py-4 { padding-top: 1rem; padding-bottom: 1rem; }
      .sm\\:gap-6 { gap: 1.5rem; }
      .sm\\:block { display: block; }
      .sm\\:text-right { text-align: right; }
      .sm\\:pl-0 { padding-left: 0; }
      .sm\\:left-1\\/2 { left: 50%; }
      .sm\\:-translate-x-1\\/2 { transform: translateX(-50%); }
      .sm\\:flex-row-reverse { flex-direction: row-reverse; }
      .sm\\:w-\\[calc\\(33\\.333\\%-11px\\)\\] { width: calc(33.333% - 11px); }
      .sm\\:w-\\[calc\\(33\\.333\\%-16px\\)\\] { width: calc(33.333% - 16px); }
      .sm\\:w-\\[calc\\(50\\%-12px\\)\\] { width: calc(50% - 12px); }
    }
    
    @media (min-width: 768px) {
      .md\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
      .md\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
      .md\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
      .md\\:text-5xl { font-size: 3rem; line-height: 1; }
      .md\\:text-6xl { font-size: 3.75rem; line-height: 1; }
      .md\\:text-7xl { font-size: 4.5rem; line-height: 1; }
      .md\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
      .md\\:p-12 { padding: 3rem; }
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\\:order-last { order: 9999; }
      .md\\:flex { display: flex; }
    }
    
    @media (min-width: 1024px) {
      .lg\\:w-\\[calc\\(25\\%-18px\\)\\] { width: calc(25% - 18px); }
      .lg\\:w-\\[calc\\(33\\.333\\%-16px\\)\\] { width: calc(33.333% - 16px); }
    }
    
    /* Group hover */
    .group:hover .group-hover\\:scale-110 { transform: scale(1.1); }
    .group:hover .group-hover\\:opacity-100 { opacity: 1; }
    
    /* Min height */
    .min-h-\\[60vh\\] { min-height: 60vh; }
    .min-h-\\[70vh\\] { min-height: 70vh; }
    
    /* Background gradient */
    .bg-gradient-to-t { background-image: linear-gradient(to top, var(--tw-gradient-stops)); }
    .from-black\\/70 { --tw-gradient-from: rgb(0 0 0 / 0.7); --tw-gradient-stops: var(--tw-gradient-from), transparent; }
    .to-transparent { --tw-gradient-to: transparent; }
    
    /* Order */
    .order-first { order: -9999; }
  </style>
</head>
<body>
${renderedContent}
<script>
// Mobile menu toggle
document.querySelectorAll('.mobile-toggle').forEach(btn => {
  btn.addEventListener('click', () => document.body.classList.toggle('menu-open'));
});
document.querySelectorAll('.mobile-close').forEach(btn => {
  btn.addEventListener('click', () => document.body.classList.remove('menu-open'));
});
document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => document.body.classList.remove('menu-open'));
});
</script>
</body>
</html>`;

  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, char => htmlEscapes[char]);
}

/**
 * Download a file with the given content
 */
export function downloadHtmlFile(content: string, filename: string): void {
  const html = exportToHtml(content, filename.replace('.html', ''));
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
