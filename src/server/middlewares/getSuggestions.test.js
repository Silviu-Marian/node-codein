import { expect } from 'chai';

import getSuggestions from './getSuggestions';

describe('getSuggestions middleware / autocomplete', () => {
  const req = {
    on(event, handler) {
      this[event] = handler;
    },
  };

  it('should return a list of suggestions for a global object', (done) => {
    const doTest = (data) => {
      const { suggestions, suggestionsStartWith } = JSON.parse(data);

      expect(suggestions[0]).to.equal('myobject1');
      expect(suggestions[1]).to.equal('myobject2');
      expect(suggestions.length).to.equal(2);
      expect(suggestionsStartWith).to.equal('myobj');
      done();
    };

    global.myobject1 = {};
    global.myobject2 = {};
    getSuggestions(req, { end: doTest, send: doTest });
    req.data('myobj');
    req.end();
  });
});
