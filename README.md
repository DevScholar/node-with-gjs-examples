# node-with-gjs Examples

Examples showing how to use [node-with-gjs](https://github.com/devscholar/node-with-gjs) to build Linux desktop applications with Node.js, Bun, or Deno.

## System prerequisites

Tested on **Ubuntu 24.04 LTS**. node-with-gjs itself only requires **GJS**. Install GJS plus whichever toolkits the examples you want to run actually use.

```bash
# GJS (required for all examples)
sudo apt install gjs

# GTK3 examples
sudo apt install libgtk-3-0 gir1.2-gtk-3.0

# GTK4 examples
sudo apt install libgtk-4-1 gir1.2-gtk-4.0

# WebKit examples
sudo apt install libwebkitgtk-6.0-0 gir1.2-webkit2-4.1

# Adwaita examples
sudo apt install libadwaita-1-0 gir1.2-adw-1
```

> **Note:** You do **not** need `-dev` packages (e.g. `libgtk-4-dev`). Those contain C/C++ header files for compiling C programs. GJS loads libraries at runtime via GObject Introspection; no headers are needed.

GNOME-based Ubuntu installs typically pre-install GJS, GTK4, and Adwaita. On a minimal install you may need to add them manually.

For other distributions, consult your package manager for the equivalent packages.

## Node.js setup

```bash
# Install dependencies for the library
cd node-with-gjs
npm install
npm run build

# Install dependencies for examples
cd ../node-with-gjs-examples
npm install
```

Node.js 18+ required. Bun and Deno are also supported (see below).

## Running examples

```bash
node start.js <path/to/example.ts>
```

Optionally specify a runtime with `--runtime=node|bun|deno` (default: `node`).

---

### GTK3 examples

Requires `libgtk-3-0` and `gir1.2-gtk-3.0`.

```bash
# Counter app
node start.js src/gtk3/counter/counter.ts

# Draggable box (Cairo drawing)
node start.js src/gtk3/drag-box/drag-box.ts

# Blocking dialog (GLib.MainLoop blocks until user responds)
node start.js src/gtk3/blocking-dialog/blocking-dialog.ts

# Prevent close (intercept × button via delete-event)
node start.js src/gtk3/prevent-close/prevent-close.ts

# Counter using legacy imports.gi syntax
node start.js src/gtk3/legacy-imports-counter/counter.ts
```

### GTK4 examples

Requires `libgtk-4-1` and `gir1.2-gtk-4.0`.

```bash
# Counter app (with menu bar)
node start.js src/gtk4/counter/counter.ts

# Draggable box (Cairo drawing)
node start.js src/gtk4/drag-box/drag-box.ts

# Blocking dialog (GLib.MainLoop blocks until user responds)
node start.js src/gtk4/blocking-dialog/blocking-dialog.ts

# Prevent close (intercept × button via close-request)
node start.js src/gtk4/prevent-close/prevent-close.ts

# Counter using legacy imports.gi syntax
node start.js src/gtk4/legacy-imports-counter/counter.ts
```

### WebKit example

Requires `libwebkitgtk-6.0-0` and `gir1.2-webkit2-4.1`.

```bash
node start.js src/gtk-webkit/counter/counter.ts
```

### Adwaita example

Requires `libadwaita-1-0` and `gir1.2-adw-1`.

```bash
node start.js src/adwaita/counter/counter.ts
```

### Console examples

No UI toolkit required — just GJS.

```bash
node start.js src/console/await-delay/await-delay.ts
node start.js src/console/console-input/console-input.ts
```

### GNOME Shell examples

Requires a **native GNOME Shell** environment (real Linux or VMware VM). Does not work in WSL.
Requires `unsafe_mode` enabled once per session via LookingGlass (`Alt+F2 → lg`).
See [docs/run-on-vmware-ubuntu.md](docs/run-on-vmware-ubuntu.md) for setup instructions.

```bash
node start.js src/gnome-shell/bounds/bounds.ts
```

---

## Running with Bun or Deno

`--runtime` controls which runtime executes the compiled output:

```bash
bun start.js src/gtk4/counter/counter.ts --runtime=bun
deno run --allow-all start.js src/gtk4/counter/counter.ts --runtime=deno
```

---

## Example index

| Example | Path | Toolkit | Description |
|---------|------|---------|-------------|
| GTK3 Counter | `src/gtk3/counter/` | GTK3 | Counter app with menu bar |
| GTK3 Drag Box | `src/gtk3/drag-box/` | GTK3 | Draggable square with Cairo; `draw` signal |
| GTK3 Blocking Dialog | `src/gtk3/blocking-dialog/` | GTK3 | Blocks with `GLib.MainLoop`; `delete-event` |
| GTK3 Prevent Close | `src/gtk3/prevent-close/` | GTK3 | Intercept × via `delete-event` |
| GTK3 Legacy Counter | `src/gtk3/legacy-imports-counter/` | GTK3 | `imports.gi` syntax |
| GTK4 Counter | `src/gtk4/counter/` | GTK4 | Counter app with menu bar |
| GTK4 Drag Box | `src/gtk4/drag-box/` | GTK4 | Draggable square; `set_draw_func` + `GestureDrag` |
| GTK4 Blocking Dialog | `src/gtk4/blocking-dialog/` | GTK4 | Blocks with `GLib.MainLoop`; `close-request` |
| GTK4 Prevent Close | `src/gtk4/prevent-close/` | GTK4 | Intercept × via `close-request` |
| GTK4 Legacy Counter | `src/gtk4/legacy-imports-counter/` | GTK4 | `imports.gi` syntax |
| WebKit Counter | `src/gtk-webkit/counter/` | GTK4 + WebKit | WebKit web view embedded in GTK4 |
| Adwaita Counter | `src/adwaita/counter/` | Adwaita | `Adw.Application` + `Adw.HeaderBar` |
| Await Delay | `src/console/await-delay/` | — | `async/await` with `GLib` in GJS |
| Console Input | `src/console/console-input/` | — | Synchronous console input |
| GNOME Shell Bounds | `src/gnome-shell/bounds/` | GNOME Shell | Window position/size via D-Bus |

---

## GTK3 vs GTK4 API differences

The GTK3 and GTK4 examples cover the same features so you can compare them side by side. Key differences:

| | GTK3 | GTK4 |
|---|---|---|
| Add child to window | `window.add(widget)` | `window.set_child(widget)` |
| Add child to box | `box.pack_start(w, expand, fill, pad)` | `box.append(widget)` |
| Show window | `window.show_all()` | `window.present()` |
| Intercept × button | `window.connect('delete-event', ...)` → return `true` to block | `window.connect('close-request', ...)` → return `true` to block |
| Drawing area | `drawingArea.connect('draw', (widget, cr) => ...)` | `drawingArea.set_draw_func((area, cr, w, h) => ...)` |
| Gesture attachment | `new Gtk.GestureDrag({ widget: someWidget })` | `new Gtk.GestureDrag()` + `widget.add_controller(gesture)` |
| Event masks | Must call `widget.add_events(mask)` explicitly | Not needed; use event controllers |
| Event coordinates | `event.get_coords()` → `[ok, x, y]` (GdkEvent is a C union; `.x`/`.y` are not JS properties) | `startX`/`startY` passed directly as callback args to `GestureDrag` signals |

---

## How it works

`start.js` uses esbuild with a custom plugin to transform `gi://` imports at build time:

```typescript
// Source
import Gtk from 'gi://Gtk?version=4.0';

// ↓ transformed to ↓

import { imports } from '@devscholar/node-with-gjs';
imports.gi.versions['Gtk'] = '4.0';
const Gtk = imports.gi.Gtk;
```

This lets the same source file work under Node.js, Bun, and Deno without runtime hooks.

## Import syntax

### Modern `gi://` (recommended)

```typescript
import Gtk from 'gi://Gtk?version=4.0';
import Gtk3 from 'gi://Gtk?version=3.0';
import Adw from 'gi://Adw?version=1';
```

### Legacy `imports.gi`

```typescript
import { imports } from '@devscholar/node-with-gjs';

imports.gi.versions.Gtk = '4.0';
const { Gtk } = imports.gi;
```
