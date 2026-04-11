const SPECIAL_SCHEMES = new Set([
  'about',
  'data',
  'file',
  'ftp',
  'http',
  'https',
  'mailto',
  'moz-extension',
  'news',
  'tel',
]);
const IPV4_PATTERN = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export function parseInputLines(text) {
  return text.split(/\r?\n/).map((rawLine, index) => ({
    lineNumber: index + 1,
    raw: rawLine,
    trimmed: rawLine.trim(),
  })).filter((line) => line.trimmed.length > 0);
}

export function normalizeAndValidateUrl(input) {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      ok: false,
      reason: 'empty',
    };
  }

  if (hasExplicitScheme(trimmed)) {
    return isValidAbsoluteUrl(trimmed)
      ? { ok: true, url: trimmed }
      : { ok: false, reason: 'invalid' };
  }

  if (!looksLikeMissingSchemeUrl(trimmed)) {
    return {
      ok: false,
      reason: 'invalid',
    };
  }

  const normalizedUrl = `https://${trimmed}`;

  return isValidAbsoluteUrl(normalizedUrl)
    ? { ok: true, url: normalizedUrl }
    : { ok: false, reason: 'invalid' };
}

function hasExplicitScheme(value) {
  if (value.includes('://')) {
    return true;
  }

  const schemeMatch = value.match(/^([a-zA-Z][a-zA-Z\d+.-]*):/);

  if (!schemeMatch) {
    return false;
  }

  return SPECIAL_SCHEMES.has(schemeMatch[1].toLowerCase());
}

export function parseAndValidateUrls(text) {
  const lines = parseInputLines(text);

  if (lines.length === 0) {
    return {
      ok: false,
      message: 'Enter at least one URL.',
    };
  }

  const urls = [];

  for (const line of lines) {
    const result = normalizeAndValidateUrl(line.trimmed);

    if (!result.ok) {
      return {
        ok: false,
        message: `Line ${line.lineNumber} is not a valid URL: "${line.trimmed}". No tabs were opened.`,
      };
    }

    urls.push(result.url);
  }

  return {
    ok: true,
    urls,
  };
}

function isValidAbsoluteUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function looksLikeMissingSchemeUrl(value) {
  if (value.startsWith('/') || value.startsWith('.')) {
    return false;
  }

  if (/\s/.test(value)) {
    return false;
  }

  let parsed;

  try {
    parsed = new URL(`https://${value}`);
  } catch {
    return false;
  }

  const hostname = parsed.hostname;

  if (!hostname) {
    return false;
  }

  if (hostname === 'localhost') {
    return true;
  }

  if (IPV4_PATTERN.test(hostname)) {
    return true;
  }

  if (hostname.includes(':')) {
    return true;
  }

  return hostname.includes('.');
}
