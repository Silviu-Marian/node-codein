/* eslint no-console: 0, no-shadow: 0 */

import fs from 'fs';
import path from 'path';
import qs from 'querystring';
import http from 'http';
import url from 'url';

import jsonEncode from './utils/jsonEncode';
import fileExists from './utils/fileExists';

const fileGetContents = (f, mode) => (fileExists(f) ? fs.readFileSync(f, mode) : '');
const getConstructor = v => (v === null ? '[object Null]' : Object.prototype.toString.call(v));

const fnprefix = `TYPE_FUNC_${Date.now()}`;

// SSE CONNECTIONS
const cons = [];

// MIMES HANDLING
const mimes = {
  html: 'text/html',
  htm: 'text/html',
  txt: 'text/plain',
  js: 'text/javascript',
  ico: 'image/vnd.microsoft.icon',
  css: 'text/css',
  eot: 'application/vnd.bw-fontobject',
  ttf: 'application/x-font-ttf',
  woff: 'font/opentype',
};

/**
 * Clients queue
 */
let queued = [];
let pendingBroadcast = 0;
const broadcastLag = 500;

/**
 * broadcastSSE - transmit to all connected consoles
 */
function broadcastSSE(t, a) {
  clearTimeout(pendingBroadcast);

  const data = { t, a };
  queued.push(data);

  const sendFn = () => {
    if (!cons.length) {
      pendingBroadcast = setTimeout(() => sendFn(), broadcastLag);
      return;
    }

    const data = jsonEncode(queued, fnprefix);
    queued = [];
    for (let i = 0; i < cons.length; i += 1) {
      cons[i].writeHead(200, {
        'Content-type': mimes.txt,
        'Content-length': data.length,
        'Cache-control': 'no-cache',
      });

      cons[i].write(data);
      cons[i].end(`\r\n`);
      cons[i] = null;
      cons.splice(i, 1);
      i -= 1;
    }
  };

  pendingBroadcast = setTimeout(() => sendFn(), broadcastLag);
}

/**
 * serve500 - S/E
 */
function serve500(s, err) {
  try {
    console.warn(err);

    const ISE = `Internal server error\r\n${err}\r\n`;
    s.writeHead(404, {
      'Content-type': 'text/plain',
      'Content-length': ISE.length,
    });
    s.end(ISE);
  } catch (e) {
    console.warn(e);
  }
}


/**
 * serve404 - S/E
 */
function serve404(s) {
  try {
    const NF = 'Not found\r\n';
    s.writeHead(404, {
      'Content-type': 'text/plain',
      'Content-length': NF.length,
    });
    s.end(NF);
  } catch (e) {
    serve500(s, e);
  }
}


/**
 * getlocalfn - Returns path to local file (filename)
 */
function getlocalfn(filePath) {
  return path.join(__dirname, '..', 'client', filePath);
}


/**
 * servestatic - Static resources middleware
 */
function servestatic(q, s) {
  try {
    let path = url.parse(q.url).pathname;
    if (path.charAt(0) === '/') {
      path = path.substr(1);
    }
    path = path.replace(/[.]+(\/|\\)/gmi, '');

    switch (path) {
      case '':
      case ' ':
      case 'index.html':
      case 'index.htm': {
        const fn = getlocalfn('./index.html');
        const c = fileGetContents(fn, 'utf-8');

        s.writeHead(200, {
          'Content-type': mimes.html,
          'Content-length': c.length,
        });
        s.end(c);
        break;
      }

      case 'images/favicon.ico': {
        const icon = fileGetContents(getlocalfn('./images/favicon.ico'));
        s.writeHead(200, {
          'Content-type': mimes.ico,
          'Content-length': icon.length,
        });
        s.end(icon);
        break;
      }

      case 'sse': {
        q.socket.setTimeout(0);
        cons.push(s);
        break;
      }

      default: {
        const fn = getlocalfn(`./${path}`);
        if (!fileExists(fn)) {
          serve404(s);
          return;
        }

        const c = fileGetContents(fn);
        const hdrs = { 'Content-length': c.length };
        const ext = fn.split('.').pop();

        if (typeof mimes[ext] === 'string') {
          hdrs['Content-type'] = mimes[ext];
        }

        s.writeHead(200, hdrs);
        s.end(c);
        break;
      }
    }
  } catch (e) {
    serve500(s, e);
  }
}


/**
 * getsug - Retrieves suggestions based on client input
 */
function getsug(o) {
  const r = [];
  if (typeof o !== 'object' || !o.length || o.length !== 2) {
    return r;
  }

  if (typeof o[0] !== 'string' || o[0] === '') {
    // @TODO: weird logic, easy to refactor
    Object.keys(global).forEach((i) => {
      if (o[1] === '') {
        r.push(i);
      } else if (i.split(o[1])[0] === '') {
        r.push(i);
      }
    });
  } else {
    try {
      const tgt = eval(o[0]); // eslint-disable-line
      if (typeof tgt !== 'object') {
        return r;
      }

      // @TODO: weird logic, easy to refactor
      Object.keys(tgt).forEach((i) => {
        if (o[1] === '') {
          r.push(i);
        } else if (i.split(o[1])[0] === '') {
          r.push(i);
        }
      });
    } catch (e) { return r; }
  }
  return r;
}


/**
 * execute - Executes commands received from the client
 */
function execute(q, s) {
  let post = '';
  q.on('data', (c) => { post += c; });
  q.on('end', () => {
    post = qs.parse(post);
    if (typeof post.command === 'string') {
      const r = { error: false };

      try {
        r.fnprefix = fnprefix;
        r.cnt = eval.apply(global, [post.command]); // eslint-disable-line
        r.type = (typeof r.cnt === 'object' && r.cnt !== null) ? getConstructor(r.cnt) : typeof r.cnt;
      } catch (e) {
        r.error = e.toString();
      }

      s.end(jsonEncode(r, fnprefix));
    } else if (typeof post.getsug === 'string') {
      let r = '[]';
      try {
        r = jsonEncode(getsug(JSON.parse(post.getsug)), fnprefix);
      } catch (e) {
        //
      }

      s.writeHead(200, {
        'Content-type': mimes.txt,
        'Content-length': r.length,
      });

      s.end(r);
    } else {
      serve500(s, 'Command was not found');
    }
  });
}

// STD. REQUEST HANDLER LOGIC
function handle(q, s) {
  if (typeof q.method !== 'string' || (q.method !== 'GET' && q.method !== 'POST')) {
    return serve404(s);
  }

  return (q.method === 'GET') ? servestatic(q, s) : execute(q, s);
}

// GET SUGGESTIONS

// WRAP CONSOLE.* API
function consolewrap() {
  const wrapConsoleFeature = (key) => {
    console[`__${key}`] = console[key];
    console[key] = (...params) => {
      console[`__${key}`](...params);
      broadcastSSE('log', params);
    };
  };

  ['log', 'info', 'warn', 'error'].forEach(item => wrapConsoleFeature(item));

  process.on('uncaughtException', e => console.error(`${e}`));
  global.nodecodein = module;
}


/**
 * Server Instance
 */
let sv = false;


/**
 * stopproc - Stops the server
 */
function stopproc() {
  console.log('Closing debug server');
  try {
    sv.close();
  } catch (e) {
    //
  }
}


/**
 * start - Starts the processing server
 */
function start({ port = 55281, host = 'localhost', cb = () => {} } = {}) {
  if (sv) {
    cb(false); // @TODO: Promise API?
    return;
  }

  sv = http.createServer(handle);

  sv.listen(port, host, () => {
    const { address, port } = sv.address();
    console.log(`Debugger server started at: http://${address}:${port}`);
    cb();
  });

  sv.on('error', e =>
    console.warn(`Failed to start debugger server. Error: ${e}`));

  consolewrap();

  // free the port, on all ways of exiting the app
  ['exit', 'uncaughtException', 'SIGTERM'].forEach(event =>
    process.on(event, () => stopproc()));
}

start();
