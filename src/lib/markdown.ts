/**
 * Minimal, XSS-safe Markdown renderer for AI output.
 *
 * Deliberately a whitelist subset built by string construction rather than
 * innerHTML of untrusted input: every text node is escaped first, and only a
 * fixed set of tags is ever emitted. There is no path from model output to
 * executable markup.
 */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Only http(s) and mailto links are allowed; everything else is rendered as text. */
function safeHref(url: string): string | null {
  const u = url.trim();
  if (/^(https?:\/\/|mailto:)/i.test(u)) return esc(u);
  return null;
}

function inline(src: string): string {
  let s = esc(src);
  // code spans first, so their contents are not further transformed
  s = s.replace(/`([^`]+)`/g, (_m, c) => `<code>${c}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, href) => {
    const h = safeHref(href);
    return h ? `<a href="${h}" rel="noopener noreferrer nofollow" target="_blank">${text}</a>` : text;
  });
  return s;
}

export function renderMarkdown(md: string): string {
  const lines = (md ?? '').replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;

  const flushList = (buf: string[], ordered: boolean) => {
    if (!buf.length) return;
    const tag = ordered ? 'ol' : 'ul';
    out.push(`<${tag}>${buf.map((li) => `<li>${inline(li)}</li>`).join('')}</${tag}>`);
    buf.length = 0;
  };

  let ul: string[] = []; let ol: string[] = []; let para: string[] = [];

  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const flushAll = () => { flushPara(); flushList(ul, false); flushList(ol, true); };

  while (i < lines.length) {
    const line = lines[i] ?? '';

    // fenced code
    const fence = line.match(/^\s*```(\w*)\s*$/);
    if (fence) {
      flushAll();
      const lang = fence[1] || '';
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i] ?? '')) { buf.push(lines[i] ?? ''); i++; }
      i++; // closing fence
      out.push(`<pre${lang ? ` data-lang="${esc(lang)}"` : ''}><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // heading
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { flushAll(); const lvl = Math.min(4, h[1]!.length); out.push(`<h${lvl}>${inline(h[2] ?? '')}</h${lvl}>`); i++; continue; }

    // hr
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) { flushAll(); out.push('<hr />'); i++; continue; }

    // blockquote
    const bq = line.match(/^\s*>\s?(.*)$/);
    if (bq) {
      flushAll();
      const buf: string[] = [bq[1] ?? ''];
      i++;
      while (i < lines.length) { const m = (lines[i] ?? '').match(/^\s*>\s?(.*)$/); if (!m) break; buf.push(m[1] ?? ''); i++; }
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`);
      continue;
    }

    // table
    if (/^\s*\|.*\|\s*$/.test(line) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? '')) {
      flushAll();
      const cells = (r: string) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i] ?? '')) { body.push(cells(lines[i] ?? '')); i++; }
      out.push('<table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>'
        + body.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>');
      continue;
    }

    // lists
    const u = line.match(/^\s*[-*+]\s+(.*)$/);
    const o = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (u) { flushPara(); flushList(ol, true); ul.push(u[1] ?? ''); i++; continue; }
    if (o) { flushPara(); flushList(ul, false); ol.push(o[1] ?? ''); i++; continue; }

    if (line.trim() === '') { flushAll(); i++; continue; }

    flushList(ul, false); flushList(ol, true);
    para.push(line.trim());
    i++;
  }
  flushAll();
  return out.join('\n');
}
