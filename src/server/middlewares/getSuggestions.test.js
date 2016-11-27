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
      const r = JSON.parse(data);
      expect(r[0]).to.equal('myobject1');
      expect(r[1]).to.equal('myobject2');
      expect(r.length).to.equal(2);
      done();
    };

    global.myobject1 = {};
    global.myobject2 = {};
    getSuggestions(req, { end: doTest, send: doTest });
    req.data(JSON.stringify(['', 'myobj']));
    req.end();
  });
});
