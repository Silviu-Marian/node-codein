/* eslint no-console: 0, no-shadow: 0 */

import fs from 'fs';
import path from 'path';
import qs from 'querystring';
import http from 'http';
import url from 'url';

import stringify from './utils/stringify';
import fileExists from './utils/fileExists';


const fileGetContents = (f, mode) => (fileExists(f) ? fs.readFileSync(f, mode) : '');
const getConstructor = v => (v === null ? '[object Null]' : Object.prototype.toString.call(v));

const fnprefix = `TYPE_FUNC_${Date.now()}`;

const jsencr = (o) => {
  const e = [];
  return stringify(o, (k, v) => {
    // Function
    if (typeof v === 'function') {
      return `${fnprefix}${v.toString()}`;
    }

    // Primitive value
    if (typeof v !== 'object' || v === null) {
      return v;
    }

    // Object which has already been looped over (circularity)
    const circularReferences = e.filter(item => item === v);
    if (circularReferences.length) {
      return 'Circular';
    }

    // Any other object
    e.push(v);
    return v;
  });
};


const dbg = {
  // AVOIDS RUNNING TWICE
  isStarted: false,

  // SSE CONNECTIONS
  cons: [],

  // MIMES HANDLING
  mimes: {
    html: 'text/html',
    htm: 'text/html',
    txt: 'text/plain',
    js: 'text/javascript',
    ico: 'image/vnd.microsoft.icon',
    css: 'text/css',
    eot: 'application/vnd.bw-fontobject',
    ttf: 'application/x-font-ttf',
    woff: 'font/opentype',
  },

  // SEND EVENT
  queued: [],
  pendingBroadcast: 0,
  broadcastLag: 500,
  broadcastSSE(t, a) {
    clearTimeout(dbg.pendingBroadcast);

    const data = { t, a };
    dbg.queued.push(data);

    const sendFn = () => {
      if (!dbg.cons.length) {
        dbg.pendingBroadcast = setTimeout(() => sendFn(), dbg.broadcastLag);
        return;
      }

      const data = jsencr(dbg.queued);
      dbg.queued = [];
      for (let i = 0; i < dbg.cons.length; i += 1) {
        dbg.cons[i].writeHead(200, {
          'Content-type': dbg.mimes.txt,
          'Content-length': data.length,
          'Cache-control': 'no-cache',
        });

        dbg.cons[i].write(data);
        dbg.cons[i].end(`\r\n`);
        dbg.cons[i] = null;
        dbg.cons.splice(i, 1);
        i -= 1;
      }
    };

    dbg.pendingBroadcast = setTimeout(() => sendFn(), dbg.broadcastLag);
  },

  // ERROR HANDLERS
  serve500(s, err) {
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
  },

  serve404(s) {
    try {
      const NF = 'Not found\r\n';
      s.writeHead(404, {
        'Content-type': 'text/plain',
        'Content-length': NF.length,
      });
      s.end(NF);
    } catch (e) {
      dbg.serve500(s, e);
    }
  },

  // GET LOCAL FILENAME
  getlocalfn(filePath) {
    return path.join(__dirname, '..', 'client', filePath);
  },

  // STATIC RESOURCES
  servestatic(q, s) {
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
          const fn = dbg.getlocalfn('./index.html');
          const c = fileGetContents(fn, 'utf-8');

          s.writeHead(200, {
            'Content-type': dbg.mimes.html,
            'Content-length': c.length,
          });
          s.end(c);
          break;
        }

        case 'images/favicon.ico': {
          const icon = fileGetContents(dbg.getlocalfn('./images/favicon.ico'));
          s.writeHead(200, {
            'Content-type': dbg.mimes.ico,
            'Content-length': icon.length,
          });
          s.end(icon);
          break;
        }

        case 'sse': {
          q.socket.setTimeout(0);
          dbg.cons.push(s);
          break;
        }

        default: {
          const fn = dbg.getlocalfn(`./${path}`);
          if (!fileExists(fn)) {
            dbg.serve404(s);
            return;
          }

          const c = fileGetContents(fn);
          const hdrs = { 'Content-length': c.length };
          const ext = fn.split('.').pop();

          if (typeof dbg.mimes[ext] === 'string') {
            hdrs['Content-type'] = dbg.mimes[ext];
          }

          s.writeHead(200, hdrs);
          s.end(c);
          break;
        }
      }
    } catch (e) {
      dbg.serve500(s, e);
    }
  },

  // EXECUTE COMMANDS
  execute(q, s) {
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

        s.end(jsencr(r));
      } else if (typeof post.getsug === 'string') {
        let r = '[]';
        try {
          r = jsencr(dbg.getsug(JSON.parse(post.getsug)));
        } catch (e) {
          //
        }

        s.writeHead(200, {
          'Content-type': dbg.mimes.txt,
          'Content-length': r.length,
        });

        s.end(r);
      } else {
        dbg.serve500(s, 'Command was not found');
      }
    });
  },

  // STD. REQUEST HANDLER LOGIC
  handle(q, s) {
    if (typeof q.method !== 'string' || (q.method !== 'GET' && q.method !== 'POST')) {
      return dbg.serve404(s);
    }

    return (q.method === 'GET') ? dbg.servestatic(q, s) : dbg.execute(q, s);
  },

  // GET SUGGESTIONS
  getsug(o) {
    const r = [];
    if (typeof o !== 'object' || !o.length || o.length !== 2) {
      return r;
    }

    if (typeof o[0] !== 'string' || o[0] === '') {
      /* if(typeof(module)=='object') for(var i in module){
      if(o[1]===''){ r.push(i); continue; };
      if(i.split(o[1])[0]==='') r.push(i);
      }; */

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
  },

  // WRAP CONSOLE.* API
  consolewrap() {
    const wrapConsoleFeature = (key) => {
      console[`__${key}`] = console[key];
      console[key] = (...params) => {
        console[`__${key}`](...params);
        dbg.broadcastSSE('log', params);
      };
    };

    ['log', 'info', 'warn', 'error'].forEach(item => wrapConsoleFeature(item));

    process.on('uncaughtException', e => console.error(`${e}`));
    global.nodecodein = module;
  },

  // LOCAL DEBUGGER SERVER
  start({ port = 55281, host = 'localhost', cb = () => {} } = {}) {
    if (dbg.isStarted) {
      cb(false); // @TODO: Promise API?
      return;
    }

    dbg.sv = http.createServer(dbg.handle);

    dbg.sv.listen(port, host, () => {
      const { address, port } = dbg.sv.address();
      console.log(`Debugger server started at: http://${address}:${port}`);
      cb(dbg);
    });

    dbg.sv.on('error', e =>
      console.warn(`Failed to start debugger server. Error: ${e}`));

    dbg.consolewrap();

    // free the port, on all ways of exiting the app
    ['exit', 'uncaughtException', 'SIGTERM'].forEach(event =>
      process.on(event, () => dbg.stopproc()));
  },
  stopproc() {
    console.log('Closing debug server');
    try {
      dbg.sv.close();
    } catch (e) {
      //
    }
  },
};

dbg.start();
