import Gtk from 'gi://Gtk?version=3.0';

// Demonstrates GTK3's delete-event signal as an onbeforeunload equivalent.
//
// Returning true from delete-event prevents the window from closing — the
// same mechanism real GJS apps use to intercept the × button.
// In GTK4 the equivalent signal is close-request.

console.log("--- GTK3 Prevent Close Demo ---");

const app = new Gtk.Application({ application_id: 'org.gtk.preventclose' });

app.connect('activate', () => {
    const window = new Gtk.ApplicationWindow({
        application: app,
        title: 'Prevent Close Demo',
        default_width: 400,
        default_height: 260,
    });

    const box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 16,
        halign: Gtk.Align.CENTER,
        valign: Gtk.Align.CENTER,
    });
    box.set_margin_start(24);
    box.set_margin_end(24);
    box.set_margin_top(24);
    box.set_margin_bottom(24);

    const statusLabel = new Gtk.Label({
        label: 'The × button is disabled.\nUse the "Quit" button to close.',
        justify: Gtk.Justification.CENTER,
    });

    const quitButton = new Gtk.Button({ label: 'Quit' });

    let allowClose = false;

    quitButton.connect('clicked', () => {
        console.log('Quit button clicked — closing window.');
        allowClose = true;
        window.close();
    });

    // GTK3: delete-event fires when the × button is clicked.
    // Return true to block the close, false to allow it.
    // (GTK4 uses close-request with the same return value semantics.)
    window.connect('delete-event', () => {
        if (!allowClose) {
            console.log('delete-event intercepted — window close blocked.');
            statusLabel.set_label('Close blocked!\nUse the "Quit" button.');
            return true; // true = prevent close
        }
        return false; // allow close
    });

    box.pack_start(statusLabel, false, false, 0);
    box.pack_start(quitButton, false, false, 0);
    window.add(box);
    window.show_all();

    console.log("Window ready. Try clicking × — it will be blocked.");
    console.log("Click 'Quit' to actually close the window.");
});

app.run([]);
