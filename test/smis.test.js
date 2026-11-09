import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSmisXml, validateMeasurements } from '../src/smis.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const sample = readFileSync(
  path.join(here, '..', 'fixtures', 'measurements', 'measurementstest.smis'),
  'utf8',
);

test('output has the same structure as a SeamlyMe-saved file', () => {
  const xml = buildSmisXml({ unit: 'cm', measurements: { width_bust: 35 } });
  // Same element order and version as the SeamlyMe sample.
  const tags = (s) => [...s.matchAll(/<([a-z_-]+)[ />]/g)].map((m) => m[1]);
  assert.deepEqual(tags(xml), tags(sample));
  assert.match(xml, /<version>0\.3\.4<\/version>/);
  assert.match(xml, /<unit>cm<\/unit>/);
});

test('writes one m element per measurement, in order', () => {
  const xml = buildSmisXml({
    unit: 'cm',
    measurements: { width_bust: 96.5, width_waist: 76, back_waist_length: 42 },
  });
  const rows = [...xml.matchAll(/<m name="([^"]+)" value="([^"]+)"\/>/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(rows, [
    ['width_bust', '96.5'],
    ['width_waist', '76'],
    ['back_waist_length', '42'],
  ]);
});

test('rejects bad units, names and values', () => {
  const errors = validateMeasurements('furlongs', { 'Bust Size': -3, ok_name: 'wide' });
  assert.equal(errors.length, 4);
});

test('refuses to write an empty measurement set', () => {
  assert.throws(() => buildSmisXml({ unit: 'cm', measurements: {} }), /at least one measurement/);
});
