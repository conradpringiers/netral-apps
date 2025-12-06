/**
 * HTML Exporter
 * Exports Netral content to standalone HTML files
 * Uses EXACTLY the same CSS as the preview for pixel-perfect consistency
 */

import { parseNetralDocument, ContentBlock } from '../parser/netralParser';
import { getTheme, generateThemeCSS } from '../themes/themes';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Generate a complete HTML document from Netral syntax
 * This uses the exact same CSS as NetralRenderer for pixel-perfect consistency
 */
export function exportToHtml(content: string, title: string = 'Netral Document'): string {
  const doc = parseNetralDocument(content);
  const theme = getTheme(doc.theme);
  const themeCSS = generateThemeCSS(theme);

  // Generate navbar HTML
  const navbarHtml = doc.navbar.length > 0 || doc.logo ? `
    <nav class="floating-nav">
      <div class="nav-logo">
        ${doc.logo ? (doc.logo.type === 'url' 
          ? `<img src="${doc.logo.value}" alt="Logo" class="logo-img" />` 
          : `<span class="logo-text">${escapeHtml(doc.logo.value)}</span>`) 
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
      <button class="mobile-close" onclick="document.body.classList.remove('menu-open')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      ${doc.navbar.map(item => `<a href="${escapeHtml(item.url)}" onclick="document.body.classList.remove('menu-open')">${escapeHtml(item.label)}</a>`).join('')}
    </div>
  ` : '';

  // Generate header HTML
  const headerHtml = doc.header ? generateHeaderHtml(doc.header) : '';

  // Generate sections HTML
  const sectionsHtml = doc.sections.map(section => `
    <section class="section">
      ${section.title ? `<h2 class="section-title">${escapeHtml(section.title)}</h2>` : ''}
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
    /* Theme Variables - EXACT same as preview */
    :root {
      ${themeCSS}
    }
    
    /* Reset */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: ${theme.fontFamily};
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
      line-height: 1.6;
      min-height: 100vh;
    }
    
    body * {
      border-color: hsl(var(--border));
    }
    
    /* ========================================
       FLOATING NAVBAR - Exact same as preview
       ======================================== */
    .floating-nav {
      position: sticky;
      top: 1rem;
      z-index: 100;
      padding: 0.75rem 1.5rem;
      border-radius: 9999px;
      background: hsl(var(--background) / 0.8);
      backdrop-filter: blur(16px);
      border: 1px solid hsl(var(--border) / 0.5);
      box-shadow: 0 8px 32px -8px hsl(var(--foreground) / 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      max-width: fit-content;
      margin: 1rem auto 0;
    }
    
    .nav-logo { display: flex; align-items: center; gap: 0.5rem; }
    .logo-img { height: 2rem; width: auto; }
    .logo-text { font-size: 1.125rem; font-weight: 700; color: hsl(var(--foreground)); }
    
    .nav-links { display: flex; align-items: center; gap: 1.5rem; }
    
    .nav-link {
      position: relative;
      padding: 0.5rem 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: hsl(var(--muted-foreground));
      text-decoration: none;
      transition: color 0.2s ease;
      white-space: nowrap;
    }
    .nav-link::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.5));
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateX(-50%);
    }
    .nav-link:hover::before { width: 100%; }
    .nav-link:hover { color: hsl(var(--foreground)); }
    
    .mobile-toggle { 
      display: none; 
      background: none; 
      border: none; 
      color: hsl(var(--muted-foreground)); 
      cursor: pointer; 
      padding: 0.5rem;
      border-radius: 9999px;
      transition: background 0.2s;
    }
    .mobile-toggle:hover { background: hsl(var(--muted)); }
    
    .mobile-menu { display: none; }
    .mobile-close { 
      position: absolute; 
      top: 1rem; 
      right: 1rem; 
      background: none; 
      border: none; 
      color: hsl(var(--foreground)); 
      cursor: pointer;
      padding: 0.5rem;
    }
    
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
        background: hsl(var(--background) / 0.98);
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
    
    /* ========================================
       HEADER STYLES - Exact same as preview
       ======================================== */
    .header {
      padding: 4rem 1rem;
      text-align: center;
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
      padding: 6rem 1.5rem;
    }
    .header.classic::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, hsl(var(--background) / 0.6), hsl(var(--background) / 0.9));
    }
    .header.classic > * { position: relative; z-index: 1; }
    
    .header.big-text h1 {
      font-size: clamp(2.5rem, 8vw, 4.5rem);
      font-weight: 700;
      margin-bottom: 1.5rem;
      line-height: 1.1;
      color: hsl(var(--foreground));
    }
    
    .header.split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
      text-align: left;
      max-width: 72rem;
      margin: 0 auto;
      padding: 4rem 1.5rem;
    }
    
    .header h1 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.2;
      color: hsl(var(--foreground));
    }
    
    .header p {
      font-size: 1.125rem;
      color: hsl(var(--muted-foreground));
      max-width: 42rem;
      margin: 0 auto 1.5rem;
      line-height: 1.7;
    }
    
    .header img {
      width: 100%;
      max-width: 800px;
      height: auto;
      border-radius: 0.75rem;
      box-shadow: 0 25px 50px -12px hsl(var(--foreground) / 0.25);
      margin-top: 2rem;
    }
    
    .header .cta {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .header .cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -8px hsl(var(--primary) / 0.5);
    }
    
    @media (max-width: 768px) {
      .header.split {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .header.split .header-image { order: -1; }
      .header.split p { margin: 0 auto 1.5rem; }
    }
    
    /* ========================================
       MAIN CONTENT - Exact same as preview
       ======================================== */
    main {
      max-width: 80rem;
      margin: 0 auto;
      padding: 3rem 1rem;
    }
    
    @media (min-width: 640px) {
      main { padding: 3rem 1.5rem; }
    }
    
    .section {
      margin-bottom: 4rem;
    }
    
    .section-title {
      font-size: clamp(1.5rem, 3vw, 1.875rem);
      font-weight: 700;
      margin-bottom: 2rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid hsl(var(--border));
      text-align: center;
      color: hsl(var(--foreground));
    }
    
    @media (min-width: 640px) {
      .section-title { text-align: left; }
    }
    
    /* ========================================
       PROSE CONTENT - Markdown
       ======================================== */
    .prose-content {
      max-width: 48rem;
      margin: 0 auto 1.5rem;
    }
    .prose-content h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; color: hsl(var(--foreground)); }
    .prose-content h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; color: hsl(var(--foreground)); }
    .prose-content h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: hsl(var(--foreground)); }
    .prose-content p { margin-bottom: 1rem; color: hsl(var(--foreground)); line-height: 1.7; }
    .prose-content a { color: hsl(var(--primary)); text-decoration: underline; transition: opacity 0.2s; }
    .prose-content a:hover { opacity: 0.8; }
    .prose-content code { background: hsl(var(--muted)); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; }
    .prose-content pre { background: hsl(var(--muted)); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
    .prose-content ul, .prose-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
    .prose-content li { margin-bottom: 0.25rem; color: hsl(var(--foreground)); }
    .prose-content blockquote { border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; color: hsl(var(--muted-foreground)); font-style: italic; margin: 1rem 0; }
    .prose-content strong { font-weight: 600; }
    .prose-content em { font-style: italic; }
    
    /* ========================================
       CARD HOVER EFFECTS - Exact same as preview
       ======================================== */
    .card-hover {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .card-hover:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px -12px hsl(var(--primary) / 0.3);
    }
    
    /* ========================================
       BUTTON STYLES - Exact same as preview
       ======================================== */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -8px hsl(var(--primary) / 0.5);
    }
    
    @media (min-width: 640px) {
      .btn-primary { padding: 1rem 2rem; }
    }
    
    /* ========================================
       IMAGE
       ======================================== */
    .image-block {
      margin: 2rem auto;
      max-width: 56rem;
    }
    .image-block img {
      width: 100%;
      height: auto;
      border-radius: 0.75rem;
      box-shadow: 0 10px 40px -15px hsl(var(--foreground) / 0.2);
    }
    
    /* ========================================
       BIGTITLE
       ======================================== */
    .bigtitle {
      font-size: clamp(1.875rem, 5vw, 3rem);
      font-weight: 700;
      text-align: center;
      margin: 3rem 0;
      padding: 0 1rem;
      color: hsl(var(--foreground));
    }
    
    /* ========================================
       FLEX GRID - For cards (Feature, Element, etc)
       ======================================== */
    .flex-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1.5rem;
      margin: 2rem 0;
    }
    
    .flex-card {
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: 0.75rem;
      overflow: hidden;
      width: 100%;
      max-width: 24rem;
    }
    
    @media (min-width: 640px) {
      .flex-card { width: calc(50% - 0.75rem); }
    }
    @media (min-width: 1024px) {
      .flex-card { width: calc(33.333% - 1rem); }
    }
    
    .flex-card img {
      width: 100%;
      height: 12rem;
      object-fit: cover;
    }
    
    .flex-card-content {
      padding: 1.25rem;
    }
    
    .flex-card h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: hsl(var(--card-foreground));
    }
    
    .flex-card p {
      font-size: 0.875rem;
      color: hsl(var(--muted-foreground));
    }
    
    .flex-card .icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    
    /* ========================================
       STATS
       ======================================== */
    .stats-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
      margin: 2rem 0;
    }
    
    @media (min-width: 640px) {
      .stats-grid { gap: 1.5rem; }
    }
    
    .stat {
      text-align: center;
      padding: 1rem 1.5rem;
      background: hsl(var(--secondary));
      border-radius: 0.75rem;
      width: calc(50% - 0.5rem);
      max-width: 12rem;
    }
    
    @media (min-width: 640px) {
      .stat {
        width: calc(33.333% - 1rem);
        padding: 1.5rem;
      }
    }
    @media (min-width: 1024px) {
      .stat { width: calc(25% - 1.125rem); }
    }
    
    .stat .value {
      font-size: clamp(1.875rem, 5vw, 3rem);
      font-weight: 700;
      color: hsl(var(--primary));
      margin-bottom: 0.5rem;
    }
    
    .stat .label {
      font-size: 0.75rem;
      font-weight: 500;
      color: hsl(var(--muted-foreground));
    }
    
    @media (min-width: 640px) {
      .stat .label { font-size: 0.875rem; }
    }
    
    /* ========================================
       CTA BLOCK
       ======================================== */
    .cta-block {
      text-align: center;
      padding: 1.5rem;
      background: hsl(var(--secondary));
      border-radius: 1rem;
      margin: 3rem auto;
      max-width: 56rem;
    }
    
    @media (min-width: 640px) {
      .cta-block { padding: 2rem; }
    }
    @media (min-width: 768px) {
      .cta-block { padding: 3rem; }
    }
    
    .cta-block h3 {
      font-size: clamp(1.25rem, 3vw, 1.875rem);
      font-weight: 700;
      margin-bottom: 1rem;
      color: hsl(var(--secondary-foreground));
    }
    
    .cta-block p {
      color: hsl(var(--muted-foreground));
      margin-bottom: 1.5rem;
      max-width: 32rem;
      margin-left: auto;
      margin-right: auto;
      font-size: 0.875rem;
    }
    
    @media (min-width: 640px) {
      .cta-block p { font-size: 1rem; }
    }
    
    /* ========================================
       COLUMNS
       ======================================== */
    .columns {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      margin: 2rem auto;
      max-width: 56rem;
    }
    
    @media (min-width: 768px) {
      .columns { grid-template-columns: 1fr 1fr; }
    }
    
    .columns > div {
      color: hsl(var(--foreground));
    }
    
    /* ========================================
       TESTIMONIAL
       ======================================== */
    .testimonial-card {
      padding: 1.5rem;
    }
    
    .testimonial-stars {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
      color: hsl(var(--warning, 45 93% 47%));
    }
    
    .testimonial-text {
      font-style: italic;
      margin-bottom: 1rem;
      color: hsl(var(--muted-foreground));
    }
    
    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .testimonial-author img {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 0 0 2px hsl(var(--primary) / 0.3);
    }
    
    .testimonial-author strong {
      display: block;
      font-weight: 600;
      color: hsl(var(--card-foreground));
    }
    
    .testimonial-author span {
      font-size: 0.875rem;
      color: hsl(var(--muted-foreground));
    }
    
    /* ========================================
       PRICING
       ======================================== */
    .pricing-card {
      padding: 1.5rem;
      text-align: center;
    }
    
    .pricing-card .price {
      font-size: 1.875rem;
      font-weight: 700;
      color: hsl(var(--primary));
      margin: 1rem 0 1.5rem;
    }
    
    .pricing-card ul {
      list-style: none;
      text-align: left;
    }
    
    .pricing-card li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      color: hsl(var(--muted-foreground));
    }
    
    .pricing-card li svg {
      flex-shrink: 0;
      color: hsl(var(--success, 142 76% 36%));
    }
    
    /* ========================================
       FAQ
       ======================================== */
    .faq {
      margin: 2rem auto;
      max-width: 48rem;
    }
    
    .faq-item {
      border: 1px solid hsl(var(--border));
      border-radius: 0.75rem;
      margin-bottom: 1rem;
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
      font-size: 1rem;
      font-family: inherit;
    }
    
    .faq-question:hover { background: hsl(var(--secondary)); }
    
    .faq-question svg {
      transition: transform 0.2s;
      color: hsl(var(--muted-foreground));
    }
    
    .faq-answer {
      padding: 0 1.25rem 1rem;
      color: hsl(var(--muted-foreground));
      display: none;
      background: hsl(var(--card));
    }
    
    .faq-item.open .faq-answer { display: block; }
    .faq-item.open .faq-question { background: hsl(var(--secondary)); }
    .faq-item.open .faq-question svg { transform: rotate(180deg); }
    
    /* ========================================
       CALLOUTS (Warn, Def, Quote)
       ======================================== */
    .callout {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 0.5rem;
      margin: 1rem auto;
      max-width: 48rem;
    }
    
    .callout.warn {
      background: hsl(var(--warning, 45 93% 47%) / 0.1);
      border: 1px solid hsl(var(--warning, 45 93% 47%));
    }
    .callout.warn svg { color: hsl(var(--warning, 45 93% 47%)); }
    
    .callout.info {
      background: hsl(var(--info, 200 98% 39%) / 0.1);
      border: 1px solid hsl(var(--info, 200 98% 39%));
    }
    .callout.info svg { color: hsl(var(--info, 200 98% 39%)); }
    
    .callout.quote-block {
      background: hsl(var(--muted));
      border-left: 4px solid hsl(var(--primary));
      padding: 1.5rem;
      border-radius: 0 0.5rem 0.5rem 0;
    }
    .callout.quote-block svg { color: hsl(var(--primary)); }
    .callout.quote-block p { font-style: italic; font-size: 1.125rem; }
    
    .callout svg { flex-shrink: 0; width: 1.25rem; height: 1.25rem; margin-top: 0.125rem; }
    .callout p { color: hsl(var(--foreground)); margin: 0; }
    
    /* ========================================
       DIVIDER
       ======================================== */
    .divider {
      margin: 3rem auto;
      max-width: 56rem;
    }
    
    .divider hr {
      border: none;
      border-top: 1px solid hsl(var(--border));
    }
    
    .divider.wave {
      overflow: hidden;
    }
    
    .divider.wave svg {
      width: 100%;
      height: 3rem;
      display: block;
    }
    
    /* ========================================
       GALLERY
       ======================================== */
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
      border-radius: 0.75rem;
      width: calc(50% - 0.5rem);
      max-width: 20rem;
    }
    
    @media (min-width: 640px) {
      .gallery-item { width: calc(33.333% - 0.7rem); }
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
      font-weight: 500;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .gallery-item:hover figcaption { opacity: 1; }
    
    /* ========================================
       TIMELINE
       ======================================== */
    .timeline {
      position: relative;
      max-width: 48rem;
      margin: 2rem auto;
      padding-left: 2rem;
    }
    
    .timeline::before {
      content: '';
      position: absolute;
      left: 0.25rem;
      top: 0;
      bottom: 0;
      width: 2px;
      background: hsl(var(--border));
    }
    
    @media (min-width: 640px) {
      .timeline { padding-left: 0; }
      .timeline::before { left: 50%; transform: translateX(-50%); }
    }
    
    .timeline-item {
      position: relative;
      margin-bottom: 2rem;
      padding-left: 2rem;
    }
    
    @media (min-width: 640px) {
      .timeline-item { padding-left: 0; }
    }
    
    .timeline-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 1.5rem;
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      background: hsl(var(--primary));
      box-shadow: 0 0 0 4px hsl(var(--background));
    }
    
    @media (min-width: 640px) {
      .timeline-item::before { left: 50%; transform: translateX(-50%); }
    }
    
    .timeline-date {
      font-size: 0.875rem;
      color: hsl(var(--primary));
      font-weight: 500;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .timeline-content {
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      padding: 1rem;
      border-radius: 0.75rem;
      display: inline-block;
      max-width: 24rem;
      transition: transform 0.3s ease;
    }
    
    .timeline-content:hover { transform: translateX(4px); }
    
    .timeline-content h4 {
      font-weight: 600;
      margin-bottom: 0.25rem;
      color: hsl(var(--foreground));
    }
    
    .timeline-content p {
      font-size: 0.875rem;
      color: hsl(var(--muted-foreground));
      margin: 0;
    }
    
    /* ========================================
       TEAM
       ======================================== */
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
      border-radius: 0.75rem;
      width: 100%;
      max-width: 16rem;
    }
    
    @media (min-width: 640px) {
      .team-member { width: calc(50% - 0.75rem); }
    }
    @media (min-width: 1024px) {
      .team-member { width: calc(25% - 1.125rem); }
    }
    
    .team-member img {
      width: 6rem;
      height: 6rem;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 1rem;
      box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2);
    }
    
    .team-member h4 {
      font-weight: 600;
      margin-bottom: 0.25rem;
      color: hsl(var(--foreground));
    }
    
    .team-member .role {
      font-size: 0.875rem;
      color: hsl(var(--primary));
      margin-bottom: 0.5rem;
    }
    
    .team-member .bio {
      font-size: 0.75rem;
      color: hsl(var(--muted-foreground));
    }
    
    /* ========================================
       COUNTDOWN
       ======================================== */
    .countdown {
      text-align: center;
      padding: 1.5rem;
      background: hsl(var(--secondary));
      border-radius: 1rem;
      max-width: 32rem;
      margin: 2rem auto;
    }
    
    @media (min-width: 640px) {
      .countdown { padding: 2rem; }
    }
    
    .countdown .label {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: hsl(var(--primary));
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .countdown .date {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: hsl(var(--foreground));
    }
    
    .countdown .desc {
      font-size: 0.875rem;
      color: hsl(var(--muted-foreground));
    }
    
    /* ========================================
       EMBED & VIDEO
       ======================================== */
    .embed-block {
      margin: 2rem auto;
      max-width: 56rem;
      border-radius: 0.75rem;
      overflow: hidden;
      border: 1px solid hsl(var(--border));
    }
    
    .embed-block iframe {
      width: 100%;
      height: 24rem;
      border: none;
    }
    
    .video-block {
      margin: 2rem auto;
      max-width: 56rem;
    }
    
    .video-block video {
      width: 100%;
      border-radius: 0.75rem;
      box-shadow: 0 10px 40px -15px hsl(var(--foreground) / 0.2);
    }
    
    /* ========================================
       FOOTER
       ======================================== */
    footer {
      padding: 2rem 1.5rem;
      border-top: 1px solid hsl(var(--border));
      text-align: center;
      color: hsl(var(--muted-foreground));
      font-size: 0.875rem;
    }
    
    footer p { margin: 0; }
    footer .credit { margin-top: 0.5rem; opacity: 0.6; font-size: 0.75rem; }
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
    <p class="credit">Built with Netral</p>
  </footer>
  <script>
    // FAQ Toggle functionality
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
  const escape = escapeHtml;
  
  if (header.type === 'Classic' && header.imageUrl) {
    return `
      <header class="header classic" style="background-image: url('${header.imageUrl}');">
        <h1>${escape(header.title)}</h1>
        <p>${escape(header.description)}</p>
        ${header.link ? `<a href="${escape(header.link)}" class="cta">Learn More →</a>` : ''}
      </header>
    `;
  }
  
  if (header.type === 'SplitImage') {
    return `
      <header class="header split">
        <div>
          <h1>${escape(header.title)}</h1>
          <p>${escape(header.description)}</p>
          ${header.link ? `<a href="${escape(header.link)}" class="cta">Learn More →</a>` : ''}
        </div>
        <div class="header-image">
          ${header.imageUrl ? `<img src="${header.imageUrl}" alt="${escape(header.title)}" />` : ''}
        </div>
      </header>
    `;
  }
  
  // BigText or default
  return `
    <header class="header big-text">
      <h1>${escape(header.title)}</h1>
      <p>${escape(header.description)}</p>
      ${header.link ? `<a href="${escape(header.link)}" class="cta">Learn More →</a>` : ''}
      ${header.imageUrl ? `<img src="${header.imageUrl}" alt="${escape(header.title)}" />` : ''}
    </header>
  `;
}

function generateBlockHtml(block: ContentBlock): string {
  const escape = escapeHtml;
  
  switch (block.type) {
    case 'markdown':
      const sanitizedMarkdown = DOMPurify.sanitize(marked.parse(block.content) as string);
      return `<div class="prose-content">${sanitizedMarkdown}</div>`;
    
    case 'image':
      return `<figure class="image-block"><img src="${block.url}" alt="Content image" loading="lazy" /></figure>`;
    
    case 'bigtitle':
      return `<h2 class="bigtitle">${escape(block.text)}</h2>`;
    
    case 'element':
      return `
        <div class="flex-grid">
          ${block.items.map(item => `
            <div class="flex-card card-hover">
              ${item.image ? `<img src="${item.image}" alt="${escape(item.title)}" loading="lazy" />` : ''}
              <div class="flex-card-content">
                <h3>${escape(item.title)}</h3>
                <p>${escape(item.description)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'column':
      return `
        <div class="columns">
          <div class="prose-content">${escape(block.left)}</div>
          <div class="prose-content">${escape(block.right)}</div>
        </div>
      `;
    
    case 'feature':
      return `
        <div class="flex-grid">
          ${block.items.map(item => `
            <div class="flex-card card-hover">
              <div class="flex-card-content">
                <div class="icon">${item.icon}</div>
                <h3>${escape(item.title)}</h3>
                <p>${escape(item.description)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'testimonial':
      return `
        <div class="flex-grid">
          ${block.items.map(item => `
            <div class="flex-card card-hover testimonial-card">
              <div class="testimonial-stars">
                ${Array(5).fill('<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>').join('')}
              </div>
              <p class="testimonial-text">"${escape(item.text)}"</p>
              <div class="testimonial-author">
                ${item.photo ? `<img src="${item.photo}" alt="${escape(item.name)}" />` : ''}
                <div>
                  <strong>${escape(item.name)}</strong>
                  <span>${escape(item.role)}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'pricing':
      return `
        <div class="flex-grid">
          ${block.items.map(item => `
            <div class="flex-card card-hover pricing-card">
              <h3>${escape(item.title)}</h3>
              <div class="price">${escape(item.price)}</div>
              <ul>
                ${item.benefits.map(b => `
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    ${escape(b)}
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'stats':
      return `
        <div class="stats-grid">
          ${block.items.map(item => `
            <div class="stat card-hover">
              <div class="value">${escape(item.value)}</div>
              <div class="label">${escape(item.label)}</div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'cta':
      return `
        <div class="cta-block">
          <h3>${escape(block.title)}</h3>
          <p>${escape(block.description)}</p>
          <a href="${escape(block.buttonUrl)}" class="btn-primary">${escape(block.buttonText)} →</a>
        </div>
      `;
    
    case 'faq':
      return `
        <div class="faq">
          ${block.items.map(item => `
            <div class="faq-item">
              <button class="faq-question">
                ${escape(item.question)}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <div class="faq-answer">${escape(item.answer)}</div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'timeline':
      return `
        <div class="timeline">
          ${block.items.map(item => `
            <div class="timeline-item">
              <div class="timeline-date">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                ${escape(item.date)}
              </div>
              <div class="timeline-content card-hover">
                <h4>${escape(item.title)}</h4>
                <p>${escape(item.description)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    
    case 'team':
      return `
        <div class="team-grid">
          ${block.items.map(item => `
            <div class="team-member card-hover">
              ${item.photo ? `<img src="${item.photo}" alt="${escape(item.name)}" />` : ''}
              <h4>${escape(item.name)}</h4>
              <div class="role">${escape(item.role)}</div>
              ${item.bio ? `<p class="bio">${escape(item.bio)}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    
    case 'countdown':
      return `
        <div class="countdown">
          <div class="label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${escape(block.label)}
          </div>
          <div class="date">${escape(block.date)}</div>
          ${block.description ? `<p class="desc">${escape(block.description)}</p>` : ''}
        </div>
      `;
    
    case 'gallery':
      return `
        <div class="gallery">
          ${block.items.map(item => `
            <figure class="gallery-item">
              <img src="${item.url}" alt="${escape(item.caption || '')}" loading="lazy" />
              ${item.caption ? `<figcaption>${escape(item.caption)}</figcaption>` : ''}
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
      return `
        <div class="callout warn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p>${escape(block.text)}</p>
        </div>
      `;
    
    case 'def':
      return `
        <div class="callout info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p>${escape(block.text)}</p>
        </div>
      `;
    
    case 'quote':
      return `
        <div class="callout quote-block">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
          </svg>
          <p>${escape(block.text)}</p>
        </div>
      `;
    
    case 'embed':
      return `<div class="embed-block"><iframe src="${block.url}" title="Embedded content" loading="lazy"></iframe></div>`;
    
    case 'video':
      return `<div class="video-block"><video src="${block.url}" controls>Your browser does not support the video tag.</video></div>`;
    
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
