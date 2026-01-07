import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['server/index.js'],

  outfile: 'dist/server.js',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',

  packages: 'external',

  external: [
    '../build/handler.js',
    './build/handler.js'
  ]
});

console.log('Server build complete!');