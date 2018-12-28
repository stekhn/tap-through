import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
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
    plugins: [autoprefixer(), cssnano()]
  }),
  resolve({
    jsnext: true,
    main: true,
    browser: true,
    extensions: ['.js', '.json']
  }),
  babel(
    babelrc({
      addExternalHelpersPlugin: false
    })
  ),
  process.env.NODE_ENV === 'production' && uglify()
];

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'TapThrough',
    sourcemap: true
  },
  plugins: plugins,
  external: external
};
