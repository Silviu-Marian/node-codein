import { expect } from 'chai';
import serialize from './serialize';

describe('jsonEncode - Custom JSON.stringify API', () => {
  // undefined, number, string, boolean, symbol
  it('should handle primitives', () => {
    const r = serialize({ undefined, number: 2, string: 'xxx', true: true, false: false, symbol: Symbol('a'), function: () => {} });

    expect(r.v.undefined.v).to.equal();
    expect(r.v.undefined.t).to.equal('undefined');
    expect(r.v.number.v).to.equal('2');
    expect(r.v.number.t).to.equal('number');
    expect(r.v.string.v).to.equal('xxx');
    expect(r.v.string.t).to.equal('string');
    expect(r.v.true.v).to.equal(1);
    expect(r.v.false.v).to.equal();
    expect(r.v.true.t).to.equal('boolean');
    expect(r.v.false.t).to.equal('boolean');
    expect(r.v.symbol.t).to.equal('symbol');
    expect(r.v.symbol.v).to.equal('Symbol(a)');
    expect(r.v.function.t).to.equal('function');
    expect(typeof r.v.function.v).to.equal('string');
  });

  it('should handle +Infinity, -Infinity, null and NaN', () => {
    const r = serialize({ pos: Infinity, neg: -Infinity, null: null, NaN });
    expect(r.v.pos.v).to.equal('Infinity');
    expect(r.v.pos.t).to.equal('number');
    expect(r.v.neg.v).to.equal('-Infinity');
    expect(r.v.neg.t).to.equal('number');
    expect(r.v.null.t).to.equal('object');
    expect(r.v.null.v).to.equal(null);
    expect(r.v.NaN.v).to.equal('NaN');
    expect(r.v.NaN.t).to.equal('number');
  });

  // empty array, array of mixed primitives
  it('should handle Array', () => {
    const r = serialize({ emptyArray: [], array: [1, 2, 'a', null, 'x'] });

    expect(r.v.emptyArray.t).to.equal('object');
    expect(r.v.array.t).to.equal('object');
    expect(r.v.array.v[0].v).to.equal('1');
    expect(r.v.array.v[Object.keys(r.v.array.v).length - 1].v).to.equal('x');
    expect(r.v.array.v[Object.keys(r.v.array.v).length - 1].t).to.equal('string');
  });

  it('should handle RegExp, Date, etc.', () => {
    const d = new Date();
    const r = serialize({ WeakMap: new WeakMap(), Date: d, RegExp: /[A-Za-z0-9]+/gi });
    expect(r.v.WeakMap.c).to.equal('WeakMap');
    expect(r.v.Date.v).to.equal(d.toString());
    expect(r.v.RegExp.c).to.equal('RegExp');
  });

  it('should handle setters/getters and custom properties (writable, configurable, extensible)', () => {
    const testObj = {
      get x() { return 2; },
      set x(x) { return x; },
    };
    Object.defineProperty(testObj, 'testProp1', { enumerable: true, writable: false, configurable: false });
    Object.defineProperty(testObj, 'testProp2', { enumerable: true, writable: true, configurable: true });

    const r = serialize(testObj);
    expect(r.v.testProp1.R).to.equal(1);
    expect(r.v.testProp2.C).to.equal(1);
    expect(typeof r.v.x.S).to.equal('string');
    expect(typeof r.v.x.G).to.equal('string');
  });

  it('should handle custom constructors', () => {
    const MyType = () => {};
    const testObj = new MyType();
    const r = serialize(testObj);
    expect(r.c).to.equal('MyType');

    const x = {};
    x.constructor = {};
    const rx = serialize(x);
    expect(rx.c).to.equal(x.constructor.toString());

    const y = {};
    y.constructor = undefined;
    const ry = serialize(y);
    expect(ry.c).to.equal('undefined');
  });

  it('should handle circular references', () => {
    const a = {};
    const b = {};
    a.a = a;
    a.b = b;
    b.a = a;
    b.b = b;
    const r = serialize({ a, b });
    expect(r.v.a.v.a.v).to.equal();
  });
});
