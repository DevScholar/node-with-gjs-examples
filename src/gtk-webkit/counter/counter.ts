import Gtk from 'gi://Gtk?version=4.0';
import WebKit from 'gi://WebKit?version=6.0';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..', '..');
const htmlPath = path.join(projectRoot, 'src', 'gtk-webkit', 'counter', 'counter.html');
const htmlUri = 'file://' + htmlPath.replace(/\\/g, '/');

const app = new Gtk.Application({ application_id: 'org.gtk.webkitcounter' });

app.connect('activate', () => {
    const window = new Gtk.ApplicationWindow({
        application: app,
        title: 'WebKit Counter App',
        default_width: 500,
        default_height: 400
    });

    const box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 0
    });

    const toolbar = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 5
    });
    toolbar.set_margin_start(5);
    toolbar.set_margin_end(5);
    toolbar.set_margin_top(5);
    toolbar.set_margin_bottom(5);

    const backButton = new Gtk.Button({ label: '← Back' });
    const forwardButton = new Gtk.Button({ label: 'Forward →' });
    const urlEntry = new Gtk.Entry({
        placeholder_text: 'Enter URL or use default',
        text: htmlUri,
        hexpand: true
    });

    toolbar.append(backButton);
    toolbar.append(forwardButton);
    toolbar.append(urlEntry);

    const contentManager = new WebKit.UserContentManager();
    
    contentManager.connect('script-message-received', (manager, value) => {
        const message = value.to_string();
        if (message) print(`[WebView] ${message}`);
    });
    contentManager.register_script_message_handler('console', null);

    const webView = new WebKit.WebView({
        vexpand: true,
        hexpand: true,
        user_content_manager: contentManager
    });

    webView.load_uri(htmlUri);

    webView.connect('load-changed', (webview, loadEvent) => {
        if (loadEvent === WebKit.LoadEvent.FINISHED) {
            console.log('Page Loaded Successfully');
            urlEntry.set_text(webview.get_uri() || '');
        }
    });

    backButton.connect('clicked', () => {
        if (webView.can_go_back()) webView.go_back();
    });

    forwardButton.connect('clicked', () => {
        if (webView.can_go_forward()) webView.go_forward();
    });

    urlEntry.connect('activate', () => {
        let uri = urlEntry.get_text();
        if (!uri.startsWith('http://') && !uri.startsWith('https://') && !uri.startsWith('file://')) {
            uri = 'https://' + uri;
        }
        webView.load_uri(uri);
    });

    box.append(toolbar);
    box.append(webView);

    window.set_child(box);
    window.present();

    console.log("Click the button in the web view to increase the counter...");
});

app.run([]);
