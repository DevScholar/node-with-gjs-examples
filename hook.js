// hook.js - Node.js module loader hook for gi:// protocol and TypeScript
import * as esbuild from 'esbuild';

export async function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('gi://')) {
        return {
            url: specifier,
            shortCircuit: true,
            format: 'module'
        };
    }
    
    if (specifier.endsWith('.ts') || specifier.endsWith('.tsx')) {
        return nextResolve(specifier, context);
    }
    
    return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
    if (url.startsWith('gi://')) {
        const bareUrl = url.replace('gi://', '');
        const [namespacePart, queryPart] = bareUrl.split('?');
        
        const namespace = namespacePart;
        let version = '';
        
        if (queryPart) {
            const params = new URLSearchParams(queryPart);
            version = params.get('version') || '';
        }

        const coreUrl = new URL('./node_modules/@devscholar/node-with-gjs/src/index.ts', import.meta.url).href;
        
        const source = `
            import { init, imports } from '${coreUrl}';
            init();
            imports.gi.versions['${namespace}'] = '${version}';
            const ns = imports.gi['${namespace}'];
            export default ns;
        `;
        
        return {
            format: 'module',
            shortCircuit: true,
            source: source
        };
    }
    
    if (url.endsWith('.ts') || url.endsWith('.tsx')) {
        const result = await nextLoad(url, context);
        if (result.source) {
            const transformed = await esbuild.transform(result.source, {
                format: 'esm',
                platform: 'node',
                target: 'node22',
                loader: url.endsWith('.tsx') ? 'tsx' : 'ts'
            });
            return {
                format: 'module',
                source: transformed.code
            };
        }
    }
    
    return nextLoad(url, context);
}
