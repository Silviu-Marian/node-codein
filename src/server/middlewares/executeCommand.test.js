import { expect } from 'chai';

import executeCommand from './executeCommand';

describe('executeCommand - REPL console interface', () => {
  const req = {
    on(event, handler) {
      this[event] = handler;
    },
  };

  it('should work properly', (done) => {
    const doTest = (data) => {
      const r = JSON.parse(data);
      expect(r.error).to.equal(false);
      expect(r.result.type).to.equal('number');
      expect(r.result.value).to.equal('4');
      done();
    };

    executeCommand(req, { end: doTest, send: doTest });
    req.data('2 + 2');
    req.end();
  });

  it('should handle errors gracefully', (done) => {
    const doTest = (data) => {
      const r = JSON.parse(data);
      expect(typeof r.error).to.equal('string');
      done();
    };

    executeCommand(req, { end: doTest, send: doTest });
    req.data('2 + xxxxxxxxxxxxx');
    req.end();
  });
});
