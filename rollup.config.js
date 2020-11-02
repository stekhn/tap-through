import cleaner from 'rollup-plugin-cleaner';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import ignoreImport from 'rollup-plugin-ignore-import';
import { terser } from 'rollup-plugin-terser';
import scss from 'rollup-plugin-scss';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import serve from 'rollup-plugin-serve';

const pkg = require('./package.json');
const external = Object.keys(pkg.dependencies);
const ignoreImportOptions = {
  extensions: ['.scss', '.css']
};
const scssOptions = {
  output: true,
  processor: () => postcss([autoprefixer, cssnano])
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
      scss(scssOptions),
      resolve(),
      babel(),
      terser()
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
    plugins: [scss(scssOptions), resolve(), babel(), serve(serveOptions)],
    external: external
  });
}

export default builds;
