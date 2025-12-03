/**
 * HTML Exporter
 * Exports Markdown content to standalone HTML files
 */

import { renderMarkdown } from '../renderer/markdownRenderer';

/**
 * Generate a complete HTML document from Markdown
 */
export function exportToHtml(markdown: string, title: string = 'Netral Document'): string {
  const renderedContent = renderMarkdown(markdown);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="Netral Block">
  <title>${escapeHtml(title)}</title>
  <style>
    /* Reset and base styles */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background: #ffffff;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      font-weight: 600;
      line-height: 1.3;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }

    h1 { font-size: 2.25rem; }
    h2 { font-size: 1.75rem; }
    h3 { font-size: 1.5rem; }
    h4 { font-size: 1.25rem; }

    p { margin-bottom: 1rem; }

    a {
      color: #2563eb;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Code */
    code {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      background: #f4f4f5;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.875em;
    }

    pre {
      background: #f4f4f5;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin-bottom: 1rem;
    }

    pre code {
      background: transparent;
      padding: 0;
    }

    /* Blockquote */
    blockquote {
      border-left: 4px solid #2563eb;
      padding-left: 1rem;
      color: #71717a;
      font-style: italic;
      margin: 1rem 0;
    }

    /* Lists */
    ul, ol {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }

    li { margin-bottom: 0.25rem; }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }

    th, td {
      border: 1px solid #e4e4e7;
      padding: 0.5rem 1rem;
      text-align: left;
    }

    th {
      background: #f4f4f5;
      font-weight: 600;
    }

    /* Images */
    img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
    }

    hr {
      border: none;
      border-top: 1px solid #e4e4e7;
      margin: 1.5rem 0;
    }

    /* Netral Components */
    .netral-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      background: #2563eb;
      color: white;
      border-radius: 0.375rem;
      font-weight: 500;
      font-size: 0.875rem;
      text-decoration: none;
      transition: opacity 0.2s;
    }

    .netral-button:hover {
      opacity: 0.9;
      text-decoration: none;
    }

    .netral-block {
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      border: 1px solid;
    }

    .netral-block.warning {
      background: rgba(245, 158, 11, 0.1);
      border-color: #f59e0b;
    }

    .netral-block.info {
      background: rgba(14, 165, 233, 0.1);
      border-color: #0ea5e9;
    }

    .netral-block.success {
      background: rgba(34, 197, 94, 0.1);
      border-color: #22c55e;
    }

    .netral-block.error {
      background: rgba(239, 68, 68, 0.1);
      border-color: #ef4444;
    }

    .netral-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .netral-gallery img {
      width: 100%;
      height: 160px;
      object-fit: cover;
    }

    /* Footer */
    .netral-footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #e4e4e7;
      text-align: center;
      color: #71717a;
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <article>
    ${renderedContent}
  </article>
  <footer class="netral-footer">
    Generated with Netral Block
  </footer>
</body>
</html>`;

  return html;
}

/**
 * Download HTML file
 */
export function downloadHtml(markdown: string, filename: string = 'document.html'): void {
  const html = exportToHtml(markdown, filename.replace('.html', ''));
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
export async function copyHtmlToClipboard(markdown: string): Promise<boolean> {
  try {
    const html = exportToHtml(markdown);
    await navigator.clipboard.writeText(html);
    return true;
  } catch (error) {
    console.error('Failed to copy HTML:', error);
    return false;
  }
}

/**
 * Escape HTML special characters
 */
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
