const { join } = require('path');
const { readFileSync } = require('fs');
const { expect } = require('chai');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const rimraf = require('rimraf');
const HtmlWebpackInjectQsPlugin = require('../index');


const OUTPUT_DIR = join(__dirname, './test_dist');
const webpackPackageVersion = process.env.npm_package_devDependencies_webpack.replace(/[^0-9.]/g, '')
const webpackVersion = webpack.version ?? webpackPackageVersion

let cssRule;
let cssPlugin;
let cssPluginOpts;

if (/^\s*[3]/.test(webpackVersion)) {
  // use extractTextWebpackPlugin
  const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
  cssRule = ExtractTextWebpackPlugin.extract({
      fallback: 'style-loader',
      use: 'css-loader'
  });
  cssPlugin = ExtractTextWebpackPlugin;
  cssPluginOpts = '[name].css'
} else {
  const MiniCssExtractPlugin = require('mini-css-extract-plugin');
  cssRule = [
      {
          loader: MiniCssExtractPlugin.loader
      },
      {
          loader: 'css-loader'
      }
  ];
  cssPlugin = MiniCssExtractPlugin;
  cssPluginOpts = {
      filename: '[name].css'
  };
}

const webpackOptions = {
  entry: {
    app: join(__dirname, './test_data/entry.js'),
    styles: join(__dirname, './test_data/entry.css')
  },
  output: {
    path: OUTPUT_DIR
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: cssRule
      }
    ]
  }
};

const HtmlWebpackPluginOptions = {
  filename: 'index.html',
  hash: false,
  inject: true,
  minify: {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    useShortDoctype: true
  },
  showErrors: true,
  template: join(__dirname, './test_data/index.html')
};

function testAutoAssign(err) {
  if (err) {
    console.error(err)
  }
  expect(!!err).to.be.false;
  const htmlFile = join(OUTPUT_DIR, './index.html');
  const htmlContents = readFileSync(htmlFile).toString('utf8');
  expect(!!htmlContents, 'Missing HTML contents').to.be.true;
  expect(/href="styles\.css\?v=1\.0\.0&test=abc"/i.test(htmlContents), 'No params appended to styles').to.be.true;
  expect(/src="app\.js\?v=1\.0\.0&test=abc"/i.test(htmlContents), 'No params appended to scripts').to.be.true;
}

function testEntryfileAssign(err) {
  if (err) {
    console.error(err)
  }
  expect(!!err).to.be.false;
  const entryFile = join(OUTPUT_DIR, './app.js');
  const entryContents = readFileSync(entryFile).toString('utf8');
  expect(!!entryContents, 'Missing entryfile contents').to.be.true;
  expect(/"\.js\?v=1\.0\.1&test=def"/i.test(entryContents), 'No params appended to scripts').to.be.true;
  expect(/"\.css\?v=1\.0\.1&test=def"/i.test(entryContents), 'No params appended to styles').to.be.true;
}

describe('HtmlWebpackInjectQsPlugin', () => {
  afterEach((done) => {
    rimraf(OUTPUT_DIR, done);
  });
    
  it('should auto append params to css and js', (done) => {
    webpack({ ...webpackOptions,
      plugins: [
        new HtmlWebpackPlugin(HtmlWebpackPluginOptions),
        new HtmlWebpackInjectQsPlugin({
          v: '1.0.0',
          test: 'abc'
        }),
        new cssPlugin(cssPluginOpts),
      ]
    }, (err) => {
      testAutoAssign(err);
      done(err);
    });
  });

  it('should auto append params to lazy chunk', (done) => {
    webpack({ ...webpackOptions,
      plugins: [
        new HtmlWebpackPlugin(HtmlWebpackPluginOptions),
        new HtmlWebpackInjectQsPlugin({
          v: '1.0.1',
          test: 'def'
        }),
        new cssPlugin(cssPluginOpts),
      ]
    }, (err) => {
      testEntryfileAssign(err);
      done(err);
    });
  });
});