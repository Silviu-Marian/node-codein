//
// Public domain
// This whole code come from Douglas Crockford's JSON2 library except some
// minor change on the first line of the str() function (see next comment)
//
//
var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
gap,
indent,
meta = {
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\f': '\\f',
  '\r': '\\r',
  '"' : '\\"',
  '\\': '\\\\'
},
rep;

function quote(string) {
  escapable.lastIndex = 0;
  return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
    var c = meta[a];
    return typeof c === 'string'
    ? c
    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
  }) + '"' : '"' + string + '"';
}

function str(key, holder) {
  var i,
  k,
  v,
  length,
  mind = gap,
  partial,
  value;

  //
  // Changes from Douglas Crockford's version, the five next code lines
  // avoid errors when accessing a value through a getter that raise an
  // ulgy error
  // previously : value = holder[key];
  //

  try {
    value = holder[key];
  } catch (Error) {
    value = "accessor error";
  }

  if (value && typeof value === 'object' &&
  typeof value.toJSON === 'function') {
    value = value.toJSON(key);
  }

  if (typeof rep === 'function') {
    value = rep.call(holder, key, value);
  }

  switch (typeof value) {
    case 'string':
    return quote(value);

    case 'number':
    return isFinite(value) ? String(value) : 'null';

    case 'boolean':
    case 'null':
    return String(value);


    case 'object':
    if (!value) {
      return 'null';
    }


    gap += indent;
    partial = [];


    if (Object.prototype.toString.apply(value) === '[object Array]') {


      length = value.length;
      for (i = 0; i < length; i += 1) {
        partial[i] = str(i, value) || 'null';
      }

      v = partial.length === 0
      ? '[]'
      : gap
      ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
      : '[' + partial.join(',') + ']';
      gap = mind;
      return v;
    }

    if (rep && typeof rep === 'object') {
      length = rep.length;
      for (i = 0; i < length; i += 1) {
        if (typeof rep[i] === 'string') {
          k = rep[i];
          v = str(k, value);
          if (v) {
            partial.push(quote(k) + (gap ? ': ' : ':') + v);
          }
        }
      }
    } else {
      for (k in value) {
        if (Object.prototype.hasOwnProperty.call(value, k)) {
          v = str(k, value);
          if (v) {
            partial.push(quote(k) + (gap ? ': ' : ':') + v);
          }
        }
      }
    }

    v = partial.length === 0
    ? '{}'
    : gap
    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
    : '{' + partial.join(',') + '}';
    gap = mind;
    return v;
  }
};

module.exports = function stringify(value, replacer, space) {
  var i;
  gap = '';
  indent = '';

  if (typeof space === 'number') {
    for (i = 0; i < space; i += 1) {
      indent += ' ';
    }
  } else if (typeof space === 'string') {
    indent = space;
  }

  rep = replacer;
  if (replacer && typeof replacer !== 'function' &&
  (typeof replacer !== 'object' ||
  typeof replacer.length !== 'number')) {
    throw new Error('JSON.stringify');
  }

  return str('', {'': value});
};