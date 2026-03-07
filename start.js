// start.js - Universal starter for Node.js, Bun, and Deno with esbuild
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { giPlugin } from './gi-plugin.js';

let __filename, __dirname;
try {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
} catch {
    __filename = process.argv[1];
    __dirname = path.dirname(__filename);
}

const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('Usage: node start.js <script.ts> --runtime=node|bun|deno');
    console.error('       bun start.js <script.ts> --runtime=node|bun|deno');
    console.error('       deno run start.js <script.ts> --runtime=node|bun|deno');
    process.exit(1);
}

let runtime = null;
let targetScript = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--runtime' && args[i + 1]) {
        runtime = args[i + 1].toLowerCase();
        i++;
    } else if (!args[i].startsWith('--')) {
        targetScript = args[i];
    }
}

if (!targetScript) {
    console.error('Error: No script specified');
    process.exit(1);
}

targetScript = path.resolve(targetScript);

if (!fs.existsSync(targetScript)) {
    console.error(`Error: File not found: ${targetScript}`);
    process.exit(1);
}

if (!runtime) {
    runtime = 'node';
}

const validRuntimes = ['node', 'bun', 'deno'];
if (!validRuntimes.includes(runtime)) {
    console.error(`Error: Invalid runtime "${runtime}". Must be one of: ${validRuntimes.join(', ')}`);
    process.exit(1);
}

async function buildAndRun() {
    console.log('Building TypeScript...');
    
    const ext = path.extname(targetScript);
    const relativePath = path.relative(path.join(__dirname, 'src'), targetScript);
    const outfile = path.join(__dirname, 'dist', relativePath.replace(/\.ts$/, '.js'));
    
    // Ensure output directory exists
    const outDir = path.dirname(outfile);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    
    await esbuild.build({
        entryPoints: [targetScript],
        bundle: true,
        outfile: outfile,
        format: 'esm',
        platform: 'node',
        target: 'node18',
        plugins: [giPlugin()],
        external: ['@devscholar/node-with-gjs'],
        sourcemap: true,
        logLevel: 'info'
    });
    
    console.log('Build complete.');
    console.log(`Starting ${runtime.charAt(0).toUpperCase() + runtime.slice(1)}-GJS execution context...`);
    
    let proc;
    
    switch (runtime) {
        case 'bun':
            proc = spawnBun(outfile);
            break;
        case 'deno':
            proc = spawnDeno(outfile);
            break;
        case 'node':
        default:
            proc = spawnNode(outfile);
            break;
    }
    
    proc.on('exit', (code) => {
        process.exit(code || 0);
    });
    
    proc.on('error', (err) => {
        console.error('Failed to start:', err.message);
        process.exit(1);
    });
}

function spawnNode(targetScript) {
    return spawn(process.execPath, [
        '--no-warnings', 
        targetScript
    ], {
        stdio: 'inherit',
        env: process.env
    });
}

function spawnBun(targetScript) {
    return spawn('bun', [
        'run',
        targetScript
    ], {
        stdio: 'inherit',
        env: process.env
    });
}

function spawnDeno(targetScript) {
    return spawn('deno', [
        'run',
        '--allow-all',
        '--unstable',
        targetScript
    ], {
        stdio: 'inherit',
        env: process.env
    });
}

buildAndRun().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
});
