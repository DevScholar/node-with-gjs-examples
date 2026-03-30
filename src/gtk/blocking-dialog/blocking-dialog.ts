import Gtk from 'gi://Gtk?version=4.0';

// GTK4 idiomatic modal input: a custom Gtk.Window (modal) wrapped in a Promise.
// Gtk.Dialog.run() was removed in GTK4; the recommended pattern is async/await.
// This function returns immediately — the caller awaits the Promise.
function inputDialog(parent: any, title: string, prompt: string): Promise<string | null> {
    return new Promise((resolve) => {
        const dialog = new Gtk.Window({
            title,
            transient_for: parent,
            modal: true,
            default_width: 320,
            resizable: false,
        });

        const root = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 12,
            margin_top: 16,
            margin_bottom: 16,
            margin_start: 16,
            margin_end: 16,
        });

        const label = new Gtk.Label({ label: prompt, halign: Gtk.Align.START });
        const entry = new Gtk.Entry();

        const buttons = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 8,
            halign: Gtk.Align.END,
        });

        const cancelBtn = new Gtk.Button({ label: 'Cancel' });
        const okBtn = new Gtk.Button({ label: 'OK', css_classes: ['suggested-action'] });

        cancelBtn.connect('clicked', () => {
            dialog.destroy();
            resolve(null);
        });

        okBtn.connect('clicked', () => {
            const text = entry.get_text();
            dialog.destroy();
            resolve(text || null);
        });

        // Close-button (×) also resolves as cancelled.
        dialog.connect('close-request', () => {
            resolve(null);
            return false;
        });

        buttons.append(cancelBtn);
        buttons.append(okBtn);
        root.append(label);
        root.append(entry);
        root.append(buttons);
        dialog.set_child(root);
        dialog.present();
    });
}

// ---

console.log("--- GTK4 Async Dialog (blocking with await) ---");

const app = new Gtk.Application({ application_id: 'org.gtk.blockingdialog' });

app.connect('activate', () => {
    const window = new Gtk.ApplicationWindow({
        application: app,
        title: 'Async Dialog Demo',
        default_width: 420,
        default_height: 200,
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

    const label = new Gtk.Label({ label: "Press the button to enter your name." });

    const button = new Gtk.Button({
        label: 'Ask Name',
        css_classes: ['suggested-action'],
    });

    // async callback: awaits the dialog without blocking the GTK event loop.
    // node-with-gjs polls GJS every 16 ms, so Promise resolution is delivered
    // automatically — no spin loop or drainCallbacks() needed.
    button.connect('clicked', async () => {
        const name = await inputDialog(window, 'Enter Name', 'Please enter your name:');
        if (name && name.trim() !== '') {
            const msg = `Hello, ${name}!`;
            label.set_label(msg);
            console.log(msg);
        } else {
            label.set_label('Dialog cancelled.');
            console.log('Dialog cancelled.');
        }
    });

    box.append(label);
    box.append(button);
    window.set_child(box);
    window.present();

    console.log("Window ready. Click 'Ask Name' to open the dialog.");
});

app.run([]);
