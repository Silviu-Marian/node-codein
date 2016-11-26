function getConstructor(val) {
  return 0 ||
    (val === undefined && 'undefined') ||
    (val === null && 'null') ||
    (val.constructor && val.constructor.name) ||
    (() => {
      try {
        return String(val.constructor);
      } catch (e) {
        return undefined;
      }
    })();
}

function getValue(key, val, refs) {
  const type = typeof val;
  const ctor = getConstructor(val);

  switch (type) {
    case 'object': {
      switch (ctor) {
        case 'null':
          return val;
        case 'Date':
        case 'RegExp':
          return val.toString();
        case 'Object':
        case 'Array':
        default: {
          // @TODO: support custom ones, or call toString()
          const returnValue = {};
          Object.keys(val).forEach((subKey) => {
            let value;
            try {
              value = val[subKey];
            } catch (e) {
              //
            }
            const descr = Object.getOwnPropertyDescriptor(val, subKey);
            const data = serializePrimitive(subKey, value, refs); // eslint-disable-line
            returnValue[subKey] = {
              R: (!descr.writable && 1) || undefined, // read only
              C: (!!descr.configurable && 1) || undefined,
              G: (descr.get && descr.get.toString()) || undefined,
              S: (descr.set && descr.set.toString()) || undefined,
              ...data,
            };
          });
          return returnValue;
        }
      }
    }
    case 'symbol':
      return val.toString(); // .replace(/^Symbol\((.*?)\)$/gi, '$1'); // to obtain construction key

    case 'function':
      return val.toString();

    case 'number':
      return val.toString(); // better handling of Infinity, NaN, 1e+22 etc.

    case 'boolean':
      return (val && 1) || undefined;

    case 'string':
    default:
      return val;
  }
}

function serializePrimitive(key, val, refs) {
  let isCircular = false;
  let refId;
  if (typeof val === 'object' && val !== null) {
    refs.forEach((ref, k) => {
      if (ref === val) {
        isCircular = true;
        refId = k;
      }
    });

    if (!isCircular) {
      refs.push(val);
      refId = refs.length - 1;
    }
  }

  return {
    t: typeof val, // type
    r: refId, // circular reference
    k: key, // key
    v: !isCircular ? getValue(key, val, refs) : undefined, // value
    e: (typeof val === 'object' && val !== null && !!Object.isExtensible(val)) || undefined, // extensible
    c: (typeof val === 'object' && getConstructor(val)) || undefined, // ctor
  };
}

export default function serialize(val) {
  return serializePrimitive(undefined, val, []);
}
