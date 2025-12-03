/**
 * HTML Exporter
 * Exports Netral content to standalone HTML files
 */

import { parseNetralDocument } from '../parser/netralParser';
import { getTheme, generateThemeCSS } from '../themes/themes';
import { marked } from 'marked';

/**
 * Generate a complete HTML document from Netral syntax
 */
export function exportToHtml(content: string, title: string = 'Netral Document'): string {
  const doc = parseNetralDocument(content);
  const theme = getTheme(doc.theme);
  const themeCSS = generateThemeCSS(theme);

  // Generate navbar HTML
  const navbarHtml = doc.navbar.length > 0 ? `
    <nav class="navbar">
      <div class="navbar-logo">
        ${doc.logo ? (doc.logo.type === 'url' 
          ? `<img src="${doc.logo.value}" alt="Logo" />` 
          : `<span>${doc.logo.value}</span>`) 
        : ''}
      </div>
      <div class="navbar-links">
        ${doc.navbar.map(item => `<a href="${item.url}">${item.label}</a>`).join('')}
      </div>
    </nav>
  ` : '';

  // Generate header HTML
  const headerHtml = doc.header ? generateHeaderHtml(doc.header) : '';

  // Generate sections HTML
  const sectionsHtml = doc.sections.map(section => `
    <section class="section">
      ${section.title ? `<h2 class="section-title">${section.title}</h2>` : ''}
      ${section.content.map(block => generateBlockHtml(block)).join('')}
    </section>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="Netral Block">
  <title>${escapeHtml(doc.title || title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      ${themeCSS}
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: ${theme.fontFamily};
      background: hsl(var(--background));
      color: hsl(var(--foreground));
      line-height: 1.6;
    }
    
    .navbar {
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: hsl(var(--background) / 0.95);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid hsl(var(--border));
    }
    
    .navbar-logo img { height: 2rem; width: auto; }
    .navbar-logo span { font-size: 1.25rem; font-weight: 700; }
    
    .navbar-links { display: flex; gap: 1.5rem; }
    .navbar-links a {
      color: hsl(var(--muted-foreground));
      text-decoration: none;
      transition: color 0.2s;
    }
    .navbar-links a:hover { color: hsl(var(--foreground)); }
    
    .header { padding: 4rem 1.5rem; text-center; }
    .header.big-text { padding: 5rem 1.5rem; }
    .header.split { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; padding: 4rem 1.5rem; }
    
    .header h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; }
    .header.big-text h1 { font-size: 3.5rem; }
    .header p { font-size: 1.125rem; color: hsl(var(--muted-foreground)); max-width: 48rem; margin: 0 auto 1.5rem; }
    .header img { width: 100%; height: auto; border-radius: var(--radius); }
    .header .cta {
      display: inline-flex;
      padding: 0.75rem 1.5rem;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      border-radius: var(--radius);
      text-decoration: none;
      font-weight: 500;
    }
    
    .section { max-width: 64rem; margin: 0 auto; padding: 3rem 1.5rem; }
    .section-title {
      font-size: 1.875rem;
      font-weight: 700;
      margin-bottom: 2rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid hsl(var(--border));
    }
    
    .bigtitle { font-size: 2.5rem; font-weight: 700; text-align: center; margin: 3rem 0; }
    
    .grid { display: grid; gap: 1.5rem; margin: 2rem 0; }
    .grid-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    
    .card {
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: var(--radius);
      overflow: hidden;
    }
    .card img { width: 100%; height: 12rem; object-fit: cover; }
    .card-content { padding: 1rem; }
    .card h3 { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; }
    .card p { color: hsl(var(--muted-foreground)); font-size: 0.875rem; }
    
    .feature { padding: 1.5rem; }
    .feature .icon { font-size: 2rem; margin-bottom: 1rem; }
    
    .testimonial { padding: 1.5rem; }
    .testimonial .quote { color: hsl(var(--muted-foreground)); font-style: italic; margin-bottom: 1rem; }
    .testimonial .author { display: flex; align-items: center; gap: 0.75rem; }
    .testimonial .author img { width: 3rem; height: 3rem; border-radius: 50%; object-fit: cover; }
    
    .pricing { padding: 1.5rem; text-align: center; }
    .pricing h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    .pricing .price { font-size: 2rem; font-weight: 700; color: hsl(var(--primary)); margin-bottom: 1rem; }
    .pricing ul { list-style: none; text-align: left; }
    .pricing li { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: hsl(var(--muted-foreground)); font-size: 0.875rem; }
    .pricing li::before { content: "✓"; color: hsl(var(--success)); }
    
    .callout { display: flex; align-items: flex-start; gap: 0.75rem; padding: 1rem; border-radius: var(--radius); margin: 1rem 0; }
    .callout.warn { background: hsl(var(--warning) / 0.1); border: 1px solid hsl(var(--warning)); }
    .callout.info { background: hsl(var(--info) / 0.1); border: 1px solid hsl(var(--info)); }
    .callout.quote { background: hsl(var(--muted)); border-left: 4px solid hsl(var(--primary)); font-style: italic; }
    
    .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0; }
    
    .embed { width: 100%; height: 24rem; border: 1px solid hsl(var(--border)); border-radius: var(--radius); margin: 2rem 0; }
    .video { width: 100%; border-radius: var(--radius); margin: 2rem 0; }
    .image { width: 100%; height: auto; border-radius: var(--radius); margin: 2rem 0; }
    
    .prose h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
    .prose h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; }
    .prose h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
    .prose p { margin-bottom: 1rem; }
    .prose ul, .prose ol { margin-bottom: 1rem; padding-left: 1.5rem; }
    .prose li { margin-bottom: 0.25rem; }
    .prose a { color: hsl(var(--primary)); }
    .prose code { background: hsl(var(--muted)); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; }
    .prose pre { background: hsl(var(--muted)); padding: 1rem; border-radius: var(--radius); overflow-x: auto; margin-bottom: 1rem; }
    .prose blockquote { border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; color: hsl(var(--muted-foreground)); font-style: italic; margin: 1rem 0; }
    
    footer {
      padding: 2rem 1.5rem;
      border-top: 1px solid hsl(var(--border));
      text-align: center;
      color: hsl(var(--muted-foreground));
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .grid-2, .grid-3, .columns { grid-template-columns: 1fr; }
      .header.split { grid-template-columns: 1fr; }
      .header h1 { font-size: 2rem; }
      .header.big-text h1 { font-size: 2.5rem; }
    }
  </style>
</head>
<body>
  ${navbarHtml}
  ${headerHtml}
  <main>
    ${sectionsHtml}
  </main>
  <footer>
    ${doc.title ? `<p>© ${new Date().getFullYear()} ${doc.title}</p>` : ''}
    <p style="margin-top: 0.5rem; opacity: 0.6; font-size: 0.75rem;">Créé avec Netral</p>
  </footer>
</body>
</html>`;

  return html;
}

function generateHeaderHtml(header: any): string {
  const typeClass = header.type === 'BigText' ? 'big-text' : header.type === 'SplitImage' ? 'split' : '';
  
  if (header.type === 'SplitImage') {
    return `
      <header class="header split">
        <div>
          <h1>${escapeHtml(header.title)}</h1>
          <p>${escapeHtml(header.description)}</p>
          ${header.link ? `<a href="${header.link}" class="cta">Commencer</a>` : ''}
        </div>
        ${header.imageUrl ? `<img src="${header.imageUrl}" alt="${escapeHtml(header.title)}" />` : ''}
      </header>
    `;
  }
  
  return `
    <header class="header ${typeClass}">
      ${header.imageUrl && header.type === 'Classic' ? `<img src="${header.imageUrl}" alt="${escapeHtml(header.title)}" style="max-width: 64rem; margin: 0 auto 2rem;" />` : ''}
      <h1>${escapeHtml(header.title)}</h1>
      <p>${escapeHtml(header.description)}</p>
      ${header.link ? `<a href="${header.link}" class="cta">En savoir plus</a>` : ''}
    </header>
  `;
}

function generateBlockHtml(block: any): string {
  switch (block.type) {
    case 'markdown':
      return `<div class="prose">${marked.parse(block.content)}</div>`;
    
    case 'image':
      return `<img src="${block.url}" alt="Content image" class="image" loading="lazy" />`;
    
    case 'bigtitle':
      return `<h2 class="bigtitle">${escapeHtml(block.text)}</h2>`;
    
    case 'element':
      return `
        <div class="grid grid-3">
          ${block.items.map((item: any) => `
            <div class="card">
              ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy" />` : ''}
              <div class="card-content">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'column':
      return `
        <div class="columns">
          <div class="prose">${block.left}</div>
          <div class="prose">${block.right}</div>
        </div>
      `;
    
    case 'feature':
      return `
        <div class="grid grid-3">
          ${block.items.map((item: any) => `
            <div class="card feature">
              <div class="icon">${item.icon}</div>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.description)}</p>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'testimonial':
      return `
        <div class="grid grid-3">
          ${block.items.map((item: any) => `
            <div class="card testimonial">
              <p class="quote">"${escapeHtml(item.text)}"</p>
              <div class="author">
                ${item.photo ? `<img src="${item.photo}" alt="${escapeHtml(item.name)}" />` : ''}
                <div>
                  <strong>${escapeHtml(item.name)}</strong>
                  <p style="font-size: 0.875rem; color: hsl(var(--muted-foreground));">${escapeHtml(item.role)}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'pricing':
      return `
        <div class="grid grid-3">
          ${block.items.map((item: any) => `
            <div class="card pricing">
              <h3>${escapeHtml(item.title)}</h3>
              <div class="price">${escapeHtml(item.price)}</div>
              <ul>
                ${item.benefits.map((b: string) => `<li>${escapeHtml(b)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'warn':
      return `<div class="callout warn">⚠️ ${escapeHtml(block.text)}</div>`;
    
    case 'def':
      return `<div class="callout info">ℹ️ ${escapeHtml(block.text)}</div>`;
    
    case 'quote':
      return `<div class="callout quote">"${escapeHtml(block.text)}"</div>`;
    
    case 'embed':
      return `<iframe src="${block.url}" class="embed" title="Embedded content" loading="lazy"></iframe>`;
    
    case 'video':
      return `<video src="${block.url}" controls class="video">Your browser does not support the video tag.</video>`;
    
    default:
      return '';
  }
}

/**
 * Download HTML file
 */
export function downloadHtml(content: string, filename: string = 'document.html'): void {
  const html = exportToHtml(content, filename.replace('.html', ''));
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Copy HTML to clipboard
 */
export async function copyHtmlToClipboard(content: string): Promise<boolean> {
  try {
    const html = exportToHtml(content);
    await navigator.clipboard.writeText(html);
    return true;
  } catch (error) {
    console.error('Failed to copy HTML:', error);
    return false;
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
