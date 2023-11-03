const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const json = require('@rollup/plugin-json');
const typescript = require('@rollup/plugin-typescript');
const { dts } = require('rollup-plugin-dts');
const postcss = require('rollup-plugin-postcss');
const polyfill = require('rollup-plugin-polyfill-node');

const packageJson = require('./package.json');

/** @type {import('rollup').RollupOptions} */
module.exports = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'iife',
        sourcemap: true,
      },
    ],
    external: ['http', 'zlib', 'https', 'stream', 'path', 'fs', 'tty', 'os'],
    plugins: [
      resolve({ preferBuiltins: false }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx'],
      }),
      json(),
      postcss(),
    ],
  },
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    external: [/\.css$/],
    plugins: [dts()],
  },
];
