import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const idx = JSON.parse(readFileSync(path.join(here, '..', 'knowledge', 'fashionpedia_index.json'), 'utf8'));

test('fashionpedia index counts match the stored lists', () => {
  const cats = Object.values(idx.categories_by_supercategory).flat();
  const atts = Object.values(idx.attributes_by_supercategory).flat();
  assert.equal(cats.length, idx.counts.categories);
  assert.equal(atts.length, idx.counts.attributes);
});

test('licence is marked pending', () => {
  assert.match(idx.licence, /PENDING/);
});
