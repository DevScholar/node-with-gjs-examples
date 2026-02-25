// Type declarations for GJS gi:// modules
// This file tells TypeScript how to resolve gi:// imports

declare module "gi://Gtk?version=4.0" {
    import Gtk from "@girs/gtk-4.0";
    export default Gtk;
}

declare module "gi://Gtk" {
    import Gtk from "@girs/gtk-4.0";
    export default Gtk;
}

declare module "gi://Adw?version=1" {
    import Adw from "@girs/adw-1";
    export default Adw;
}

declare module "gi://Adw" {
    import Adw from "@girs/adw-1";
    export default Adw;
}

declare module "gi://Gio?version=2.0" {
    import Gio from "@girs/gio-2.0";
    export default Gio;
}

declare module "gi://Gio" {
    import Gio from "@girs/gio-2.0";
    export default Gio;
}

declare module "gi://GioUnix?version=2.0" {
    import GioUnix from "@girs/giounix-2.0";
    export default GioUnix;
}

declare module "gi://GioUnix" {
    import GioUnix from "@girs/giounix-2.0";
    export default GioUnix;
}

declare module "gi://GLib?version=2.0" {
    import GLib from "@girs/glib-2.0";
    export default GLib;
}

declare module "gi://GLib" {
    import GLib from "@girs/glib-2.0";
    export default GLib;
}

declare module "gi://GObject?version=2.0" {
    import GObject from "@girs/gobject-2.0";
    export default GObject;
}

declare module "gi://GObject" {
    import GObject from "@girs/gobject-2.0";
    export default GObject;
}
