// Needs a real Seamly2D install. Skipped unless SEAMLY_BIN points at the executable.
// Also needs a pattern file: set SEAMLY_TEST_PATTERN to a .sm2d file to export.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveSeamlyBinary, exportPattern } from '../src/seamly.js';

const skip = !process.env.SEAMLY_BIN || !process.env.SEAMLY_TEST_PATTERN
  ? 'set SEAMLY_BIN and SEAMLY_TEST_PATTERN to run'
  : false;

test('resolves the configured Seamly2D binary', { skip }, async () => {
  const found = await resolveSeamlyBinary(process.env);
  assert.equal(found.ok, true, found.reason);
});

test('exports the test pattern to PDF', { skip }, async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'seamly-test-'));
  const result = await exportPattern({
    bin: process.env.SEAMLY_BIN,
    patternPath: process.env.SEAMLY_TEST_PATTERN,
    outputDir: dir,
    basename: 'pattern',
    format: 'pdf',
  });
  assert.equal(result.ok, true, result.reason);
  // Output name is not verified yet; accept any non-empty PDF in the output folder.
  const pdfs = readdirSync(dir).filter((f) => f.endsWith('.pdf'));
  assert.ok(pdfs.length > 0, 'export did not create a PDF in the output folder');
  assert.ok(statSync(path.join(dir, pdfs[0])).size > 0, 'exported PDF is empty');
});
