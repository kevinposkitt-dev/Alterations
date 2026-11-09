#!/usr/bin/env node
// Sewing pattern MCP server (stdio transport).
//
// Files are read from a workspace folder given by SEWING_WORKSPACE (default:
// the current directory). Tool paths are relative to that folder and may not
// escape it.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadMeasurementSet, getMeasurement } from './measurements.js';
import { resolveSeamlyBinary, exportPattern } from './seamly.js';

export function resolveInWorkspace(root, relPath) {
  const absRoot = path.resolve(root);
  const abs = path.resolve(absRoot, relPath);
  if (abs !== absRoot && !abs.startsWith(absRoot + path.sep)) {
    throw new Error(`path escapes the workspace: ${relPath}`);
  }
  return abs;
}

function textResult(text, isError = false) {
  return { content: [{ type: 'text', text }], isError };
}

export function createServer({ workspace = process.env.SEWING_WORKSPACE || process.cwd(), env = process.env } = {}) {
  const server = new McpServer({ name: 'sewing-pattern-mcp', version: '0.1.0' });

  server.registerTool(
    'get_measurement',
    {
      description: 'Read one named measurement from a measurement-set JSON file in the workspace.',
      inputSchema: {
        file: z.string().describe('Path to the measurement JSON file, relative to the workspace'),
        key: z.string().describe('Measurement name, e.g. "bust"'),
      },
    },
    async ({ file, key }) => {
      try {
        const set = await loadMeasurementSet(resolveInWorkspace(workspace, file));
        const value = getMeasurement(set, key);
        return textResult(`${key} = ${value} ${set.units}`);
      } catch (err) {
        return textResult(err.message, true);
      }
    },
  );

  server.registerTool(
    'list_measurements',
    {
      description: 'List the measurement names and units in a measurement-set JSON file.',
      inputSchema: {
        file: z.string().describe('Path to the measurement JSON file, relative to the workspace'),
      },
    },
    async ({ file }) => {
      try {
        const set = await loadMeasurementSet(resolveInWorkspace(workspace, file));
        const lines = Object.entries(set.measurements).map(([k, v]) => `${k}: ${v} ${set.units}`);
        return textResult(`${set.name}\n${lines.join('\n')}`);
      } catch (err) {
        return textResult(err.message, true);
      }
    },
  );

  server.registerTool(
    'seamly_export',
    {
      description:
        'Export a Seamly2D pattern (.sm2d) to PDF, DXF, SVG or PNG with the locally installed Seamly2D. ' +
        'Optionally re-measure it with a SeamlyMe measurement file (.vit).',
      inputSchema: {
        pattern: z.string().describe('Seamly2D pattern file (.sm2d), relative to the workspace'),
        outputDir: z.string().describe('Output folder, relative to the workspace'),
        basename: z.string().regex(/^[\w-]+$/).describe('Output file name without extension'),
        format: z.enum(['pdf', 'pdf-tiled', 'dxf', 'svg', 'png']).describe('Export format'),
        measurements: z.string().optional().describe('Optional measurement file (.vit), relative to the workspace'),
      },
    },
    async ({ pattern, outputDir, basename, format, measurements }) => {
      const found = await resolveSeamlyBinary(env);
      if (!found.ok) {
        return textResult(found.reason, true);
      }
      try {
        const result = await exportPattern({
          bin: found.path,
          patternPath: resolveInWorkspace(workspace, pattern),
          outputDir: resolveInWorkspace(workspace, outputDir),
          basename,
          format,
          measurementPath: measurements ? resolveInWorkspace(workspace, measurements) : undefined,
        });
        if (!result.ok) {
          return textResult(`Seamly2D export failed: ${result.reason}\n${result.stderr}`, true);
        }
        return textResult(`exported to ${outputDir} (basename ${basename}, format ${format})`);
      } catch (err) {
        return textResult(err.message, true);
      }
    },
  );

  return server;
}

// Run as a stdio server only when executed directly, not when imported by tests.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createServer();
  await server.connect(new StdioServerTransport());
}
