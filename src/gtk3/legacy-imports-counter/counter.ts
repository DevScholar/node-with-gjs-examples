// Legacy imports.gi syntax example — GTK3 version
// Demonstrates the traditional GJS-style imports syntax with GTK3.
import { imports } from '@devscholar/node-with-gjs';

imports.gi.versions.Gtk = '3.0';
const { Gtk } = imports.gi;

let clickCount = 0;

console.log("--- GTK3 Counter (Legacy Imports) ---");

const app = new Gtk.Application({ application_id: 'org.gtk.counter' });

app.connect('activate', () => {
    const window = new Gtk.ApplicationWindow({
        application: app,
        title: 'GTK Counter App (Legacy GTK3)',
        default_width: 400,
        default_height: 300
    });

    window.connect('delete-event', () => {
        app.quit();
        return false;
    });

    const box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 10,
        halign: Gtk.Align.CENTER,
        valign: Gtk.Align.CENTER
    });
    box.set_margin_start(20);
    box.set_margin_end(20);
    box.set_margin_top(20);
    box.set_margin_bottom(20);

    const label = new Gtk.Label({ label: 'Clicks: 0' });

    const button = new Gtk.Button({ label: 'Click to Add' });

    button.connect('clicked', () => {
        clickCount++;
        const message = `Clicked ${clickCount} times`;
        label.set_label(message);
        console.log(message);
    });

    box.pack_start(label, false, false, 0);
    box.pack_start(button, false, false, 0);

    window.add(box);
    window.show_all();

    console.log("Click the button to increase the counter...");
});

app.run([]);
