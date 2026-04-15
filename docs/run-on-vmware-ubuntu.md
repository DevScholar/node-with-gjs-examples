# Running Examples on a VMware Ubuntu VM

This guide assumes you already have a VMware Ubuntu VM set up with a shared folder from your Windows host mounted and accessible inside the VM.

> **Why a VM?** The GNOME Shell bounds example controls window position and size by injecting JavaScript into the `gnome-shell` process via D-Bus. This only works on a native GNOME desktop. WSL uses a different compositor (Weston/WSLg) and has no `gnome-shell` process.

---

## Step 1 — Copy the Code to Local Storage

Running `npm install` directly on a VMware shared folder (HGFS) is slow and can fail due to symlink limitations. Copy to local storage first:

```bash
cp -r /mnt/hgfs/<your-shared-folder>/node-with-gjs ~/node-with-gjs
cp -r /mnt/hgfs/<your-shared-folder>/node-with-gjs-examples ~/node-with-gjs-examples
```

---

## Step 2 — Build node-with-gjs and Install Dependencies

`node-with-gjs-examples` references `node-with-gjs` via a `file:` path, so the parent package must be built first:

```bash
# 1. Build the library
cd ~/node-with-gjs
npm install
npm run build

# 2. Install example dependencies
cd ~/node-with-gjs-examples
npm install
```

---

## Step 3 — Install GJS and GTK4 Runtime

These are usually pre-installed on Ubuntu Desktop. Verify:

```bash
gjs --version          # should be 1.72+
dpkg -l libgtk-4-1    # confirm GTK4 is present
```

If missing:

```bash
sudo apt install -y gjs libgtk-4-dev
```

---

## Step 4 — Enable unsafe_mode in GNOME Shell (once per session)

`org.gnome.Shell.Eval` requires `unsafe_mode` to be on. In GNOME 44 and earlier this was a D-Bus property that could be set programmatically, but **it was removed in GNOME 45+**. It must now be set manually via LookingGlass.

First, enable the LookingGlass tool (only needed once, persists across reboots):

```bash
gsettings set org.gnome.shell development-tools true
```

Then, each time you start a new desktop session:

1. Press `Alt+F2` to open the Run Dialog
2. Type `lg` and press Enter — LookingGlass opens
3. In the input box at the bottom, type and press Enter:
   ```javascript
   global.context.unsafe_mode = true
   ```
4. Close LookingGlass by typing in the input box:
   ```javascript
   Main.lookingGlass.close()
   ```
   > LookingGlass has no title bar or taskbar button. `Escape` does not close it. This is the only reliable way.

Verify it works:

```bash
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell \
  --method org.gnome.Shell.Eval "1+1"
# Expected: (true, '2')
```

---

## Step 5 — Run the Bounds Example

```bash
cd ~/node-with-gjs-examples
node start.js src/gnome-shell/bounds/bounds.ts
```

Once the window appears:

| Control | Description |
|---------|-------------|
| **Target window title** | Partial title match of the window to control (e.g. `Files`, `Terminal`) |
| **X / Y** | Target position in pixels |
| **W / H** | Target size in pixels |
| **Apply Bounds** | Move and resize immediately (single operation) |
| **Bounce (batch)** | Move through 5 positions with `unsafe_mode` toggled only once |

---

## Other Examples

All other GTK examples work without GNOME Shell and can be run directly:

```bash
node start.js src/gtk/counter/counter.ts
node start.js src/gtk/drag-box/drag-box.ts
node start.js src/adwaita/counter/counter.ts
```

---

## Troubleshooting

**`npm install` fails with `EACCES` or symlink errors**

Make sure you are working in a local directory (`~/node-with-gjs-examples`), not directly on the HGFS mount.

**The example window shows "Not Supported in WSL"**

You are running inside WSL, not in the VM. Open a terminal inside the VMware Ubuntu desktop and run the command there.

**`org.gnome.Shell` D-Bus service not found**

You must be running inside a GNOME desktop session (not a bare TTY). Check:

```bash
echo $DESKTOP_SESSION   # should print ubuntu or gnome
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell \
  --method org.gnome.Shell.Eval "1+1"
# should return (true, '2')
```

**Window moves off-screen**

VMware VMs often have small default resolutions. Use modest coordinates (e.g. X=50, Y=50) or increase the VM display resolution in VMware settings.
