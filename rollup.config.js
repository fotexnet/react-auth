const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const typescript = require('@rollup/plugin-typescript');
const { dts } = require('rollup-plugin-dts');
const postcss = require('rollup-plugin-postcss');
const polyfills = require('rollup-plugin-polyfill-node');

const packageJson = require('./package.json');
const builtins = ['http', 'https', 'zlib', 'stream', 'path', 'fs', 'tty', 'os', 'util'];

/** @type {import('rollup').RollupOptions} */
module.exports = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    external: builtins,
    plugins: [
      resolve({ preferBuiltins: false }),
      commonjs(),
      polyfills({ include: builtins, sourceMap: true }),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx'],
      }),
      json(),
      postcss(),
    ],
  },
  {
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    external: [/\.css$/],
    plugins: [dts()],
  },
];
