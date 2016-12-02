/* eslint import/no-extraneous-dependencies: 0 */
import fs from 'fs';
import path from 'path';
import cp from 'child_process';

import express from 'express';
import rimraf from 'rimraf';
import mkpath from 'mkpath';
import webpack from 'webpack';
import webpackHotMiddleware from 'webpack-hot-middleware';

import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import HTMLWebpackPlugin from 'html-webpack-plugin';

const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const CLIENT = path.join(DIST, 'client');
const CACHE = path.join(ROOT, '.cache');

rimraf.sync(path.join(DIST, '*'));
mkpath(CLIENT);
mkpath(CACHE);

const appConfig = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json')));

const babelConfig = JSON.stringify({
  ...JSON.parse(fs.readFileSync(path.join(ROOT, '.babelrc'), 'utf-8')),
  cacheDirectory: CACHE,
});

const commonConfig = {
  module: {
    loaders: [
      { test: /\.(js|jsx)$/i, exclude: /node_modules/i, loader: `babel-loader?${babelConfig}` },
      { test: /\.json$/i, loader: 'json-loader' },
      { test: /\.css$/i, loaders: ['style-loader', 'css-loader?importLoaders=1', 'postcss-loader'] },
      { test: /\.scss$/i, loader: ['style-loader', 'css-loader?importLoaders=2', 'postcss-loader', 'sass-loader'] },
      { test: /\.(jpeg|jpg|jpe|svg|gif|png)$/i, loader: 'url-loader?limit=102400' },
      { test: /\.(woff|woff2|eot|ttf|svg|svgz)$/i, loader: 'url-loader?limit=102400' },
    ],
  },
  resolve: {
    modules: ['node_modules', SRC],
    extensions: ['.json', '.js', '.jsx'],
  },
  plugins: [
    new ProgressBarPlugin(),
  ],
};


/**
 * Client
 */
const hmrHost = '127.0.0.1';
const hmrPort = 3001;
const clientCompiler = webpack({
  ...commonConfig,
  target: 'web',
  context: path.join(SRC, 'client'),
  entry: {
    client: [
      'promise-polyfill',
      'whatwg-fetch',
      `webpack-hot-middleware/client?path=http://${hmrHost}:${hmrPort}/__webpack_hmr`,
      path.join(SRC, 'client', 'index.jsx'),
    ],
  },
  output: {
    path: CLIENT,
    filename: '[name].js',
  },
  plugins: [
    ...commonConfig.plugins,
    new HTMLWebpackPlugin({
      defaultTitle: appConfig.name,
      template: path.join(SRC, 'client', 'index.html'),
      filename: path.join(CLIENT, 'index.html'),
      favicon: path.join(SRC, 'client', 'favicon.ico'),
      inject: false,
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
});

clientCompiler.watch({ }, () => {});

// HMR
express()
  .use(webpackHotMiddleware(clientCompiler))
  .listen(hmrPort, hmrHost, () => {})
  .on('error', (e) => { throw e; });


/**
 * Server
 */
let serverInstance;
const serverCompiler = webpack({
  ...commonConfig,
  target: 'node',
  context: path.join(SRC, 'server'),
  entry: {
    server: path.join(SRC, 'server', 'index.js'),
  },
  output: {
    path: DIST,
    filename: '[name].js',
  },
});

serverCompiler.plugin('after-emit', (compilation, callback) => {
  function restart() {
    serverInstance = cp.fork(path.join(DIST, 'server.js'), { cwd: DIST });
    serverInstance.on('close', () => { serverInstance = undefined; });
    callback();
  }
  if (serverInstance) {
    serverInstance.on('close', restart);
    serverInstance.kill();
  } else {
    restart();
  }
});

serverCompiler.watch({ }, () => { });
