import Gtk from 'gi://Gtk?version=4.0';
import Gio from 'gi://Gio';

let clickCount = 0;
let label: Gtk.Label;

console.log("--- GTK4 Counter ---");

const app = new Gtk.Application({ application_id: 'org.gtk.counter' });

app.connect('activate', () => {
    const window = new Gtk.ApplicationWindow({
        application: app,
        title: 'GTK Counter App',
        default_width: 400,
        default_height: 300,
        show_menubar: true
    });

    // Actions
    const resetAction = new Gio.SimpleAction({ name: 'reset' });
    resetAction.connect('activate', () => {
        clickCount = 0;
        label.set_label('Clicks: 0');
        console.log("Counter reset");
    });
    window.add_action(resetAction);

    const aboutAction = new Gio.SimpleAction({ name: 'about' });
    aboutAction.connect('activate', () => {
        const aboutWindow = new Gtk.Window({
            title: 'About',
            transient_for: window,
            modal: true,
            default_width: 320,
            default_height: 120
        });
        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 12,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER
        });
        box.set_margin_start(24);
        box.set_margin_end(24);
        box.set_margin_top(24);
        box.set_margin_bottom(24);
        box.append(new Gtk.Label({ label: 'Node with GJS Counter Example' }));
        const closeBtn = new Gtk.Button({ label: 'Close' });
        closeBtn.connect('clicked', () => aboutWindow.close());
        box.append(closeBtn);
        aboutWindow.set_child(box);
        aboutWindow.present();
    });
    window.add_action(aboutAction);

    // Menu bar
    const menubar = new Gio.Menu();

    const counterMenu = new Gio.Menu();
    counterMenu.append('Reset', 'win.reset');
    menubar.append_submenu('Counter', counterMenu);

    const helpMenu = new Gio.Menu();
    helpMenu.append('About', 'win.about');
    menubar.append_submenu('Help', helpMenu);

    app.set_menubar(menubar);

    // UI
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

    label = new Gtk.Label({
        label: 'Clicks: 0',
        css_classes: ['title-1']
    });

    const button = new Gtk.Button({
        label: 'Click to Add',
        css_classes: ['suggested-action']
    });

    button.connect('clicked', () => {
        clickCount++;
        const message = `Clicked ${clickCount} times`;
        label.set_label(message);
        console.log(message);
    });

    box.append(label);
    box.append(button);

    window.set_child(box);
    window.present();

    console.log("Click the button to increase the counter...");
});

app.run([]);
