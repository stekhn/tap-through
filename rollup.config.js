import cleaner from 'rollup-plugin-cleaner';
import babelrc from 'babelrc-rollup';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import sass from 'rollup-plugin-sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import serve from 'rollup-plugin-serve';

const pkg = require('./package.json');
const external = Object.keys(pkg.dependencies);

let plugins = [
  cleaner({
    silent: true,
    targets: ['./dist/']
  }),
  sass({
    output: true,
    processor: css =>
      postcss([autoprefixer, cssnano])
        .process(css, { from: undefined, map: true })
        .then(result => result.css)
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
      file: pkg.main,
      format: 'iife'
    },
    plugins: plugins,
    external: external
  }
];
