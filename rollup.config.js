import cleaner from 'rollup-plugin-cleaner';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import ignoreImport from 'rollup-plugin-ignore-import';
import { uglify } from 'rollup-plugin-uglify';
import sass from 'rollup-plugin-sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import serve from 'rollup-plugin-serve';

const pkg = require('./package.json');
const external = Object.keys(pkg.dependencies);
const ignoreImportOptions = {
  extensions: ['.scss', '.css']
};
const sassOptions = {
  output: true,
  processor: css =>
    postcss([autoprefixer, cssnano])
      .process(css, { from: undefined, map: true })
      .then(result => result.css)
};
const serveOptions = {
  open: true,
  openPage: '/example/',
  contentBase: '',
  port: 3000
};
const builds = [];

if (process.env.PRODUCTION) {
  builds.push({
    input: 'src/index.js',
    output: [
      {
        name: 'TapThrough',
        file: pkg.min,
        format: 'umd',
        sourcemap: true
      }
    ],
    plugins: [
      cleaner({
        silent: true,
        targets: ['./dist/']
      }),
      sass(sassOptions),
      resolve(),
      babel(),
      uglify()
    ],
    external: external
  });

  builds.push({
    input: 'src/index.js',
    output: [
      {
        name: 'TapThrough',
        file: pkg.main,
        format: 'umd'
      }
    ],
    plugins: [ignoreImport(ignoreImportOptions), resolve(), babel()],
    external: external
  });

  builds.push({
    input: 'src/index.js',
    output: [
      {
        name: 'TapThrough',
        file: pkg.module,
        format: 'esm'
      }
    ],
    plugins: [ignoreImport(ignoreImportOptions), resolve()],
    external: external
  });
} else {
  builds.push({
    input: 'src/index.js',
    output: [
      {
        name: 'TapThrough',
        file: pkg.main,
        format: 'umd',
        sourcemap: true
      }
    ],
    plugins: [sass(sassOptions), resolve(), babel(), serve(serveOptions)],
    external: external
  });
}

export default builds;
