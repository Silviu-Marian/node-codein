import stringify from './stringify';

// @TODO: support additional ES6 types (?)
// @TODO: every value transmitted should (probably) be an object { type, ctor, value, prototype }
export default function jsonEncode(o, fnprefix) {
  const e = [];
  return stringify(o, (k, v) => {
    // Function
    if (typeof v === 'function') {
      return `${fnprefix}${v.toString()}`;
    }

    // @TODO: Weird cases with null and undefined
    if (typeof v === 'undefined' || v === null) {
      return `"${v}"`;
    }

    // Primitive value
    if (typeof v !== 'object' || v === null) {
      return v;
    }

    // Object which has already been looped over (circularity)
    if (e.filter(item => item === v).length) {
      return 'Circular';
    }

    // Any other object
    e.push(v);
    return v;
  });
}
