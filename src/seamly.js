// Adapter for the Seamly2D command-line program.
//
// Seamly2D is a desktop app, installed separately on each machine. Its location
// comes from the SEAMLY_BIN environment variable so the same code runs on a Mac
// and on Windows.
//
// NOTE: the export arguments below are a placeholder. They must be confirmed
// against the Seamly2D version installed on the test machine before the
// integration test is trusted.

import { execFile } from 'node:child_process';
import { access, constants } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function resolveSeamlyBinary(env = process.env) {
  const bin = env.SEAMLY_BIN;
  if (!bin) {
    return { ok: false, reason: 'SEAMLY_BIN is not set. Point it at the Seamly2D executable.' };
  }
  try {
    await access(bin, constants.X_OK);
  } catch {
    return { ok: false, reason: `SEAMLY_BIN does not point to an executable file: ${bin}` };
  }
  return { ok: true, path: bin };
}

// UNVERIFIED: argument layout for exporting a pattern. Confirm with the real CLI.
export function buildExportArgs({ patternPath, outputPath, format }) {
  return [patternPath, '--export', format, '--output', outputPath];
}

export async function exportPattern({ bin, patternPath, outputPath, format, timeoutMs = 120_000 }) {
  const args = buildExportArgs({ patternPath, outputPath, format });
  try {
    const { stdout, stderr } = await execFileAsync(bin, args, { timeout: timeoutMs });
    return { ok: true, stdout, stderr };
  } catch (err) {
    return { ok: false, reason: err.message, stderr: err.stderr ?? '' };
  }
}
