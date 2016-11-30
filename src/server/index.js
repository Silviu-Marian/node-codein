/* eslint no-console: 0 */
import path from 'path';
import express from 'express';
import compression from 'compression';

import mockData from 'server/utils/serialize.mock';

import listenMiddleware from 'server/middlewares/listen';
import suggestionsMiddleware from 'server/middlewares/getSuggestions';
import executeCommandMiddleware from 'server/middlewares/executeCommand';

/**
 * Express App
 */
const serverPort = 55281;
const serverHost = '127.0.0.1';

const app = express()
  .use(compression())
  .use(express.static(path.join((typeof process.send === 'function' && process.cwd()) || __dirname, '.', 'client')));

app.route('/listen').get(listenMiddleware);
app.route('/getSuggestions').post(suggestionsMiddleware);
app.route('/execute').post(executeCommandMiddleware);

const sv = app
  .listen(serverPort, serverHost, () => {
    const { address, port } = sv.address();
    console.log(`Debugger server started at: http://${address}:${port}`);
  })
  .on('error', e => console.warn(`Error starting console server: ${e}`));

/**
 * Ensure Server Frees Ports
 */
['exit', 'uncaughtException', 'SIGTERM', 'SIGUSR2'].forEach(event =>
  process.on(event, () => {
    try {
      if (sv) {
        console.log('Closing console server');
        sv.close(() => ['exit', 'SIGTERM', 'SIGUSR2'].indexOf(event) !== -1 && process.exit());
      }
    } catch (e) {
      //
    }
  }));

/**
 * Crash Handler
 */
process.on('uncaughtException', (e) => {
  console.error(`${e}`);
  console.log(e.stack);
});

/**
 * Expose the module, allow access to module.require
 */
module.mockData = mockData;
global.nodecodein = module;
