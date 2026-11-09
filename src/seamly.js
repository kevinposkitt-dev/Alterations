// Adapter for the Seamly2D command-line program (export mode).
//
// Seamly2D is a desktop app, installed separately on each machine. Its location
// comes from the SEAMLY_BIN environment variable so the same code runs on a Mac
// and on Windows.
//
// Flags come from `seamly2d --help` (Seamly2D on macOS):
//   <pattern.sm2d>  pattern file (positional)
//   -b <basename>   enables console export mode and sets the output file name
//   -d <dir>        output folder
//   -m <file.vit>   custom measurement file, so the pattern is re-measured
//   -f <number>     output format number

import { execFile } from 'node:child_process';
import { access, constants } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// Format numbers from the --help output.
export const FORMATS = {
  svg: 0,
  pdf: 1,
  'pdf-tiled': 2,
  png: 3,
  dxf: 13, // AutoCAD DXF R14 (flat)
};

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

export function buildExportArgs({ patternPath, outputDir, basename, format, measurementPath }) {
  if (!Object.prototype.hasOwnProperty.call(FORMATS, format)) {
    throw new Error(`unsupported export format: ${format}`);
  }
  const args = [patternPath, '-b', basename, '-d', outputDir, '-f', String(FORMATS[format])];
  if (measurementPath) {
    args.push('-m', measurementPath);
  }
  return args;
}

export async function exportPattern({ bin, timeoutMs = 120_000, ...options }) {
  const args = buildExportArgs(options);
  try {
    const { stdout, stderr } = await execFileAsync(bin, args, { timeout: timeoutMs });
    return { ok: true, stdout, stderr };
  } catch (err) {
    return { ok: false, reason: err.message, stderr: err.stderr ?? '' };
  }
}
