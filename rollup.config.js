import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import sass from 'node-sass';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';

const pkg = require('./package.json');
const external = Object.keys(pkg.dependencies);

const sassPreprocessor = (content, id) =>
  new Promise(resolve => {
    const result = sass.renderSync({ file: id });
    resolve({ code: result.css.toString() });
  });

let plugins = [
  postcss({
    extract: true,
    sourceMap: true,
    extensions: ['.scss'],
    preprocessor: sassPreprocessor, // Pre-process all imports with Sass
    plugins: [
      autoprefixer(),
      cssnano()
    ]
  }),
  resolve(),
  babel(
    babelrc({
      addExternalHelpersPlugin: false
    })
  ),
  process.env.BUILD === 'production' && uglify()
];

export default [
  {
    input: 'src/index.js',
    output: {
      name: 'TapThrough',
      file: 'dist/bundle.js',
      format: 'iife'
    },
    plugins: plugins,
    external: external
  }
];
