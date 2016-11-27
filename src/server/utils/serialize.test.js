import { expect } from 'chai';
import serialize from './serialize';

describe('serialize - Converts any value to a (potentially very large) descriptor', () => {
  // undefined, number, string, boolean, symbol
  it('should handle primitives', () => {
    const r = serialize({ undefined, number: 2, string: 'xxx', true: true, false: false, symbol: Symbol('a'), function: () => {} });

    expect(r.value.undefined.value).to.equal();
    expect(r.value.undefined.type).to.equal('undefined');
    expect(r.value.number.value).to.equal('2');
    expect(r.value.number.type).to.equal('number');
    expect(r.value.string.value).to.equal('xxx');
    expect(r.value.string.type).to.equal('string');
    expect(r.value.true.value).to.equal(1);
    expect(r.value.false.value).to.equal();
    expect(r.value.true.type).to.equal('boolean');
    expect(r.value.false.type).to.equal('boolean');
    expect(r.value.symbol.type).to.equal('symbol');
    expect(r.value.symbol.value).to.equal('Symbol(a)');
    expect(r.value.function.type).to.equal('function');
    expect(typeof r.value.function.value).to.equal('string');
  });

  it('should handle +Infinity, -Infinity, null and NaN', () => {
    const r = serialize({ pos: Infinity, neg: -Infinity, null: null, NaN });
    expect(r.value.pos.value).to.equal('Infinity');
    expect(r.value.pos.type).to.equal('number');
    expect(r.value.neg.value).to.equal('-Infinity');
    expect(r.value.neg.type).to.equal('number');
    expect(r.value.null.type).to.equal('object');
    expect(r.value.null.value).to.equal(null);
    expect(r.value.NaN.value).to.equal('NaN');
    expect(r.value.NaN.type).to.equal('number');
  });

  // empty array, array of mixed primitives
  it('should handle Array', () => {
    const r = serialize({ emptyArray: [], array: [1, 2, 'a', null, 'x'] });

    expect(r.value.emptyArray.type).to.equal('object');
    expect(r.value.array.type).to.equal('object');
    expect(r.value.array.value[0].value).to.equal('1');
    expect(r.value.array.value[Object.keys(r.value.array.value).length - 1].value).to.equal('x');
    expect(r.value.array.value[Object.keys(r.value.array.value).length - 1].type).to.equal('string');
  });

  it('should handle RegExp, Date, etc.', () => {
    const d = new Date();
    const r = serialize({ WeakMap: new WeakMap(), Date: d, RegExp: /[A-Za-z0-9]+/gi });
    expect(r.value.WeakMap.ctor).to.equal('WeakMap');
    expect(r.value.Date.value).to.equal(d.toString());
    expect(r.value.RegExp.ctor).to.equal('RegExp');
  });

  it('should handle setters/getters and custom properties (writable, configurable)', () => {
    const testObj = {
      get x() { return 2; },
      set x(x) { return x; },
    };
    Object.defineProperty(testObj, 'testProp1', { enumerable: true, writable: false, configurable: true });
    Object.defineProperty(testObj, 'testProp2', { enumerable: true, writable: true, configurable: false });

    const r = serialize(testObj);
    expect(r.value.testProp1.readOnly).to.equal(1);
    expect(r.value.testProp2.configLocked).to.equal(1);
    expect(typeof r.value.x.setter).to.equal('string');
    expect(typeof r.value.x.getter).to.equal('string');
  });

  it('should handle custom constructors', () => {
    const MyType = () => {};
    const testObj = new MyType();
    const r = serialize(testObj);
    expect(r.ctor).to.equal('MyType');

    const x = {};
    x.constructor = {};
    const rx = serialize(x);
    expect(rx.ctor).to.equal(x.constructor.toString());

    const y = {};
    y.constructor = undefined;
    const ry = serialize(y);
    expect(ry.ctor).to.equal('undefined');
  });

  it('should handle circular references', () => {
    const a = {};
    const b = {};
    a.a = a;
    a.b = b;
    b.a = a;
    b.b = b;
    const r = serialize({ a, b });
    expect(r.value.a.value.a.value).to.equal();
  });
});
