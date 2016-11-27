import serialize from 'server/utils/serialize';

export default function executeCommand(req, res) {
  let command = '';

  req.on('data', (c) => { command += c; });
  req.on('end', () => {
    const r = { error: false };
    try {
      r.result = serialize(eval.apply(global, [command])); // eslint-disable-line
    } catch (e) {
      r.error = e.toString();
    }

    res.end(JSON.stringify(r));
  });
}
