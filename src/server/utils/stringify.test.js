import { expect } from 'chai';

import stringify from './stringify';

describe('Altered JSON.stringify', () => {
  it('should work with Arrays', () =>
    expect(stringify([1])).to.equal('[1]'));

  it('should return "\\"" for String', () =>
    expect(stringify('"')).to.equal('"\\""'));

  it('should escape strings properly', () =>
    expect(stringify({ x: '\u202f' })).to.equal('{"x":"\\u202f"}')); // eslint-disable-line

  it('should serialize objects', () =>
    expect(stringify({ w: null, x: 1, y: [], z: {} })).to.equal('{"w":null,"x":1,"y":[],"z":{}}'));

  it('should execute replacer', () =>
    expect(stringify({ x: 1 }, () => 'a')).to.equal('"a"'));

  it('should call toJSON where applicable', () =>
    expect(stringify({ toJSON: () => 'xxxxx' })).to.equal('"xxxxx"'));

  it('should work with null/boolean values', () =>
    expect(stringify(false)).to.equal('false'));

  it('should serialize everything else', () =>
    expect(stringify()).to.equal('undefined'));

  it('should convert NaN to null', () =>
    expect(stringify(NaN)).to.equal('null'));

  it('should throw when a non-function replacer is supplied', () =>
    expect(() => stringify('', true)).to.throw());
});
