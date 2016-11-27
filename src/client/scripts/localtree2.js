/* global $, doResizeWin */
/* eslint no-var: 0, prefer-template: 0, vars-on-top: 0, no-loop-func: 0, no-param-reassign: 0,
  no-restricted-syntax: 0, prefer-arrow-callback:0, no-use-before-define: 0 */


/**
 * 2nd Generation of Object2Tree
 */

(function localTree2() {
  // Indent
  var tabSpaces = '&nbsp;&nbsp;&nbsp;&nbsp;';

  /**
   * renderPrimitive - renders primitive values (boolean, undefined, number, string, symbol)
   */
  function renderPrimitive(data, nobrk) {
    var target = (data && data.type && data) || { value: data, type: typeof data };
    var value = target.value;
    var type = target.type;
    var encd = function encd(v) {
      return $('<div />').text(v).html();
    };

    switch (true) {
      // circular
      case type === 'object' && data.reference && typeof value === 'undefined':
        return '<span class="undef">(circular reference)</span>';
      case value === null:
      case value === undefined:
        return '<span class="undef">' + value + '</span>';
      case type === 'boolean':
        return '<span class="boolean">' + Boolean(value) + '</span>';
      case type === 'number':
        return '<span class="number">' + Number(value) + '</span>';
      case type === 'sybmol':
        return '<span class="symbol">' + value + '</span>';
      case type === 'string':
      case type === 'function': {
        var d = encd(value);
        if (!nobrk) {
          d = d.replace(/\r\n/gmi, '<br />').replace(/\n/gmi, '<br />').replace(/\t/gmi, tabSpaces);
        }

        var r = '<span class="str' + (nobrk ? ' nobrk' : '') + '">' + (d) + '</span>';
        return (type === 'string' ? '<span>&quot;</span>' + r + '<span>&quot;</span>' : r);
      }
      case type === 'object':
      default:
        switch (target.ctor) {
          case 'Date':
          case 'RegExp':
            return '<span>' + value + '</span>';
          default:
            return '<span>' + JSON.stringify(value) + '</span>';
        }
    }
  }


  /**
   * renderObject - renders objects, can call itself or renderPrimitive, returns markup
   */
  function renderObject(obj, autoexpand) {
    var ul = $('<ul class="object"></ul>');
    var keys = [];

    Object.keys(obj.value).forEach((key) => { keys.push(key); });

    keys.sort();

    keys.forEach((k) => {
      var d = obj.value[k];
      if (
        d.type !== 'object' ||
        (d.type === 'object' && d.value === null) ||
        (d.type === 'object' && typeof d.value !== 'object') ||
        (d.type === 'object' && typeof d.value === 'undefined')
      ) {
        $('<li class="nobrk header"><span class="fn">' + k + '</span> ' +
          renderPrimitive(d, 1) + ' </li>').appendTo(ul);
      } else {
        var li = $('<li class="nobrk expandable"></li>').appendTo(ul);
        var hdr = $('<div class="header"></div>').appendTo(li);
        var arrow = $('<span class="arrow-right arrow-collapsed">&#9658;</span>').appendTo(hdr);
        $('<span class="fn">' + k + '</span>').appendTo(hdr);

        var handleArrowClick = function expd() {
          var tgt = li.find('> .object');

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
          if (typeof doResizeWin === 'function') {
            doResizeWin();
          }
        };

        arrow.click(function xxx() { if (!$('.dotstruct').is('.sel')) handleArrowClick(); });
        hdr.click(function xx() { if ($('.dotstruct').is('.sel')) handleArrowClick(); });
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
  function renderAny(object, autoexpand) {
    // Force value format
    if (typeof object !== 'object' || object === null) {
      return renderPrimitive(object);
    }

    // Decision Point
    switch (object.type) {
      case 'object': {
        var keyInUse = '[object ' + (object.ctor || 'Object') + ']';
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

  // Expose Globals
  window.renderObject = renderObject;
  window.renderPrimitive = renderPrimitive;
  window.renderAny = renderAny;
}());
