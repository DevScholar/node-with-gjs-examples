import Gtk from 'gi://Gtk?version=4.0';

// Demonstrates GTK4's close-request signal as an onbeforeunload equivalent.
//
// Returning true from close-request prevents the window from closing — the
// same mechanism real GJS apps use to intercept the × button.
// With node-with-gjs's hybrid IPC model, close-request is a *sync* callback:
// GJS blocks in processNestedCommands() until Node.js returns a value, so the
// boolean return value reaches GTK correctly and proxy calls (label.set_label,
// etc.) work normally inside the handler.

console.log("--- GTK4 Prevent Close Demo ---");

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

    const quitButton = new Gtk.Button({
        label: 'Quit',
        css_classes: ['destructive-action'],
    });

    let allowClose = false;

    // Clicking the dedicated Quit button sets the flag, then closes normally
    // through the window — so close-request still fires, sees allowClose=true,
    // and returns false to let GTK proceed.
    quitButton.connect('clicked', () => {
        console.log('Quit button clicked — closing window.');
        allowClose = true;
        window.close();
    });

    // close-request: return true to block the × button, false to allow close.
    // This is the GTK4 equivalent of window.onbeforeunload in the browser.
    // Because this is a sync callback, the return value reaches GTK immediately
    // and proxy calls like statusLabel.set_label() work inside the handler.
    window.connect('close-request', () => {
        if (!allowClose) {
            console.log('close-request intercepted — window close blocked.');
            statusLabel.set_label('Close blocked!\nUse the "Quit" button.');
            return true; // true = prevent close
        }
        return false; // allow close
    });

    box.append(statusLabel);
    box.append(quitButton);
    window.set_child(box);
    window.present();

    console.log("Window ready. Try clicking × — it will be blocked.");
    console.log("Click 'Quit' to actually close the window.");
});

app.run([]);
