import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import resolve from 'rollup-plugin-node-resolve';
import sass from 'node-sass';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';
import { uglify } from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';

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
    preprocessor: sassPreprocessor,
    plugins: [autoprefixer(), cssnano()]
  }),
  resolve(),
  babel(
    babelrc({
      addExternalHelpersPlugin: false
    })
  )
];

if (process.env.BUILD === 'production') {
  plugins.push(uglify());
} else {
  plugins.push(
    serve({
      open: true,
      openPage: '/example/',
      contentBase: '',
      port: 3000
    })
  );
}

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
