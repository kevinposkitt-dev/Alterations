// Checks the Seamly2D command line we build, against the flags in `seamly2d --help`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildExportArgs, FORMATS } from '../src/seamly.js';

test('builds a PDF export with console mode, output folder and format', () => {
  const args = buildExportArgs({
    patternPath: '/work/block.sm2d',
    outputDir: '/work/out',
    basename: 'block',
    format: 'pdf',
  });
  assert.deepEqual(args, ['/work/block.sm2d', '-b', 'block', '-d', '/work/out', '-f', '1']);
});

test('adds the measurement file with -m when re-measuring', () => {
  const args = buildExportArgs({
    patternPath: '/work/block.sm2d',
    outputDir: '/work/out',
    basename: 'block',
    format: 'dxf',
    measurementPath: '/work/client.smis',
  });
  assert.deepEqual(args.slice(-2), ['-m', '/work/client.smis']);
  assert.equal(args[args.indexOf('-f') + 1], String(FORMATS.dxf));
});

test('rejects formats that are not in the mapping', () => {
  assert.throws(
    () => buildExportArgs({ patternPath: 'a', outputDir: 'b', basename: 'c', format: 'exe' }),
    /unsupported export format/,
  );
});
