# node-with-gjs Examples

Examples demonstrating how to use the `node-with-gjs` library to build GTK applications with Node.js, Bun, or Deno.

## Prerequisites

- Node.js 18+ (or Bun, or Deno)
- GJS (GNOME JavaScript) installed on your system
- GTK 4.0 and related libraries

## Installation

```bash
npm install
```

## Import Syntax

This project supports two import syntaxes for GObject Introspection (GI) modules:

### 1. Modern `gi://` Protocol (Recommended)

This is the standard GJS import syntax, compatible with native GJS:

```typescript
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';

const app = new Gtk.Application({ application_id: 'org.example.app' });
```

**Compatibility:**
- ✅ Node.js (via module loader hook)
- ✅ Bun (via plugin)
- ❌ Deno (not supported)

### 2. Legacy `imports.gi` Syntax

Traditional GJS-style imports for backward compatibility:

```typescript
import { imports } from '@devscholar/node-with-gjs';

imports.gi.versions.Gtk = '4.0';
const { Gtk } = imports.gi;

const app = new Gtk.Application({ application_id: 'org.example.app' });
```

**Compatibility:**
- ✅ Node.js
- ✅ Bun
- ✅ Deno

## Running Examples

Use `node start.js` followed by the example path. You can optionally specify the runtime with `--runtime=<runtime>` (default is `node`).

Available runtimes: `node`, `bun`, `deno` (deno only works with legacy `imports.gi` syntax)

### GTK Examples

```bash
# GTK4 Counter App
node start.js src/gtk/counter/counter.ts

# GTK4 Draggable Box
node start.js src/gtk/drag-box/drag-box.ts
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
# GTK4 Counter using imports.gi syntax (works with all runtimes)
node start.js src/gtk/legacy-imports-counter/counter.ts

# With Bun
node start.js src/gtk/legacy-imports-counter/counter.ts --runtime=bun

# With Deno (only legacy syntax works)
node start.js src/gtk/legacy-imports-counter/counter.ts --runtime=deno
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
| Node.js | ✅ Yes (via hook) | ✅ Yes |
| Bun | ✅ Yes (via plugin) | ✅ Yes |
| Deno | ❌ No | ✅ Yes |

## Notes

- The `gi://` protocol is the recommended approach for new projects as it matches native GJS syntax
- Deno does not support custom module protocols, so you must use the legacy `imports.gi` syntax
- All examples except `legacy-imports-counter` use the modern `gi://` protocol
