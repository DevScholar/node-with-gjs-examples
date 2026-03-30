import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';

// GTK4 equivalent of WinForms Form.ShowDialog():
// a single window with label + entry + buttons embedded directly,
// GLib.MainLoop.run() blocks synchronously until OK / Cancel / × is clicked.
// No async/await or Promises — sequential code, just like the WinForms version.

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
        margin_top: 20,
        margin_bottom: 20,
        margin_start: 20,
        margin_end: 20,
    });

    const label = new Gtk.Label({
        label: 'Please enter your computer brand:',
        halign: Gtk.Align.START,
    });

    const entry = new Gtk.Entry();

    const buttons = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 8,
        halign: Gtk.Align.CENTER,
        margin_top: 8,
    });

    const cancelBtn = new Gtk.Button({ label: 'Cancel', hexpand: true });
    const okBtn = new Gtk.Button({
        label: 'OK',
        hexpand: true,
        css_classes: ['suggested-action'],
    });

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

    window.connect('close-request', () => {
        loop.quit();
        return false;
    });

    buttons.append(cancelBtn);
    buttons.append(okBtn);
    box.append(label);
    box.append(entry);
    box.append(buttons);
    window.set_child(box);
    window.present();

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
