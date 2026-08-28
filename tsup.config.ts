import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // Declarations are generated separately via `tsc -p tsconfig.build.json`
  // (see the "build" script in package.json). tsup's bundled dts generator
  // (rollup-plugin-dts) is built against an older TypeScript and crashes
  // under current TypeScript releases -- plain `tsc` has no such issue.
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
});
