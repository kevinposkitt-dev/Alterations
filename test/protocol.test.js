// Starts the server as a real stdio process and talks to it with the MCP client.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

async function connect(env = {}) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(root, 'src', 'server.js')],
    env: { ...process.env, SEWING_WORKSPACE: path.join(root, 'fixtures'), SEAMLY_BIN: '', ...env },
  });
  const client = new Client({ name: 'protocol-test', version: '0.0.0' });
  await client.connect(transport);
  return { client, close: () => client.close() };
}

test('lists the three tools', async () => {
  const { client, close } = await connect();
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((t) => t.name).sort(), ['get_measurement', 'list_measurements', 'seamly_export']);
  } finally {
    await close();
  }
});

test('get_measurement returns a value through the protocol', async () => {
  const { client, close } = await connect();
  try {
    const result = await client.callTool({
      name: 'get_measurement',
      arguments: { file: 'measurements/sample-womens-m.json', key: 'bust' },
    });
    assert.equal(result.isError, false);
    assert.equal(result.content[0].text, 'bust = 96 cm');
  } finally {
    await close();
  }
});

test('paths cannot escape the workspace', async () => {
  const { client, close } = await connect();
  try {
    const result = await client.callTool({
      name: 'get_measurement',
      arguments: { file: '../package.json', key: 'name' },
    });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /escapes the workspace/);
  } finally {
    await close();
  }
});

test('seamly_export reports a clear error when SEAMLY_BIN is unset', async () => {
  const { client, close } = await connect();
  try {
    const result = await client.callTool({
      name: 'seamly_export',
      arguments: { pattern: 'x.val', output: 'out.pdf', format: 'pdf' },
    });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /SEAMLY_BIN is not set/);
  } finally {
    await close();
  }
});
