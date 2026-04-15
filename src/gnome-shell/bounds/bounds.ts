import Gtk from 'gi://Gtk?version=4.0';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib?version=2.0';

// ---- Environment detection ----
// This example requires GNOME Shell (Mutter) as the compositor because it
// uses org.gnome.Shell.Eval over D-Bus.  Other desktops (KDE, Sway, WSL, etc.)
// do not have this D-Bus service.
function detectGnomeShell(): boolean {
    // XDG_CURRENT_DESKTOP contains the desktop name(s), e.g. "ubuntu:GNOME", "GNOME", "GNOME-Classic"
    const desktop = (GLib.getenv('XDG_CURRENT_DESKTOP') || '').toUpperCase();
    if (desktop.includes('GNOME')) return true;
    // Fallback: check DESKTOP_SESSION
    const session = (GLib.getenv('DESKTOP_SESSION') || '').toLowerCase();
    if (session === 'gnome' || session === 'ubuntu' || session === 'gnome-classic') return true;
    return false;
}

// ---- ShellEval ----
// Wraps org.gnome.Shell D-Bus Eval.
//
// unsafe_mode must be enabled manually before running this example — it is no
// longer a D-Bus property in GNOME 44+. See docs/run-on-vmware-ubuntu.md.
//
// - evalOnce(code): single operation
// - beginBatch() / eval() / endBatch(): multiple evals with a single D-Bus
//   round-trip overhead (unsafe_mode is already on, so no toggling happens)

const EVAL_BLOCKED_MSG =
    'Eval blocked: unsafe_mode is off.\n' +
    'Enable it once per session via LookingGlass (Alt+F2 → lg):\n' +
    '  global.context.unsafe_mode = true';

class ShellEval {
    private proxy: Gio.DBusProxy;

    constructor() {
        this.proxy = Gio.DBusProxy.new_for_bus_sync(
            Gio.BusType.SESSION,
            Gio.DBusProxyFlags.NONE,
            null,
            'org.gnome.Shell',
            '/org/gnome/Shell',
            'org.gnome.Shell',
            null
        ) as Gio.DBusProxy;
        // Anchor to globalThis to prevent premature GC in the GJS runtime.
        (globalThis as any).__shellEvalProxy = this.proxy;
    }

    // No-op: kept for API symmetry with the batch pattern.
    // unsafe_mode must be set manually in GNOME 44+.
    beginBatch(): void {}

    // Evaluate JS inside gnome-shell.
    eval(code: string): string {
        const res = this.proxy.call_sync(
            'Eval',
            new GLib.Variant('(s)', [code]),
            Gio.DBusCallFlags.NONE,
            -1,
            null
        )!;
        const [success, result] = res.deepUnpack() as [boolean, string];
        if (!success) throw new Error(result || EVAL_BLOCKED_MSG);
        return result;
    }

    // No-op: kept for API symmetry.
    endBatch(): void {}

    evalOnce(code: string): string {
        return this.eval(code);
    }
}

// ---- JS template executed inside gnome-shell ----
// Finds the first window whose title contains `title` and calls move_resize_frame.
function moveResizeCode(title: string, x: number, y: number, w: number, h: number): string {
    return `(function() {
        var actors = global.get_window_actors();
        for (var i = 0; i < actors.length; i++) {
            var win = actors[i].meta_window;
            var t = win.get_title();
            if (t && t.includes(${JSON.stringify(title)})) {
                win.move_resize_frame(false, ${x}, ${y}, ${w}, ${h});
                return 'ok: ' + t;
            }
        }
        return 'not found';
    })()`;
}

// ---- GTK UI ----

const shell = new ShellEval();

const app = new Gtk.Application({ application_id: 'org.nwg.bounds' });

app.connect('activate', () => {
    // ---- GNOME Shell guard ----
    if (!detectGnomeShell()) {
        const desktop = GLib.getenv('XDG_CURRENT_DESKTOP') || GLib.getenv('DESKTOP_SESSION') || 'unknown';
        const errWin = new Gtk.ApplicationWindow({
            application: app,
            title: 'GNOME Shell Required',
            default_width: 460,
            default_height: 220,
        });
        const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 12 });
        box.set_margin_top(24); box.set_margin_bottom(24);
        box.set_margin_start(24); box.set_margin_end(24);

        const title = new Gtk.Label({ label: 'This example requires GNOME Shell.' });
        title.set_css_classes(['title-3']);
        box.append(title);
        box.append(new Gtk.Label({
            label: `Detected desktop: ${desktop}\n\nThis example uses org.gnome.Shell.Eval (D-Bus) to control\nwindow bounds via the Mutter compositor. Other desktops\n(KDE, Sway, Weston/WSLg, etc.) do not provide this interface.`,
            wrap: true,
            halign: Gtk.Align.START,
        }));
        const closeBtn = new Gtk.Button({ label: 'Close', css_classes: ['destructive-action'] });
        closeBtn.connect('clicked', () => app.quit());
        box.append(closeBtn);

        errWin.set_child(box);
        errWin.present();
        return;
    }

    const win = new Gtk.ApplicationWindow({
        application: app,
        title: 'GNOME Window Bounds',
        default_width: 440,
        default_height: 300,
    });

    const vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 12 });
    vbox.set_margin_top(20);
    vbox.set_margin_bottom(20);
    vbox.set_margin_start(20);
    vbox.set_margin_end(20);

    // --- Target window title ---
    const titleRow = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 8 });
    titleRow.append(new Gtk.Label({ label: 'Target window title:' }));
    const titleEntry = new Gtk.Entry({ hexpand: true, text: 'GNOME Window Bounds' });
    titleRow.append(titleEntry);
    vbox.append(titleRow);

    // --- X Y W H inputs ---
    const grid = new Gtk.Grid({ column_spacing: 8, row_spacing: 8 });

    const makeSpin = (val: number) => {
        const s = Gtk.SpinButton.new_with_range(0, 9999, 10);
        s.set_value(val);
        return s;
    };

    const xSpin = makeSpin(100);
    const ySpin = makeSpin(100);
    const wSpin = makeSpin(800);
    const hSpin = makeSpin(600);

    grid.attach(new Gtk.Label({ label: 'X:', halign: Gtk.Align.END }), 0, 0, 1, 1);
    grid.attach(xSpin,                                                   1, 0, 1, 1);
    grid.attach(new Gtk.Label({ label: 'Y:', halign: Gtk.Align.END }), 2, 0, 1, 1);
    grid.attach(ySpin,                                                   3, 0, 1, 1);
    grid.attach(new Gtk.Label({ label: 'W:', halign: Gtk.Align.END }), 0, 1, 1, 1);
    grid.attach(wSpin,                                                   1, 1, 1, 1);
    grid.attach(new Gtk.Label({ label: 'H:', halign: Gtk.Align.END }), 2, 1, 1, 1);
    grid.attach(hSpin,                                                   3, 1, 1, 1);
    vbox.append(grid);

    // --- Buttons ---
    const btnRow = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 8 });

    const applyBtn  = new Gtk.Button({ label: 'Apply Bounds', css_classes: ['suggested-action'] });
    // Bounce moves the window through 5 positions using a single beginBatch/endBatch,
    // so unsafe_mode is only toggled once regardless of how many moves are made.
    const bounceBtn = new Gtk.Button({ label: 'Bounce (batch)' });

    btnRow.append(applyBtn);
    btnRow.append(bounceBtn);
    vbox.append(btnRow);

    // --- Status ---
    const statusLabel = new Gtk.Label({ label: 'Ready.', halign: Gtk.Align.START, wrap: true });
    vbox.append(statusLabel);

    const setStatus = (msg: string) => {
        statusLabel.set_label(msg);
        console.log(msg);
    };

    // Single operation: begin → eval → end
    applyBtn.connect('clicked', () => {
        const title = titleEntry.get_text();
        const x = xSpin.get_value_as_int();
        const y = ySpin.get_value_as_int();
        const w = wSpin.get_value_as_int();
        const h = hSpin.get_value_as_int();
        try {
            const r = shell.evalOnce(moveResizeCode(title, x, y, w, h));
            setStatus(`Apply: ${r}`);
        } catch (e: any) {
            setStatus(`Error: ${e.message}`);
        }
    });

    // Batch operation: unsafe_mode toggled once for all 5 moves
    bounceBtn.connect('clicked', () => {
        const title = titleEntry.get_text();
        const w = wSpin.get_value_as_int();
        const h = hSpin.get_value_as_int();

        const positions: [number, number][] = [
            [50, 50], [700, 50], [700, 400], [50, 400], [375, 225],
        ];
        let idx = 0;

        try {
            shell.beginBatch();
        } catch (e: any) {
            setStatus(`Error: ${e.message}`);
            return;
        }

        setStatus('Bouncing... (unsafe open)');

        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 300, () => {
            if (idx >= positions.length) {
                shell.endBatch();
                setStatus('Bounce complete. (unsafe restored)');
                return false; // GLib.SOURCE_REMOVE
            }
            const [x, y] = positions[idx++];
            try {
                shell.eval(moveResizeCode(title, x, y, w, h));
            } catch (e: any) {
                shell.endBatch();
                setStatus(`Error: ${e.message}`);
                return false;
            }
            return true; // GLib.SOURCE_CONTINUE
        });
    });

    win.set_child(vbox);
    win.present();

    console.log('--- GNOME Window Bounds ---');
    console.log('Requires unsafe_mode enabled in gnome-shell (once per session):');
    console.log('  Alt+F2 → lg → global.context.unsafe_mode = true');
});

app.run([]);
