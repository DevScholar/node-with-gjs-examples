import Gtk from 'gi://Gtk?version=3.0';
import GLib from 'gi://GLib';

// GTK3 equivalent of WinForms Form.ShowDialog():
// GLib.MainLoop.run() blocks synchronously until OK / Cancel / × is clicked.
// GTK3 uses delete-event (instead of GTK4's close-request) to intercept the × button.

console.log("--- Blocking Dialog Example ---");
console.log("Showing dialog to get user input...\n");

const app = new Gtk.Application({ application_id: 'org.gtk.blockingdialog' });

app.connect('activate', () => {
    const loop = new GLib.MainLoop(null, false);
    let ok = false;
    let text = '';

    const window = new Gtk.ApplicationWindow({
        application: app,
        title: 'Computer Brand Input',
        default_width: 400,
        resizable: false,
    });

    const box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 12,
    });
    box.set_margin_start(20);
    box.set_margin_end(20);
    box.set_margin_top(20);
    box.set_margin_bottom(20);

    const label = new Gtk.Label({
        label: 'Please enter your computer brand:',
        halign: Gtk.Align.START,
    });

    const entry = new Gtk.Entry();

    const buttons = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 8,
        halign: Gtk.Align.CENTER,
    });
    buttons.set_margin_top(8);

    const cancelBtn = new Gtk.Button({ label: 'Cancel', hexpand: true });
    const okBtn = new Gtk.Button({ label: 'OK', hexpand: true });

    cancelBtn.connect('clicked', () => {
        window.destroy();
        loop.quit();
    });

    okBtn.connect('clicked', () => {
        ok = true;
        text = entry.get_text();
        window.destroy();
        loop.quit();
    });

    // GTK3: delete-event fires when × is clicked
    window.connect('delete-event', () => {
        loop.quit();
        return false;
    });

    buttons.pack_start(cancelBtn, true, true, 0);
    buttons.pack_start(okBtn, true, true, 0);
    box.pack_start(label, false, false, 0);
    box.pack_start(entry, false, false, 0);
    box.pack_start(buttons, false, false, 0);
    window.add(box);
    window.show_all();

    loop.run(); // blocks here — GTK remains responsive

    // Result is available immediately after loop.run() returns.
    if (ok) {
        const brand = text.trim();
        if (brand !== '') {
            console.log(`You are using a ${brand} computer.`);
        } else {
            console.log("You didn't enter a computer brand.");
        }
    } else {
        console.log('Dialog was cancelled.');
    }

    console.log('\nProgram ended.');
    app.quit();
});

app.run([]);
