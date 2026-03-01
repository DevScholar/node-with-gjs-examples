// gi-plugin.js - esbuild plugin to transform gi:// imports
export function giPlugin() {
    return {
        name: 'gi-plugin',
        setup(build) {
            build.onLoad({ filter: /\.ts$/ }, async (args) => {
                const fs = await import('fs');
                let source = fs.readFileSync(args.path, 'utf8');
                
                // Transform gi:// imports
                // import X from 'gi://Namespace?version=1.0'
                // -> import { imports } from '@devscholar/node-with-gjs'; const X = imports.gi.Namespace;
                
                const giImportRegex = /import\s+(\w+)\s+from\s+['"]gi:\/\/(\w+)(\?[^'"]*)?['"]/g;
                
                let match;
                const importsSet = new Set();
                
                // First pass: find all gi:// imports
                while ((match = giImportRegex.exec(source)) !== null) {
                    importsSet.add(match[2]);
                }
                
                if (importsSet.size > 0) {
                    // Add import for imports if not present
                    if (!source.includes("import { imports }")) {
                        source = `import { imports } from '@devscholar/node-with-gjs';\n` + source;
                    }
                    
                    // Transform each gi:// import
                    source = source.replace(giImportRegex, (fullMatch, varName, namespace, query) => {
                        let version = '';
                        if (query) {
                            const params = new URLSearchParams(query.slice(1));
                            version = params.get('version') || '';
                        }
                        
                        let code = '';
                        if (version) {
                            code = `imports.gi.versions['${namespace}'] = '${version}';\n`;
                        }
                        code += `const ${varName} = imports.gi.${namespace};`;
                        return code;
                    });
                }
                
                return {
                    loader: 'ts',
                    contents: source
                };
            });
        }
    };
}
