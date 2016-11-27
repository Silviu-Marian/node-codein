export default function getSuggestions(req, res) {
  let data = '';
  req.on('data', (c) => { data += c; });
  req.on('end', () => {
    let r = '[]';
    try {
      const o = JSON.parse(data);
      if (o && o.length) {
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

        // @TODO: serializer here?
        const suggestions = Object.keys(target).filter(item => !o[1] || (o[1] && item.split(o[1])[0] === ''));
        r = JSON.stringify(suggestions);
      }
    } catch (e) {
      //
    }
    res.send(r);
  });
}
