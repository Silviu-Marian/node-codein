
/**
 * Public domain
 * This whole code came from Douglas Crockford's JSON2 library except some
 * minor change on the first line of the str() function (see next comment)
 */
const escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g; // eslint-disable-line
const meta = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\' };

function quote(string) {
  escapable.lastIndex = 0;
  return escapable.test(string) ? `"${string.replace(escapable, (a) => {
    const c = meta[a];
    return typeof c === 'string' ? c : `\\u${(`0000${a.charCodeAt(0).toString(16)}`).slice(-4)}`;
  })}"` : `"${string}"`;
}

function str(key, holder, rep) {
  /**
   * Changes from Douglas Crockford's version, the five next code lines
   * avoid errors when accessing a value through a getter that raise an
   * ulgy error
   * previously: value = holder[key];
   */
  let value = 'accessor error';
  try {
    value = holder[key];
  } catch (e) {
    //
  }

  if (value && typeof value.toJSON === 'function') {
    try {
      value = value.toJSON(key);
    } catch (e) {
      //
    }
  }

  if (typeof rep === 'function') {
    value = rep(key, value);
  }

  switch (typeof value) {
    case 'string':
      return quote(value);

    case 'number':
      return isFinite(value) ? String(value) : 'null';

    case 'undefined':
      return 'undefined';

    case 'boolean':
      return String(value);

    case 'object': {
      if (value === null) {
        return 'null';
      }
      const partial = [];

      if (Object.prototype.toString.apply(value) === '[object Array]') {
        const length = value.length;
        for (let i = 0; i < length; i += 1) {
          partial[i] = str(i, value, rep);
        }

        const interv = `[${partial.join(',')}]`;
        const v = partial.length === 0 ? '[]' : interv;
        return v;
      }

      Object.keys(value).forEach((k) => {
        partial.push(`${quote(k)}:${str(k, value, rep)}`);
      });

      const interv = `{${partial.join(',')}}`;
      const v = partial.length === 0 ? '{}' : interv;
      return v;
    }
    default: {
      let r = `"[${typeof value}]"`;
      try {
        r = `${value}`;
      } catch (e) {
        //
      }
      return r;
    }
  }
}

export default function stringify(value, replacer = (k, v) => v) {
  if (typeof replacer !== 'function') {
    throw new Error('JSON.stringify');
  }

  return str('', { '': value }, replacer);
}
