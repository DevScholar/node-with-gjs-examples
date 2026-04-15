# Running Examples on a VMware Ubuntu VM

This guide assumes you already have a VMware Ubuntu VM set up with a shared folder from your Windows host mounted and accessible inside the VM.

> **Why a VM?** The examples run on a native GNOME desktop. WSL uses a different compositor (Weston/WSLg) and may not support all features.

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

## Step 4 — Run the Examples

All GTK examples work without GNOME Shell and can be run directly:

```bash
node start.js <example-name.ts>
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
```
