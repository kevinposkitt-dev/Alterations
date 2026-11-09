import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMeasurementSet, getMeasurement, validateMeasurementSet } from '../src/measurements.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => path.join(here, '..', 'fixtures', 'measurements', name);

test('loads a valid measurement set', async () => {
  const set = await loadMeasurementSet(fixture('sample-womens-m.json'));
  assert.equal(set.units, 'cm');
  assert.equal(getMeasurement(set, 'bust'), 96);
});

test('rejects unknown units', async () => {
  await assert.rejects(loadMeasurementSet(fixture('invalid-units.json')), /"units" must be "cm" or "in"/);
});

test('rejects non-positive and non-numeric measurements', () => {
  const errors = validateMeasurementSet({
    name: 'x',
    units: 'in',
    measurements: { bust: -1, hip: 'wide', waist: 0 },
  });
  assert.equal(errors.length, 3);
});

test('getMeasurement names the known keys on a miss', async () => {
  const set = await loadMeasurementSet(fixture('sample-womens-m.json'));
  assert.throws(() => getMeasurement(set, 'inseam'), /Known: .*bust/);
});
