import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeAndValidateUrl,
  parseAndValidateUrls,
  parseInputLines,
} from '../src/url-utils.js';

test('parseInputLines trims entries and ignores blank lines', () => {
  assert.deepEqual(parseInputLines('  example.com  \n\n https://mozilla.org  '), [
    {
      lineNumber: 1,
      raw: '  example.com  ',
      trimmed: 'example.com',
    },
    {
      lineNumber: 3,
      raw: ' https://mozilla.org  ',
      trimmed: 'https://mozilla.org',
    },
  ]);
});

test('normalizeAndValidateUrl adds https when protocol is missing', () => {
  assert.deepEqual(normalizeAndValidateUrl('example.com'), {
    ok: true,
    url: 'https://example.com',
  });
});

test('normalizeAndValidateUrl preserves explicit valid URLs', () => {
  assert.deepEqual(normalizeAndValidateUrl(' http://localhost:3000/test '), {
    ok: true,
    url: 'http://localhost:3000/test',
  });
});

test('normalizeAndValidateUrl rejects text that is not a plausible missing-scheme URL', () => {
  assert.deepEqual(normalizeAndValidateUrl('notaurl'), {
    ok: false,
    reason: 'invalid',
  });
});

test('parseAndValidateUrls blocks the entire action when any line is invalid', () => {
  assert.deepEqual(parseAndValidateUrls('example.com\nht!tp://bad'), {
    ok: false,
    message: 'Line 2 is not a valid URL: "ht!tp://bad". No tabs were opened.',
  });
});

test('parseAndValidateUrls preserves duplicates and order', () => {
  assert.deepEqual(parseAndValidateUrls('example.com\nhttps://example.com\nexample.com'), {
    ok: true,
    urls: ['https://example.com', 'https://example.com', 'https://example.com'],
  });
});

test('parseAndValidateUrls requires at least one URL', () => {
  assert.deepEqual(parseAndValidateUrls('\n  \n'), {
    ok: false,
    message: 'Enter at least one URL.',
  });
});

test('normalizeAndValidateUrl accepts localhost and IPv4 inputs without a scheme', () => {
  assert.deepEqual(normalizeAndValidateUrl('localhost:3000/path'), {
    ok: true,
    url: 'https://localhost:3000/path',
  });

  assert.deepEqual(normalizeAndValidateUrl('127.0.0.1:8080'), {
    ok: true,
    url: 'https://127.0.0.1:8080',
  });
});
