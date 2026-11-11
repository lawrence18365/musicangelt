'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

const REMOVED_ELEMENTS = new Set(['script', 'style', 'noscript', 'template']);

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  rarr: '\u2192',
  larr: '\u2190',
  mdash: '\u2014',
  ndash: '\u2013',
  hellip: '\u2026',
  rsquo: '\u2019',
  lsquo: '\u2018',
  rdquo: '\u201d',
  ldquo: '\u201c',
  euro: '\u20ac'
};

// Names of pages under test, as repository-relative POSIX paths.
function pagePaths() {
  const pages = [
    'wedding-band-cost-ireland/index.html',
    'compare-bands/index.html'
  ];
  for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('wedding-bands-')) continue;
    const rel = entry.name + '/index.html';
    if (fs.existsSync(path.join(ROOT, rel))) pages.push(rel);
  }
  return pages;
}

// Find the end of a start tag, ignoring ">" inside quoted attribute values.
function tagEnd(html, start) {
  let quote = null;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '>') {
      return i;
    }
  }
  return -1;
}

function parseAttributes(raw) {
  const attrs = Object.create(null);
  let rest = raw.replace(/^\s*\/?\s*/, '');
  rest = rest.replace(/^[^\s\/>]+/, '');
  const re = /([^\s"'=<>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = re.exec(rest)) !== null) {
    const name = match[1].toLowerCase();
    const value =
      match[2] !== undefined ? match[2] :
      match[3] !== undefined ? match[3] :
      match[4] !== undefined ? match[4] : '';
    attrs[name] = value;
  }
  return attrs;
}

// Split HTML into text and tag tokens. The input must not contain raw-text
// elements (script/style), which are removed beforehand.
function scanTokens(html) {
  const tokens = [];
  let textStart = 0;
  let i = 0;

  const pushText = (end) => {
    if (end > textStart) {
      tokens.push({ type: 'text', value: html.slice(textStart, end) });
    }
  };

  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) {
      pushText(html.length);
      break;
    }

    if (html.startsWith('<!--', lt)) {
      pushText(lt);
      const end = html.indexOf('-->', lt + 4);
      i = end === -1 ? html.length : end + 3;
      textStart = i;
      continue;
    }

    if (html.startsWith('<!', lt) || html.startsWith('<?', lt)) {
      pushText(lt);
      const end = html.indexOf('>', lt + 2);
      i = end === -1 ? html.length : end + 1;
      textStart = i;
      continue;
    }

    const end = tagEnd(html, lt + 1);
    if (end === -1) {
      pushText(html.length);
      break;
    }

    pushText(lt);
    const raw = html.slice(lt + 1, end);
    const closing = /^\s*\//.test(raw);
    const selfClosing = /\/\s*$/.test(raw);
    const nameMatch = raw.replace(/^\s*\/?\s*/, '').match(/^[^\s\/>]+/);
    const name = nameMatch ? nameMatch[0].toLowerCase() : '';
    tokens.push({ type: 'tag', name, closing, selfClosing, raw, attrs: parseAttributes(raw) });
    i = end + 1;
    textStart = i;
  }

  return tokens;
}

// Remove raw-text elements (script/style) including everything up to their
// matching closing tag. Their content is not HTML, so it must not be scanned.
function stripRawTextElements(html, names) {
  let result = html;
  for (const name of names) {
    const openRe = new RegExp('<' + name + '\\b[^>]*>', 'gi');
    const closeRe = new RegExp('</' + name + '\\s*>', 'gi');
    let out = '';
    let copiedTo = 0;
    let match;
    while ((match = openRe.exec(result)) !== null) {
      closeRe.lastIndex = match.index + match[0].length;
      const close = closeRe.exec(result);
      out += result.slice(copiedTo, match.index);
      if (!close) {
        copiedTo = result.length;
        break;
      }
      copiedTo = close.index + close[0].length;
      openRe.lastIndex = copiedTo;
    }
    out += result.slice(copiedTo);
    result = out;
  }
  return result;
}

function isHiddenStartTag(token) {
  if (!token || token.type !== 'tag' || token.closing) return false;
  if (REMOVED_ELEMENTS.has(token.name)) return true;
  if ('hidden' in token.attrs) return true;
  const ariaHidden = token.attrs['aria-hidden'];
  if (ariaHidden !== undefined && ariaHidden.trim().toLowerCase() === 'true') return true;
  const style = token.attrs.style;
  if (style !== undefined && style.replace(/\s+/g, '').toLowerCase().includes('display:none')) return true;
  return false;
}

// Drop hidden elements (and their content) using a depth counter for nesting
// of the same tag name. Other tags inside a hidden subtree are consumed.
function removeHiddenElements(tokens) {
  const out = [];
  const suppressed = [];

  for (const token of tokens) {
    if (token.type === 'text') {
      if (suppressed.length === 0) out.push(token);
      continue;
    }

    if (suppressed.length > 0) {
      const top = suppressed[suppressed.length - 1];
      if (token.closing) {
        if (token.name === top.name) {
          top.depth -= 1;
          if (top.depth === 0) suppressed.pop();
        }
      } else if (!token.selfClosing && !VOID_ELEMENTS.has(token.name) && token.name === top.name) {
        top.depth += 1;
      }
      continue;
    }

    if (isHiddenStartTag(token)) {
      if (!token.selfClosing && !VOID_ELEMENTS.has(token.name)) {
        suppressed.push({ name: token.name, depth: 1 });
      }
      continue;
    }

    out.push(token);
  }

  return out;
}

function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, body) => {
    if (body[0] === '#') {
      const hex = body[1] === 'x' || body[1] === 'X';
      const code = parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);
      if (Number.isFinite(code) && code >= 0 && code <= 0x10ffff) {
        try {
          return String.fromCodePoint(code);
        } catch {
          return whole;
        }
      }
      return whole;
    }
    const named = ENTITIES[body.toLowerCase()];
    return named !== undefined ? named : whole;
  });
}

function normalize(text) {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function visibleText(html) {
  const bodyOpen = html.search(/<body\b/i);
  let body = html;
  if (bodyOpen !== -1) {
    const startTagEnd = tagEnd(html, bodyOpen + 5);
    const bodyClose = html.toLowerCase().indexOf('</body>', startTagEnd + 1);
    if (startTagEnd !== -1) {
      body = html.slice(startTagEnd + 1, bodyClose === -1 ? html.length : bodyClose);
    }
  }

  body = body.replace(/<!--[\s\S]*?-->/g, '');
  body = stripRawTextElements(body, ['script', 'style']);

  const tokens = removeHiddenElements(scanTokens(body));

  // Every remaining tag becomes a single space; text is kept as-is.
  let text = '';
  for (const token of tokens) {
    text += token.type === 'text' ? token.value : ' ';
  }

  return normalize(decodeEntities(text));
}

function extractJsonLdBlocks(html) {
  const blocks = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const attrs = parseAttributes('script' + match[1]);
    if ((attrs.type || '').trim().toLowerCase() === 'application/ld+json') {
      blocks.push(match[2]);
    }
  }
  return blocks;
}

function typesOf(value) {
  return Array.isArray(value) ? value : [value];
}

function hasType(object, type) {
  return typesOf(object['@type']).some((value) => value === type);
}

function numberWithCommas(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function collect(value, strings, prices) {
  if (Array.isArray(value)) {
    for (const item of value) collect(item, strings, prices);
    return;
  }
  if (value === null || typeof value !== 'object') return;

  if (hasType(value, 'Question') && typeof value.name === 'string') {
    strings.push(value.name);
  }
  if (hasType(value, 'Answer') && typeof value.text === 'string') {
    strings.push(value.text);
  }
  if (hasType(value, 'Offer')) {
    if (typeof value.name === 'string') strings.push(value.name);
    if (typeof value.description === 'string') strings.push(value.description);
  }
  if (hasType(value, 'PriceSpecification') || hasType(value, 'Offer')) {
    for (const field of ['price', 'minPrice', 'maxPrice']) {
      const amount = value[field];
      if (amount === undefined || amount === null || String(amount).trim() === '') continue;
      prices.push(String(amount).trim());
    }
  }

  for (const key of Object.keys(value)) {
    collect(value[key], strings, prices);
  }
}

const pages = pagePaths();

for (const pagePath of pages) {
  test(pagePath, () => {
    const html = fs.readFileSync(path.join(ROOT, pagePath), 'utf8');
    const visible = visibleText(html);
    const strings = [];
    const prices = [];

    for (const block of extractJsonLdBlocks(html)) {
      let data;
      try {
        data = JSON.parse(block);
      } catch (error) {
        assert.fail(`${pagePath}: JSON-LD does not parse as JSON: ${error.message}`);
      }
      collect(data, strings, prices);
    }

    for (const raw of strings) {
      const wanted = normalize(raw);
      assert.ok(
        visible.includes(wanted),
        `${pagePath}: JSON-LD wording is not visible on the page: "${wanted.slice(0, 80)}"`
      );
    }

    for (const amount of prices) {
      const plain = `\u20ac${amount}`;
      const grouped = `\u20ac${numberWithCommas(amount)}`;
      assert.ok(
        visible.includes(plain) || visible.includes(grouped),
        `${pagePath}: JSON-LD price is not visible on the page: "${plain.slice(0, 80)}" (or "${grouped.slice(0, 80)}")`
      );
    }
  });
}
