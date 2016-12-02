/* global $ */

/**
* 2nd Generation of Object2Tree
*/

// Indent
const tabSpaces = '&nbsp;&nbsp;&nbsp;&nbsp;';

/**
 * renderPrimitive - renders primitive values (boolean, undefined, number, string, symbol)
 */
export function renderPrimitive(data, nobrk) {
  const target = (data && data.type && data) || { value: data, type: typeof data };
  const value = target.value;
  const type = target.type;
  const encd = function encd(v) {
    return $('<div />').text(v).html();
  };

  switch (true) {
    // circular
    case type === 'object' && data.reference && typeof value === 'undefined':
      return '<span class="undef">(circular reference)</span>';
    case value === null:
    case value === undefined:
      return `<span class="undef">${value}</span>`;
    case type === 'boolean':
      return `<span class="boolean">${Boolean(value)}</span>`;
    case type === 'number':
      return `<span class="number">${Number(value)}</span>`;
    case type === 'sybmol':
      return `<span class="symbol">${value}</span>`;
    case type === 'string':
    case type === 'function': {
      let d = encd(value);
      if (!nobrk) {
        d = d.replace(/\r\n/gmi, '<br />').replace(/\n/gmi, '<br />').replace(/\t/gmi, tabSpaces);
      }

      const r = `<span class="str${nobrk ? ' nobrk' : ''}">${d}</span>`;
      return (type === 'string' ? `<span>&quot;</span>${r}<span>&quot;</span>` : r);
    }
    case type === 'object':
    default:
      switch (target.ctor) {
        case 'Date':
        case 'RegExp':
          return `<span>${value}</span>`;
        default:
          return `<span>${JSON.stringify(value)}</span>`;
      }
  }
}


/**
 * renderObject - renders objects, can call itself or renderPrimitive, returns markup
 */
export function renderObject(obj, autoexpand) {
  const ul = $('<ul class="object"></ul>');
  const keys = [];

  Object.keys(obj.value).forEach((key) => { keys.push(key); });

  keys.sort();

  keys.forEach((k) => {
    const d = obj.value[k];
    if (
      d.type !== 'object' ||
      (d.type === 'object' && d.value === null) ||
      (d.type === 'object' && typeof d.value !== 'object') ||
      (d.type === 'object' && typeof d.value === 'undefined')
    ) {
      $(`<li class="nobrk header"><span class="fn">${k}</span> ${
        renderPrimitive(d, 1)} </li>`).appendTo(ul);
    } else {
      const li = $('<li class="nobrk expandable"></li>').appendTo(ul);
      const hdr = $('<div class="header"></div>').appendTo(li);
      const arrow = $('<span class="arrow-right arrow-collapsed">&#9658;</span>').appendTo(hdr);
      $(`<span class="fn">${k}</span>`).appendTo(hdr);

      const handleArrowClick = function expd() {
        let tgt = li.find('> .object');

        // Collapse
        if (tgt.length && tgt.is(':visible')) {
          tgt.hide();
          arrow.removeClass('arrow-expanded').addClass('arrow-collapsed').html('&#9658;');
        // Expand
        } else {
          if (!tgt.length) {
            tgt = $(renderObject(d)).appendTo(li);
          }
          tgt.show();
          arrow.removeClass('arrow-collapsed').addClass('arrow-expanded').html('&#9660;');
        }
      };

      arrow.click(() => { if (!$('.dotstruct').is('.sel')) handleArrowClick(); });
      hdr.click(() => { if ($('.dotstruct').is('.sel')) handleArrowClick(); });
      if (autoexpand) {
        handleArrowClick();
      }
    }
  });

  return ul;
}


/**
 * renderAny - Handles both primitives and objects, returns a string with markup to append
 */
export function renderAny(target, autoexpand) {
  // Force value format
  if (typeof target !== 'object' || target === null) {
    return renderPrimitive(target);
  }

  // Decision Point
  const object = target;
  switch (object.type) {
    case 'object': {
      const keyInUse = `[object ${object.ctor || 'Object'}]`;
      object.key = keyInUse;
      const newObject = {
        ctor: object.ctor,
        type: object.type,
        value: { },
      };
      newObject.value[keyInUse] = object;
      return renderObject(newObject, autoexpand);
    }
    default:
      return renderPrimitive(object);
  }
}
