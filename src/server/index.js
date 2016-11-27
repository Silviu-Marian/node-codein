/* eslint no-console: 0, no-shadow: 0 */


import path from 'path';
import express from 'express';
import compression from 'compression';

import jsonEncode from './utils/jsonEncode';
import serialize from './serialize';

const getConstructor = v => (v === null ? '[object Null]' : Object.prototype.toString.call(v));
const functionPrefix = `TYPE_FUNC_${Date.now()}`; // @TODO: explicit type parameter might help

// @TODO: support additional ES6 types (?)
// @TODO: every value transmitted should (probably) be an object { type, ctor, value, prototype }

/**
 * Clients queue
 */
let clients = [];
let queued = [];
let pendingBroadcast = 0;
const broadcastLag = 500;

/**
 * pushMessage - transmit to all connected consoles
 */

// @TODO: refactor with setInterval - send stored messages every 100ms
// @TODO: Implement lastSent, send again if interval missed execution - there might be spam
function pushMessage(t, a) {
  clearTimeout(pendingBroadcast);

  const data = { t, a };
  queued.push(data);

  const doSend = () => {
    const data = jsonEncode(queued, functionPrefix);
    clients.forEach(client => client.send(data));
    queued = [];
    clients = [];
  };

  const performCheck = () => {
    if (!clients.length) {
      pendingBroadcast = setTimeout(() => performCheck(), broadcastLag);
      return;
    }
    doSend();
  };

  pendingBroadcast = setTimeout(() => performCheck(), broadcastLag);
}

/**
 * getSuggestions - Retrieves suggestions based on client input
 */
function getSuggestions(o) {
  if (!o || !o.length) {
    return [];
  }

  let target = global;
  if (o[0]) {
    try {
      // @TODO: some validation,
      // @TODO: paths should begin at global
      target = eval(o[0]); // eslint-disable-line
    } catch (e) {
      target = {};
    }
  }

  // @TODO: better property enumeration, prefferably one that sees setters/getters, prototypes etc
  return Object.keys(target).filter(item => !o[1] || (o[1] && item.split(o[1])[0] === ''));
}

/**
 * Intercept Console API Interactions
 */
['log', 'info', 'warn', 'error'].forEach((key) => {
  console[`__${key}`] = console[key];
  console[key] = (...params) => {
    console[`__${key}`](...params);
    pushMessage(key, params);
  };
});

/**
 * Express App
 */
const app = express();
app.use(compression());

/**
 * Add Clients on Queue
 */
app.route('/listen').get((req, res) => {
  req.socket.setTimeout(0);
  clients.push(res);
});


/**
 * Suggestions for Autocomplete
 */
app.route('/getSuggestions').post((req, res) => {
  let data = '';
  req.on('data', (c) => { data += c; });
  req.on('end', () => {
    let r = '[]';
    try {
      const suggestions = getSuggestions(JSON.parse(data));
      r = jsonEncode(suggestions, functionPrefix);
    } catch (e) {
      //
    }
    res.send(r);
  });
});


/**
 * Executes console commands (via eval)
 */
// @TODO: remove this
app.route('/execute').post((req, res) => {
  let command = '';
  req.on('data', (c) => { command += c; });
  req.on('end', () => {
    const r = { error: false };

    try {
      r.functionPrefix = functionPrefix;
      r.cnt = eval.apply(global, [command]); // eslint-disable-line
      r.type = (typeof r.cnt === 'object' && r.cnt !== null) ? getConstructor(r.cnt) : typeof r.cnt;
    } catch (e) {
      r.error = e.toString();
    }

    res.end(jsonEncode(r, functionPrefix));
  });
});


/**
 * v2 Execute
 */
module.mockData = require('./serialize.mock').default;

app.route('/v2/execute').post((req, res) => { // @TODO: rename the route
  let command = '';
  req.on('data', (c) => { command += c; });
  req.on('end', () => {
    const r = { error: false };

    try {
      r.cnt = serialize(eval.apply(global, [command])); // eslint-disable-line
    } catch (e) {
      r.error = e.toString();
    }

    res.end(JSON.stringify(r));
  });
});


/**
 * Statics (UI)
 */
app.use(express.static(path.join(__dirname, '..', 'client')));


/**
 * Server
 */
const port = 55281;
const host = '127.0.0.1';
const sv = app
  .listen(port, host, () => {
    const { address, port } = sv.address();
    console.log(`Debugger server started at: http://${address}:${port}`);
  })
  .on('error', e =>
    console.warn(`Failed to start debugger server. Error: ${e}`));


/**
 * Ensure Server Frees Ports
 */
['exit', 'uncaughtException', 'SIGTERM'].forEach(event =>
  process.on(event, () => {
    try {
      if (sv) {
        console.log('Closing debug server');
        sv.close();
      }
    } catch (e) {
      //
    }
  }));


/**
 * Crash Handler
 */
// @TODO: prettyError
// @TODO: console colors
// @TODO: allow styling
process.on('uncaughtException', (e) => {
  console.error(`${e}`);
  console.log(e.stack);
});


/**
 * Expose the module, access to module.require
 */
global.nodecodein = module;
