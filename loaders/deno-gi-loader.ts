// deno-gi-loader.ts
// Deno GI loader using Node.js module.registerHooks API
//
// This uses the standardized Customization Hooks API from Node.js
// See: https://nodejs.org/api/module.html#customization-hooks
//
// Usage:
//   deno run --unstable your-app.ts
//
// The hooks will intercept gi: protocol imports

import 'node:module';

async function loadGIModule(moduleName: string, version?: string) {
  const { init, imports } = await import('@devscholar/node-with-gjs');
  init();
  if (version) {
    imports.gi.versions[moduleName] = version;
  }
  return imports.gi[moduleName as keyof typeof imports.gi];
}

function resolveHook(specifier: string, context: { parentURL?: string }) {
  if (specifier.startsWith('gi:')) {
    return {
      shortCircuit: true,
      url: specifier,
    };
  }
  return undefined;
}

async function loadHook(url: string, context: { format?: string }) {
  if (url.startsWith('gi:')) {
    try {
      const parsedUrl = new URL(url);
      const moduleName = parsedUrl.hostname;
      const version = parsedUrl.searchParams.get('version') || undefined;
      
      const exports = await loadGIModule(moduleName, version);
      
      const source = `
        const exports = ${JSON.stringify(exports)};
        export default exports;
        ${Object.keys(exports).map(key => `export const ${key} = exports.${key};`).join('\n')}
      `;
      
      return {
        shortCircuit: true,
        format: 'module',
        source,
      };
    } catch (e) {
      throw new Error(`Failed to load GI module ${url}: ${e}`);
    }
  }
  
  return undefined;
}

const hooks = {
  resolve: resolveHook,
  load: loadHook,
};

try {
  // @ts-ignore - Deno supports this API with --unstable
  Module.registerHooks(hooks);
  console.log('[gi-loader] Module hooks registered');
} catch (e) {
  console.warn('[gi-loader] Could not register hooks:', e);
}
