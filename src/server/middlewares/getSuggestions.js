export default function getSuggestions(req, res) {
  let input = '';
  req.on('data', (c) => { input += c; });
  req.on('end', () => {
    const noSuggestions = '[]';

    if (!input) {
      res.send(noSuggestions);
      return;
    }

    // Check to see if it's inside a string or regular expression
    const shouldContinue = [/"/g, /'/g, /\//g]
      .map(regex => input.match(regex))
      .reduce((bottomLine, matches) =>
        (bottomLine && (!matches || (matches && matches.length % 2 === 1))) || false, true);

    if (!shouldContinue) {
      res.send(noSuggestions);
      return;
    }

    // get the rightmost part
    const significantInput = input.split(/[^A-Za-z0-9_$.]/gi).pop();
    if (!significantInput) {
      res.send(noSuggestions);
      return;
    }

    // we now know what we're working on, so let's see what we're working with
    const stringParts = significantInput.split('.');
    if (!stringParts.length) {
      res.send(noSuggestions);
      return;
    }

    const suggestionsStartWith = stringParts.pop();
    const targetObjectAsString = (stringParts.length && stringParts.join('.')) || 'global';
    let targetObject = global;
    try {
      targetObject = eval(targetObjectAsString); // eslint-disable-line
    } catch (e) {
      res.send(noSuggestions);
      return;
    }

    const suggestions = Object.keys(targetObject)
      .filter(item => !suggestionsStartWith || (suggestionsStartWith && item.split(suggestionsStartWith)[0] === ''))
      .filter(item => item !== suggestionsStartWith);
    res.send(JSON.stringify({
      input,
      significantInput,
      suggestions,
      suggestionsStartWith,
      targetObjectAsString,
    }));
  });
}
