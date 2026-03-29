# node-with-gjs Examples

Examples demonstrating how to use the `node-with-gjs` library to build GTK applications with Node.js, Bun, or Deno.

## Prerequisites

- Node.js 18+ (LTS version recommended, or Bun, or Deno)
- GJS (GNOME JavaScript) installed on your system
- GTK 4.0 and related libraries

## Installation

```bash
# Install dependencies for main library
cd node-with-gjs
npm install
npm run build

# Install dependencies for examples
cd ../node-with-gjs-examples
npm install
```

## Running Examples

Use `node start.js` followed by the example path. You can optionally specify the runtime with `--runtime=<runtime>` (default is `node`).

Available runtimes: `node`, `bun`, `deno`

### Running with Deno or Bun Directly

If you want to run `start.js` directly with Deno or Bun instead of Node.js:

```bash
deno run --allow-all start.js src/gtk/counter/counter.ts
bun start.js src/gtk/counter/counter.ts
```

Note: The `--runtime=deno` and `--runtime=bun` options above use Node.js to run `start.js`, which then spawns the specified runtime to execute the compiled JavaScript. If you want to run `start.js` itself with Deno/Bun, use the commands above instead.

### GTK Examples

```bash
# GTK4 Counter App
node start.js src/gtk/counter/counter.ts

# GTK4 Draggable Box
node start.js src/gtk/drag-box/drag-box.ts

node start.js src/gtk/blocking-dialog/blocking-dialog.ts
```

### WebKit Example

```bash
# GTK4 WebKit Counter
node start.js src/gtk-webkit/counter/counter.ts
```

### Adwaita Example

```bash
# Adwaita Counter App
node start.js src/adwaita/counter/counter.ts
```

### Console Examples

```bash
# Console await delay demo
node start.js src/console/await-delay/await-delay.ts

# Console input demo
node start.js src/console/console-input/console-input.ts
```

### Legacy Syntax Example

```bash
# GTK4 Counter using imports.gi syntax
node start.js src/gtk/legacy-imports-counter/counter.ts

# With Bun
node start.js src/gtk/legacy-imports-counter/counter.ts --runtime=bun

# With Deno
node start.js src/gtk/counter/counter.ts --runtime=deno
```

## Examples

| Example | Path | Description | Import Syntax |
|---------|------|-------------|---------------|
| GTK Counter | `src/gtk/counter/counter.ts` | Simple GTK4 counter application | `gi://` |
| GTK Drag Box | `src/gtk/drag-box/drag-box.ts` | Draggable square with Cairo graphics | `gi://` |
| Legacy Counter | `src/gtk/legacy-imports-counter/counter.ts` | GTK4 counter using legacy `imports.gi` | `imports.gi` |
| WebKit Counter | `src/gtk-webkit/counter/counter.ts` | WebKit web view with counter | `gi://` |
| Await Delay | `src/console/await-delay/await-delay.ts` | Demo of async/await in GJS | `gi://` |
| Console Input | `src/console/console-input/console-input.ts` | Console input demo | `gi://` |
| Adwaita Counter | `src/adwaita/counter/counter.ts` | Adwaita-style counter application | `gi://` |

## Runtime Compatibility

| Runtime | `gi://` Protocol | `imports.gi` Syntax |
|---------|------------------|---------------------|
| Node.js | ✅ Yes (build-time transform) | ✅ Yes |
| Bun | ✅ Yes (build-time transform) | ✅ Yes |
| Deno | ✅ Yes (build-time transform) | ✅ Yes |

## How It Works

This project uses **esbuild with a custom plugin** to transform `gi://` imports at build time:

```typescript
// Source code (TypeScript)
import Gtk from 'gi://Gtk?version=4.0';

// ↓ Transformed at build time ↓

// JavaScript (output)
import { imports } from '@devscholar/node-with-gjs';
imports.gi.versions["Gtk"] = "4.0";
var Gtk = imports.gi.Gtk;
```

This approach provides better compatibility and doesn't require runtime hooks.

## Import Syntax

### 1. Modern `gi://` Protocol (Recommended)

```typescript
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';

const app = new Gtk.Application({ application_id: 'org.example.app' });
```

### 2. Legacy `imports.gi` Syntax

```typescript
import { imports } from '@devscholar/node-with-gjs';

imports.gi.versions.Gtk = '4.0';
const { Gtk } = imports.gi;

const app = new Gtk.Application({ application_id: 'org.example.app' });
```

## Notes

- The `gi://` protocol is transformed at build time via esbuild plugin - no runtime hooks needed
- All examples except `legacy-imports-counter` use the modern `gi://` protocol
- Built files are output to the `dist/` directory
