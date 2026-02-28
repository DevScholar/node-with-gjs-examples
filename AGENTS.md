When using TypeScript in Node, you must run TS with the `--experimental-transform-types` flag; other methods like `tsx` are not allowed, and building and transpilation are not allowed, except Vite. The test framework should be Vitest, not Jest. ESM must be used instead of require.
However, since running ts directly in node modules is not available, in this case it is allowed to use the following command to run ts files instead of specifying that experimental parameter to node to transform types.
```
node --import=@nodejs-loaders/tsx path/to/your/file.ts
```
allowImportingTsExtensions should be true in tsconfig.json. (If this file exists)