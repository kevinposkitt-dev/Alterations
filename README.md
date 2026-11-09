# AI Sewing Pattern Generation

Setup for driving 2D and parametric pattern tools (Inkscape, FreeCAD) from Claude Code via MCP.

> Note: the `uv` install line was corrected to `https://astral.sh/uv/install.sh` (the original was truncated).

---

## 1. System Requirements & Global CLI Tools

Ensure you have the core Python and Node package managers globally available on your machine.

* **Node.js & npm** (to run Claude Code)
* **Python 3.10+**
* **Astral `uv`** (highly recommended for fast, zero-config MCP server execution)

  ```bash
  # Install uv if you don't have it
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

---

## 2. Choosing Your CAD/Vector Backend

### Option A: Inkscape (recommended for 2D pattern drafting)

Best for drawing flat 2D lines, shifting notches, smoothing armscyes, and working with standard `.svg` patterns.

1. **Install Inkscape:** Download and install [Inkscape](https://inkscape.org). Ensure the `inkscape` executable is on your system PATH.
2. **Verify CLI access:**

   ```bash
   inkscape --version
   ```

### Option B: FreeCAD (recommended for parametric and math grading)

Best if you want Claude to compute patterns dynamically using measurement variables (e.g., `Waist_Circumference / 4 + 2cm`).

1. **Install FreeCAD:** Download and install [FreeCAD 1.0+](https://freecad.org).
2. **Enable RPC Server:** Install the `freecad-mcp` macro/addon from FreeCAD's Addon Manager to allow the external port handshake.

---

## 3. Configuring Claude Code

Claude Code reads its persistent MCP configuration from a global file. Inject the server blocks into it.

### Step 1: Locate your configuration file

* **macOS / Linux:** `~/.config/claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

*(Note: this path comes from the original guide and has not been verified against current Claude Code. If the servers don't appear, check `claude mcp --help` and add them with `claude mcp add` instead.)*

### Step 2: Edit the configuration

Paste the following inside. It uses `uvx` to fetch and run the MCP servers without a local clone.

```json
{
  "mcpServers": {
    "inkscape-pattern-agent": {
      "command": "uvx",
      "args": ["inkscape-mcp"]
    },
    "freecad-pattern-agent": {
      "command": "uvx",
      "args": ["freecad-mcp"]
    }
  }
}
```

*(The package names `inkscape-mcp` and `freecad-mcp` come from the original guide and are unverified. Confirm they exist on PyPI before relying on them.)*

---

## 4. Initializing your Project Workspace

Create a dedicated local folder where your pattern assets, base slopers, and Claude's target scripts will live.

```bash
mkdir ~/ai-sewing-patterns && cd ~/ai-sewing-patterns
claude
```

When Claude Code starts, it reads the directory and initializes the MCP connections listed in your global config.

---

## 5. Testing the Architecture

Once the `claude>` prompt is active, run a sanity check that the LLM can control your design software.

### Test prompt for Inkscape

> "Create a blank 24x36 inch canvas. Draw a basic 2D rectangle in the center measuring 12 inches by 18 inches to represent a test fabric block, and save it as base_block.svg"

### Test prompt for FreeCAD

> "Open FreeCAD, initialize a new document, create a sketch named 'Sloper_Variables', and add two geometric constraints mapping out a basic front waist dart."

---

## 6. Next Steps for Pattern Engineering

To keep Claude from generating bad paths, give your workspace a **system prompt / ruleset** file describing standard garment design rules:

* Internal seam lines must match (e.g., front shoulder seam length equals back shoulder seam length).
* Keep your baseline measurement chart in a local `.json` file so Claude can reference lengths, widths, and grading increments directly.
