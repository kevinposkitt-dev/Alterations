// Writes SeamlyMe measurement files (.smis).
//
// Format copied from a file saved by SeamlyMe 2026.11.9 (version 0.3.4):
//   <smis> with version, read-only, notes, unit, pm_system, personal and
//   <body-measurements> containing one <m name="..." value="..."/> per measurement.

const NAME_PATTERN = /^[a-z][a-z0-9_]*$/;

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function validateMeasurements(unit, measurements) {
  const errors = [];
  if (unit !== 'cm' && unit !== 'in') {
    errors.push('unit must be "cm" or "in"');
  }
  if (typeof measurements !== 'object' || measurements === null || Array.isArray(measurements)) {
    errors.push('measurements must be an object of name: value');
    return errors;
  }
  const entries = Object.entries(measurements);
  if (entries.length === 0) {
    errors.push('at least one measurement is required');
  }
  for (const [name, value] of entries) {
    if (!NAME_PATTERN.test(name)) {
      errors.push(`measurement name "${name}" must be lowercase letters, digits and underscores`);
    }
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      errors.push(`measurement "${name}" must be a positive number`);
    }
  }
  return errors;
}

export function buildSmisXml({ unit, measurements }) {
  const errors = validateMeasurements(unit, measurements);
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
  const rows = Object.entries(measurements)
    .map(([name, value]) => `        <m name="${escapeXml(name)}" value="${value}"/>`)
    .join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<smis>',
    '    <!--Measurements created with the sewing pattern MCP server.-->',
    '    <version>0.3.4</version>',
    '    <read-only>false</read-only>',
    '    <notes/>',
    `    <unit>${unit}</unit>`,
    '    <pm_system>998</pm_system>',
    '    <personal>',
    '        <family-name/>',
    '        <given-name/>',
    '        <birth-date>1800-01-01</birth-date>',
    '        <gender>unknown</gender>',
    '        <email/>',
    '    </personal>',
    '    <body-measurements>',
    rows,
    '    </body-measurements>',
    '</smis>',
    '',
  ].join('\n');
}
