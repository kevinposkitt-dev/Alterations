# Sewing pattern MCP server

MCP server that reads measurement sets and exports Seamly2D patterns. Status: early scaffold.

## Tools

- `list_measurements(file)`: names and units in a measurement JSON file.
- `get_measurement(file, key)`: one value from that file.
- `seamly_export(pattern, output, format)`: export a `.val` pattern to PDF or DXF using a local Seamly2D install.

Paths are relative to `SEWING_WORKSPACE` (default: current folder) and cannot leave it.

## Setup

```bash
npm install
npm test                       # unit + protocol tests, no Seamly needed
```

Seamly integration tests run only when Seamly2D is installed:

```bash
SEAMLY_BIN="/path/to/Seamly2D" SEAMLY_TEST_PATTERN="/path/to/test.val" npm run test:seamly
```

`SEAMLY_BIN` must point to the executable on that machine. The Seamly export arguments in
`src/seamly.js` are unverified and must be confirmed against the installed version.
