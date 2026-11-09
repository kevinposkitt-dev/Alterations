// Measurement sets: plain JSON files with named body measurements.
//
// Shape:
//   { "name": "...", "units": "cm" | "in", "measurements": { "bust": 96, ... } }

import { readFile } from 'node:fs/promises';

const ALLOWED_UNITS = new Set(['cm', 'in']);

export function validateMeasurementSet(data) {
  const errors = [];
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return ['measurement set must be a JSON object'];
  }
  if (typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('"name" must be a non-empty string');
  }
  if (!ALLOWED_UNITS.has(data.units)) {
    errors.push('"units" must be "cm" or "in"');
  }
  if (typeof data.measurements !== 'object' || data.measurements === null || Array.isArray(data.measurements)) {
    errors.push('"measurements" must be an object');
  } else {
    for (const [key, value] of Object.entries(data.measurements)) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        errors.push(`measurement "${key}" must be a positive finite number`);
      }
    }
  }
  return errors;
}

export async function loadMeasurementSet(filePath) {
  const raw = await readFile(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`invalid JSON in ${filePath}: ${err.message}`);
  }
  const errors = validateMeasurementSet(data);
  if (errors.length > 0) {
    throw new Error(`invalid measurement set ${filePath}: ${errors.join('; ')}`);
  }
  return data;
}

export function getMeasurement(set, key) {
  if (!Object.prototype.hasOwnProperty.call(set.measurements, key)) {
    const known = Object.keys(set.measurements).sort().join(', ');
    throw new Error(`no measurement "${key}" in "${set.name}". Known: ${known}`);
  }
  return set.measurements[key];
}
