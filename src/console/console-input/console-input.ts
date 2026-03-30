import GioUnix from 'gi://GioUnix?version=2.0';
import Gio from 'gi://Gio';

print("=== Greeting Program ===");
print("Please enter your name: ");

const stdin = new GioUnix.InputStream({ fd: 0, close_fd: false });
const dataInput = new Gio.DataInputStream({ base_stream: stdin });

const [name] = dataInput.read_line_utf8(null);

if (name && name.trim() !== "") {
    print(`Hello, ${name}! Welcome to this program!`);
} else {
    print("Hello, friend! Welcome to this program!");
}

print("Program ended.");
