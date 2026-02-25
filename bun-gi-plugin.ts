import { plugin } from "bun";

async function loadGIModule(moduleName: string, version?: string): Promise<Record<string, any>> {
  const { init, imports } = await import('@devscholar/node-with-gjs');
  init();
  if (version) {
    imports.gi.versions[moduleName] = version;
  }
  const ns = imports.gi[moduleName as keyof typeof imports.gi];
  return ns;
}

plugin({
  name: "gi-loader",
  setup(build) {
    build.onResolve({ filter: /^gi:/ }, (args) => {
      const path = args.path.replace(/^gi:/, 'gi://');
      return {
        path,
        namespace: 'gi'
      };
    });

    build.onLoad({ filter: /.*/, namespace: 'gi' }, async (args) => {
      try {
        const url = new URL(args.path);
        const moduleName = url.hostname;
        const version = url.searchParams.get('version') || undefined;
        
        const exports = await loadGIModule(moduleName, version);
        
        return {
          exports,
          loader: 'object'
        };
      } catch (e) {
        return {
          exports: { 
            error: String(e),
            name: 'LoadError'
          },
          loader: 'object'
        };
      }
    });
  }
});

console.log('[gi-loader] Bun plugin loaded');
