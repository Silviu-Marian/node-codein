import serialize from 'server/utils/serialize';

/**
 * Clients queue
 */
// @TODO: refactor with setInterval - send stored messages every Nms - or better yet use push
// @TODO: Implement lastSent, send again if interval missed execution - there might be spam
let clients = [];
let queuedMessages = [];
let pendingBroadcast = 0;
const broadcastLag = 500;

function broadcast() {
  const message = JSON.stringify(queuedMessages);
  clients.forEach(client => client.send(message));
  queuedMessages = [];
  clients = [];
}

function performCheck() {
  if (!clients.length) {
    pendingBroadcast = setTimeout(() => performCheck(), broadcastLag);
    return;
  }
  broadcast();
}

function pushMessage(type, contents) {
  clearTimeout(pendingBroadcast);
  queuedMessages.push({ type, contents });
  pendingBroadcast = setTimeout(() => performCheck(), broadcastLag);
}


/**
 * Intercept Console API Interactions
 */
const c = global[`${'c'}onsole`];
['log', 'info', 'warn', 'error'].forEach((key) => {
  c[`__${key}`] = c[key];
  c[key] = (...params) => {
    c[`__${key}`](...params);
    params.forEach((param) => {
      pushMessage(key, serialize(param));
    });
  };
});

export default function listen(req, res) {
  req.socket.setTimeout(0);
  clients.push(res);
}
