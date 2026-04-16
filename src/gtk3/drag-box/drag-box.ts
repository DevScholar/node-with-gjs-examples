import Gtk from 'gi://Gtk?version=3.0';

// GTK3 dragging uses a single DrawingArea as canvas (Gtk.Fixed has no
// GdkWindow in GTK3 and can't receive mouse events). GTK3 widgets need
// explicit event masks via add_events() — unlike GTK4 which uses controllers.
//
// GdkEvent is a C union type. GJS does not expose its union member fields
// (.x, .y, .button, etc.) as JavaScript properties. Use the accessor methods:
//   event.get_coords()    → [ok, x, y]
//   event.get_button()    → [ok, button]
//   event.get_state()     → [ok, state]
// This is the correct GJS API, not a workaround.

console.log("--- GTK3 Flicker-free Draggable Square (Cairo) ---");

const app = new Gtk.Application({ application_id: 'org.gtk.dragbox' });

app.connect('activate', () => {
    const window = new Gtk.ApplicationWindow({
        application: app,
        title: 'Drag Example (High Frequency IPC)',
        default_width: 600,
        default_height: 400
    });

    const squareSize = 80;
    let currentX = 260;
    let currentY = 160;

    const drawingArea = new Gtk.DrawingArea();
    drawingArea.set_hexpand(true);
    drawingArea.set_vexpand(true);

    // Draw background + red square
    drawingArea.connect('draw', (area: any, cr: any) => {
        const w = area.get_allocated_width();
        const h = area.get_allocated_height();
        cr.setSourceRGB(0.95, 0.95, 0.95);
        cr.rectangle(0, 0, w, h);
        cr.fill();
        cr.setSourceRGB(1.0, 0.2, 0.2);
        cr.rectangle(currentX, currentY, squareSize, squareSize);
        cr.fill();
        return false;
    });

    // GTK3 requires explicit event masks
    //   BUTTON_PRESS_MASK   = 1 << 8  = 256
    //   BUTTON_RELEASE_MASK = 1 << 9  = 512
    //   POINTER_MOTION_MASK = 1 << 2  = 4
    drawingArea.add_events(256 | 512 | 4);

    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    drawingArea.connect('button-press-event', (widget: any, event: any) => {
        const [, x, y] = event.get_coords();
        if (x >= currentX && x <= currentX + squareSize &&
            y >= currentY && y <= currentY + squareSize) {
            isDragging = true;
            dragOffsetX = x - currentX;
            dragOffsetY = y - currentY;
            console.log(`✅ Drag started at: (${x}, ${y})`);
        }
        return false;
    });

    drawingArea.connect('motion-notify-event', (widget: any, event: any) => {
        if (!isDragging) return false;
        const [, x, y] = event.get_coords();
        currentX = x - dragOffsetX;
        currentY = y - dragOffsetY;
        drawingArea.queue_draw();
        return false;
    });

    drawingArea.connect('button-release-event', (widget: any, event: any) => {
        if (!isDragging) return false;
        isDragging = false;
        console.log(`🛑 Drag ended at position: (${currentX}, ${currentY})`);
        return false;
    });

    window.add(drawingArea);
    window.show_all();

    console.log("Window loaded. Try dragging the red square smoothly!");
});

app.run([]);
