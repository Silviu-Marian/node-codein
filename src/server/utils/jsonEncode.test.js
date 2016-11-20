import { expect } from 'chai';

import jsonEncode from './jsonEncode';

describe('jsonEncode - Custom JSON.stringify API', () => {
  const a = {};
  const b = {};
  a.b = b;
  b.a = a;

  it('should detect circular references', () =>
    expect(jsonEncode({ a, b })).to.equal('{"a":{"b":{"a":"Circular"}},"b":"Circular"}'));

  it('should leave primitive values unchanged', () =>
    expect(jsonEncode({ string: 's', number: 2, false: false, true: true })).to.equal('{"string":"s","number":2,"false":false,"true":true}'));

  it('should prefix functions with a function prefix', () =>
    expect(jsonEncode({ fn: () => {}, function() {} }, 'axxxa')).to.match(/axxxafunction fn\(/g));

  it('should handle null and undefined in a special manner', () =>
    expect(jsonEncode({ null: null, undefined })).to.equal('{"null":"\\"null\\"","undefined":"\\"undefined\\""}'));
});
