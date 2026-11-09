import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(path.join(here, '..', 'knowledge', 'figure_variations.json'), 'utf8'));

test('every figure variation has the required fields', () => {
  assert.ok(Array.isArray(data.variations) && data.variations.length > 0);
  for (const v of data.variations) {
    assert.match(v.id, /^[a-z]+-\d{2}-[a-z-]+$/, `bad id ${v.id}`);
    assert.ok(v.area && v.name && v.figure_analysis && v.change_required, `missing field in ${v.id}`);
    assert.ok(Array.isArray(v.fitting_analysis) && v.fitting_analysis.length > 0, `no fitting analysis in ${v.id}`);
    assert.ok(v.source && v.source.book && v.source.pages, `no source in ${v.id}`);
    assert.ok(['draft', 'reviewed'].includes(v.status), `bad status in ${v.id}`);
    assert.ok('slash' in v.methods && 'seam' in v.methods && 'pivot' in v.methods, `methods incomplete in ${v.id}`);
  }
});

test('figure variation ids are unique', () => {
  const ids = data.variations.map((v) => v.id);
  assert.equal(new Set(ids).size, ids.length);
});
