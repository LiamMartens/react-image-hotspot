const path = require('path');
const typescript = require('rollup-plugin-typescript2');
const postcss = require('rollup-plugin-postcss');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

module.exports = {
  input: './src/index.ts',
  output: {
    format: 'es',
    dir: path.join(__dirname, 'lib'),
  },
  plugins: [
    peerDepsExternal(),
    commonjs(),
    nodeResolve({
      browser: true,
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    typescript(),
    babel({
      babelHelpers: 'runtime',
      exclude: '**/node_modules/**',
    }),
    postcss({
      modules: true,
      extract: true,
    })
  ],
}