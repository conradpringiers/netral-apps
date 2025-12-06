/**
 * HTML Exporter
 * Exports Netral content to standalone HTML files with proper styling and hover effects
 */

import { parseNetralDocument } from '../parser/netralParser';
import { getTheme, generateThemeCSS } from '../themes/themes';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Generate a complete HTML document from Netral syntax
 */
export function exportToHtml(content: string, title: string = 'Netral Document'): string {
  const doc = parseNetralDocument(content);
  const theme = getTheme(doc.theme);
  const themeCSS = generateThemeCSS(theme);

  // Generate navbar HTML - no spacer needed with sticky positioning
  const navbarHtml = doc.navbar.length > 0 || doc.logo ? `
    <nav class="floating-nav">
      <div class="nav-logo">
        ${doc.logo ? (doc.logo.type === 'url' 
          ? `<img src="${doc.logo.value}" alt="Logo" />` 
          : `<span>${escapeHtml(doc.logo.value)}</span>`) 
        : ''}
      </div>
      <div class="nav-links">
        ${doc.navbar.map(item => `<a href="${escapeHtml(item.url)}" class="nav-link">${escapeHtml(item.label)}</a>`).join('')}
      </div>
      <button class="mobile-toggle" onclick="document.body.classList.toggle('menu-open')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </nav>
    <div class="mobile-menu">
      ${doc.navbar.map(item => `<a href="${escapeHtml(item.url)}" onclick="document.body.classList.remove('menu-open')">${escapeHtml(item.label)}</a>`).join('')}
    </div>
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="Netral Block">
  <title>${escapeHtml(doc.title || title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
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
    
    /* Modern Floating Navbar - same as preview */
    .floating-nav {
      position: sticky;
      top: 1rem;
      z-index: 100;
      padding: 0.75rem 1.5rem;
      border-radius: 9999px;
      background: hsla(var(--background), 0.8);
      backdrop-filter: blur(16px);
      border: 1px solid hsla(var(--border), 0.5);
      box-shadow: 0 8px 32px -8px hsla(var(--foreground), 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      max-width: fit-content;
      margin: 1rem auto 0;
    }
    
    .nav-logo img { height: 2rem; width: auto; }
    .nav-logo span { font-size: 1.125rem; font-weight: 700; color: hsl(var(--foreground)); }
    
    .nav-links { display: flex; gap: 1.5rem; }
    .nav-link {
      position: relative;
      padding: 0.5rem 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: hsl(var(--muted-foreground));
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .nav-link::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, hsl(var(--primary)), hsla(var(--primary), 0.5));
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateX(-50%);
    }
    .nav-link:hover::before { width: 100%; }
    .nav-link:hover { color: hsl(var(--foreground)); }
    
    .mobile-toggle { display: none; background: none; border: none; color: hsl(var(--muted-foreground)); cursor: pointer; padding: 0.5rem; }
    .mobile-menu { display: none; }
    
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .mobile-toggle { display: block; }
      .mobile-menu {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 99;
        background: hsla(var(--background), 0.98);
        backdrop-filter: blur(16px);
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2rem;
      }
      body.menu-open .mobile-menu { display: flex; }
      .mobile-menu a {
        font-size: 1.5rem;
        font-weight: 600;
        color: hsl(var(--foreground));
        text-decoration: none;
        transition: color 0.2s;
      }
      .mobile-menu a:hover { color: hsl(var(--primary)); }
    }
    
    /* Header Styles */
    .header { 
      padding: 4rem 1.5rem; 
      text-align: center; 
      max-width: 72rem; 
      margin: 0 auto;
    }
    .header.classic {
      position: relative;
      min-height: 60vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-size: cover;
      background-position: center;
    }
    .header.classic::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, hsla(var(--background), 0.7), hsla(var(--background), 0.9));
    }
    .header.classic > * { position: relative; z-index: 1; }
    .header.big-text { padding: 5rem 1.5rem; }
    .header.split { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 3rem; 
      align-items: center; 
      padding: 4rem 1.5rem; 
      text-align: left;
    }
    
    .header h1 { 
      font-size: clamp(2rem, 5vw, 3rem); 
      font-weight: 700; 
      margin-bottom: 1rem; 
      line-height: 1.2;
    }
    .header.big-text h1 { font-size: clamp(2.5rem, 8vw, 4.5rem); }
    .header p { 
      font-size: 1.125rem; 
      color: hsl(var(--muted-foreground)); 
      max-width: 48rem; 
      margin: 0 auto 1.5rem; 
    }
    .header img { 
      width: 100%; 
      max-width: 600px;
      height: auto; 
      border-radius: var(--radius); 
      box-shadow: 0 20px 60px -15px hsla(var(--foreground), 0.2);
    }
    .header .cta {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 2rem;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      border-radius: var(--radius);
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .header .cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -8px hsla(var(--primary), 0.5);
    }
    
    /* Section Styles */
    .section { max-width: 72rem; margin: 0 auto; padding: 3rem 1.5rem; }
    .section-title {
      font-size: 1.875rem;
      font-weight: 700;
      margin-bottom: 2rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid hsl(var(--border));
      text-align: center;
    }
    
    /* Card Styles with Hover Effects */
    .card-grid { 
      display: flex; 
      flex-wrap: wrap; 
      justify-content: center;
      gap: 1.5rem; 
      margin: 2rem 0; 
    }
    
    .card {
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: var(--radius);
      overflow: hidden;
      width: 100%;
      max-width: 350px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px -12px hsla(var(--primary), 0.3);
    }
    .card img { width: 100%; height: 12rem; object-fit: cover; }
    .card-content { padding: 1.25rem; }
    .card h3 { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; color: hsl(var(--card-foreground)); }
    .card p { color: hsl(var(--muted-foreground)); font-size: 0.875rem; }
    .card .icon { font-size: 2.5rem; margin-bottom: 1rem; }
    
    /* Stats */
    .stats-grid { 
      display: flex; 
      flex-wrap: wrap; 
      justify-content: center;
      gap: 1rem; 
      margin: 2rem 0; 
    }
    .stat {
      text-align: center;
      padding: 1.5rem;
      background: hsl(var(--secondary));
      border-radius: var(--radius);
      min-width: 140px;
      flex: 1;
      max-width: 200px;
      transition: all 0.3s ease;
    }
    .stat:hover { transform: translateY(-2px); }
    .stat .value { 
      font-size: clamp(2rem, 4vw, 3rem); 
      font-weight: 700; 
      color: hsl(var(--primary)); 
      margin-bottom: 0.25rem; 
    }
    .stat .label { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
    
    /* CTA Block */
    .cta-block {
      text-align: center;
      padding: 3rem 2rem;
      background: hsl(var(--secondary));
      border-radius: calc(var(--radius) * 2);
      margin: 2rem auto;
      max-width: 56rem;
    }
    .cta-block h3 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; margin-bottom: 1rem; }
    .cta-block p { color: hsl(var(--muted-foreground)); margin-bottom: 1.5rem; max-width: 36rem; margin-left: auto; margin-right: auto; }
    .cta-block .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 2rem;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      border-radius: var(--radius);
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .cta-block .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -8px hsla(var(--primary), 0.5);
    }
    
    /* FAQ */
    .faq { margin: 2rem auto; max-width: 48rem; }
    .faq-item { 
      border: 1px solid hsl(var(--border)); 
      border-radius: var(--radius); 
      margin-bottom: 0.75rem;
      overflow: hidden;
    }
    .faq-question {
      width: 100%;
      padding: 1rem 1.25rem;
      background: hsl(var(--card));
      border: none;
      text-align: left;
      font-weight: 500;
      color: hsl(var(--foreground));
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.2s;
    }
    .faq-question:hover { background: hsl(var(--secondary)); }
    .faq-answer { 
      padding: 0 1.25rem 1rem; 
      color: hsl(var(--muted-foreground)); 
      display: none;
      background: hsl(var(--card));
    }
    .faq-item.open .faq-answer { display: block; }
    .faq-item.open .faq-question { background: hsl(var(--secondary)); }
    
    /* Timeline */
    .timeline { position: relative; max-width: 48rem; margin: 2rem auto; padding-left: 2rem; }
    .timeline::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: hsl(var(--border));
    }
    .timeline-item { position: relative; margin-bottom: 2rem; padding-left: 1.5rem; }
    .timeline-item::before {
      content: '';
      position: absolute;
      left: -2rem;
      top: 0.5rem;
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      background: hsl(var(--primary));
      box-shadow: 0 0 0 4px hsl(var(--background));
    }
    .timeline-date { font-size: 0.875rem; color: hsl(var(--primary)); font-weight: 500; margin-bottom: 0.25rem; }
    .timeline-content { 
      background: hsl(var(--card)); 
      border: 1px solid hsl(var(--border)); 
      padding: 1rem; 
      border-radius: var(--radius);
      transition: all 0.3s ease;
    }
    .timeline-content:hover { transform: translateX(4px); }
    .timeline-content h4 { font-weight: 600; margin-bottom: 0.25rem; }
    .timeline-content p { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
    
    /* Team */
    .team-grid { 
      display: flex; 
      flex-wrap: wrap; 
      justify-content: center;
      gap: 1.5rem; 
      margin: 2rem 0; 
    }
    .team-member {
      text-align: center;
      padding: 1.5rem;
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: var(--radius);
      max-width: 250px;
      transition: all 0.3s ease;
    }
    .team-member:hover { transform: translateY(-4px); box-shadow: 0 12px 40px -12px hsla(var(--primary), 0.3); }
    .team-member img { 
      width: 6rem; 
      height: 6rem; 
      border-radius: 50%; 
      object-fit: cover; 
      margin-bottom: 1rem;
      box-shadow: 0 0 0 4px hsla(var(--primary), 0.2);
    }
    .team-member h4 { font-weight: 600; margin-bottom: 0.25rem; }
    .team-member .role { font-size: 0.875rem; color: hsl(var(--primary)); margin-bottom: 0.5rem; }
    .team-member .bio { font-size: 0.75rem; color: hsl(var(--muted-foreground)); }
    
    /* Countdown */
    .countdown {
      text-align: center;
      padding: 2rem;
      background: hsl(var(--secondary));
      border-radius: calc(var(--radius) * 2);
      max-width: 32rem;
      margin: 2rem auto;
    }
    .countdown .label { 
      font-size: 0.875rem; 
      text-transform: uppercase; 
      letter-spacing: 0.1em; 
      color: hsl(var(--primary)); 
      margin-bottom: 0.5rem;
    }
    .countdown .date { font-size: clamp(1.5rem, 4vw, 2.5rem); font-weight: 700; margin-bottom: 0.5rem; }
    .countdown .desc { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
    
    /* Gallery */
    .gallery { 
      display: flex; 
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem; 
      margin: 2rem 0; 
    }
    .gallery-item { 
      position: relative; 
      overflow: hidden; 
      border-radius: var(--radius);
      width: calc(50% - 0.5rem);
      max-width: 300px;
    }
    .gallery-item img { 
      width: 100%; 
      height: 12rem; 
      object-fit: cover; 
      transition: transform 0.3s ease;
    }
    .gallery-item:hover img { transform: scale(1.1); }
    .gallery-item figcaption {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.75rem;
      background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
      color: white;
      font-size: 0.875rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .gallery-item:hover figcaption { opacity: 1; }
    
    /* Callouts */
    .callout { 
      display: flex; 
      align-items: flex-start; 
      gap: 0.75rem; 
      padding: 1rem; 
      border-radius: var(--radius); 
      margin: 1rem auto;
      max-width: 48rem;
    }
    .callout.warn { background: hsla(var(--warning), 0.1); border: 1px solid hsl(var(--warning)); }
    .callout.info { background: hsla(var(--info), 0.1); border: 1px solid hsl(var(--info)); }
    .callout.quote { 
      background: hsl(var(--muted)); 
      border-left: 4px solid hsl(var(--primary)); 
      font-style: italic;
      font-size: 1.125rem;
    }
    
    /* Divider */
    .divider { margin: 3rem auto; max-width: 48rem; }
    .divider hr { border: none; border-top: 1px solid hsl(var(--border)); }
    .divider.wave svg { width: 100%; height: 3rem; }
    
    /* Columns */
    .columns { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 2rem; 
      margin: 2rem auto;
      max-width: 56rem;
    }
    
    /* Prose */
    .prose { max-width: 48rem; margin: 0 auto; }
    .prose h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
    .prose h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; }
    .prose h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
    .prose p { margin-bottom: 1rem; line-height: 1.7; }
    .prose ul, .prose ol { margin-bottom: 1rem; padding-left: 1.5rem; }
    .prose li { margin-bottom: 0.25rem; }
    .prose a { color: hsl(var(--primary)); transition: opacity 0.2s; }
    .prose a:hover { opacity: 0.8; }
    .prose code { background: hsl(var(--muted)); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; }
    .prose pre { background: hsl(var(--muted)); padding: 1rem; border-radius: var(--radius); overflow-x: auto; margin-bottom: 1rem; }
    .prose blockquote { border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; color: hsl(var(--muted-foreground)); font-style: italic; margin: 1rem 0; }
    
    /* Embed & Video */
    .embed { width: 100%; height: 24rem; border: 1px solid hsl(var(--border)); border-radius: var(--radius); margin: 2rem auto; max-width: 56rem; display: block; }
    .video { width: 100%; border-radius: var(--radius); margin: 2rem auto; max-width: 56rem; display: block; }
    .image { width: 100%; height: auto; border-radius: var(--radius); margin: 2rem auto; max-width: 56rem; display: block; }
    
    .bigtitle { 
      font-size: clamp(2rem, 5vw, 3rem); 
      font-weight: 700; 
      text-align: center; 
      margin: 3rem 0; 
    }
    
    /* Footer */
    footer {
      padding: 2rem 1.5rem;
      border-top: 1px solid hsl(var(--border));
      text-align: center;
      color: hsl(var(--muted-foreground));
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .columns { grid-template-columns: 1fr; }
      .header.split { grid-template-columns: 1fr; text-align: center; }
      .header.split .header-image { order: -1; }
      .gallery-item { width: calc(50% - 0.5rem); }
    }
    
    @media (max-width: 480px) {
      .gallery-item { width: 100%; }
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
    ${doc.title ? `<p>© ${new Date().getFullYear()} ${escapeHtml(doc.title)}</p>` : ''}
    <p style="margin-top: 0.5rem; opacity: 0.6; font-size: 0.75rem;">Built with Netral</p>
  </footer>
  <script>
    // FAQ Toggle
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.parentElement.classList.toggle('open');
      });
    });
  </script>
</body>
</html>`;

  return html;
}

function generateHeaderHtml(header: any): string {
  if (header.type === 'Classic' && header.imageUrl) {
    return `
      <header class="header classic" style="background-image: url('${header.imageUrl}');">
        <h1>${escapeHtml(header.title)}</h1>
        <p>${escapeHtml(header.description)}</p>
        ${header.link ? `<a href="${header.link}" class="cta">Get Started →</a>` : ''}
      </header>
    `;
  }
  
  if (header.type === 'SplitImage') {
    return `
      <header class="header split">
        <div>
          <h1>${escapeHtml(header.title)}</h1>
          <p>${escapeHtml(header.description)}</p>
          ${header.link ? `<a href="${header.link}" class="cta">Get Started →</a>` : ''}
        </div>
        <div class="header-image">
          ${header.imageUrl ? `<img src="${header.imageUrl}" alt="${escapeHtml(header.title)}" />` : ''}
        </div>
      </header>
    `;
  }
  
  // BigText or default
  return `
    <header class="header ${header.type === 'BigText' ? 'big-text' : ''}">
      <h1>${escapeHtml(header.title)}</h1>
      <p>${escapeHtml(header.description)}</p>
      ${header.link ? `<a href="${header.link}" class="cta">Get Started →</a>` : ''}
      ${header.imageUrl && header.type === 'BigText' ? `<img src="${header.imageUrl}" alt="${escapeHtml(header.title)}" style="margin-top: 2rem;" />` : ''}
    </header>
  `;
}

function generateBlockHtml(block: any): string {
  switch (block.type) {
    case 'markdown':
      const sanitizedMarkdown = DOMPurify.sanitize(marked.parse(block.content) as string);
      return `<div class="prose">${sanitizedMarkdown}</div>`;
    
    case 'image':
      return `<img src="${block.url}" alt="Content image" class="image" loading="lazy" />`;
    
    case 'bigtitle':
      return `<h2 class="bigtitle">${escapeHtml(block.text)}</h2>`;
    
    case 'element':
      return `
        <div class="card-grid">
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
          <div class="prose">${escapeHtml(block.left)}</div>
          <div class="prose">${escapeHtml(block.right)}</div>
        </div>
      `;
    
    case 'feature':
      return `
        <div class="card-grid">
          ${block.items.map((item: any) => `
            <div class="card">
              <div class="card-content">
                <div class="icon">${item.icon}</div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'testimonial':
      return `
        <div class="card-grid">
          ${block.items.map((item: any) => `
            <div class="card">
              <div class="card-content">
                <p style="font-style: italic; color: hsl(var(--muted-foreground)); margin-bottom: 1rem;">"${escapeHtml(item.text)}"</p>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  ${item.photo ? `<img src="${item.photo}" alt="${escapeHtml(item.name)}" style="width: 3rem; height: 3rem; border-radius: 50%; object-fit: cover;" />` : ''}
                  <div>
                    <strong>${escapeHtml(item.name)}</strong>
                    <p style="font-size: 0.875rem; color: hsl(var(--muted-foreground));">${escapeHtml(item.role)}</p>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'pricing':
      return `
        <div class="card-grid">
          ${block.items.map((item: any) => `
            <div class="card" style="text-align: center;">
              <div class="card-content">
                <h3>${escapeHtml(item.title)}</h3>
                <div style="font-size: 2rem; font-weight: 700; color: hsl(var(--primary)); margin: 1rem 0;">${escapeHtml(item.price)}</div>
                <ul style="list-style: none; text-align: left;">
                  ${item.benefits.map((b: string) => `<li style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: hsl(var(--muted-foreground)); font-size: 0.875rem;">✓ ${escapeHtml(b)}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'stats':
      return `
        <div class="stats-grid">
          ${block.items.map((item: any) => `
            <div class="stat">
              <div class="value">${escapeHtml(item.value)}</div>
              <div class="label">${escapeHtml(item.label)}</div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'cta':
      return `
        <div class="cta-block">
          <h3>${escapeHtml(block.title)}</h3>
          <p>${escapeHtml(block.description)}</p>
          <a href="${block.buttonUrl}" class="btn">${escapeHtml(block.buttonText)} →</a>
        </div>
      `;
    
    case 'faq':
      return `
        <div class="faq">
          ${block.items.map((item: any) => `
            <div class="faq-item">
              <button class="faq-question">${escapeHtml(item.question)} <span>▼</span></button>
              <div class="faq-answer">${escapeHtml(item.answer)}</div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'timeline':
      return `
        <div class="timeline">
          ${block.items.map((item: any) => `
            <div class="timeline-item">
              <div class="timeline-date">${escapeHtml(item.date)}</div>
              <div class="timeline-content">
                <h4>${escapeHtml(item.title)}</h4>
                <p>${escapeHtml(item.description)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'team':
      return `
        <div class="team-grid">
          ${block.items.map((item: any) => `
            <div class="team-member">
              ${item.photo ? `<img src="${item.photo}" alt="${escapeHtml(item.name)}" />` : ''}
              <h4>${escapeHtml(item.name)}</h4>
              <div class="role">${escapeHtml(item.role)}</div>
              ${item.bio ? `<p class="bio">${escapeHtml(item.bio)}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    
    case 'countdown':
      return `
        <div class="countdown">
          <div class="label">${escapeHtml(block.label)}</div>
          <div class="date">${escapeHtml(block.date)}</div>
          ${block.description ? `<p class="desc">${escapeHtml(block.description)}</p>` : ''}
        </div>
      `;
    
    case 'gallery':
      return `
        <div class="gallery">
          ${block.items.map((item: any) => `
            <figure class="gallery-item">
              <img src="${item.url}" alt="${escapeHtml(item.caption || '')}" loading="lazy" />
              ${item.caption ? `<figcaption>${escapeHtml(item.caption)}</figcaption>` : ''}
            </figure>
          `).join('')}
        </div>
      `;
    
    case 'divider':
      if (block.style === 'wave') {
        return `
          <div class="divider wave">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" fill="hsl(var(--secondary))"/>
            </svg>
          </div>
        `;
      }
      return `<div class="divider"><hr /></div>`;
    
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