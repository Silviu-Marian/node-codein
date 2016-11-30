/* global $, trim */
/* eslint prefer-arrow-callback: 0, func-names: 0, prefer-template: 0, object-shorthand: 0 */
$(document).ready(function () {
  const c = $('#command');
  const sugpos = $('.sugpos');
  const sugb = window.SUGB = $('<div id="autosug" class="suggestions"><ul></ul></div>').appendTo('#wrap').hide();

  const getWorkingOn = function (str, pos) {
    if (typeof str !== 'string') {
      return false;
    }

    // get workable part
    let ss = pos === str.length ? str : str.substr(0, pos);

    // is inside a string or regex
    let shouldContinue = true;
    [ss.match(/"/g), ss.match(/'/g), ss.match(/\//g)].forEach(function (test) {
      if (test === null || !test.length) {
        return;
      }
      if (test.length % 2 === 1) {
        shouldContinue = false;
      }
    });

    if (!shouldContinue) {
      return false;
    }

    // get separation dots (could use regex here)
    let atp = 0;
    for (let i = ss.length - 1; i >= 0; i -= 1) {
      if ((/[^A-Za-z0-9_$.]/).test(ss[i])) {
        atp = i + 1;
        break;
      }
    }

    ss = trim(ss.substr(atp, ss.length - atp));
    if (ss === '') {
      return false;
    }
    return ss;
  };

  const getSearchObject = function (str) {
    if (
      typeof str !== 'string' ||
      !trim(str).length ||
      str.charAt(0) === '.'
    ) {
      return false;
    }

    const ostr = str.split('.');
    const r = [];
    r[0] = '';
    r[1] = ostr.pop();
    r[0] = ostr.join('.');

    return r;
  };

  const hideSug = function () { return sugb.hide(); };
  const insertVal = window.commandInsertVal = function (v) {
    const nv = c.val();
    let cat = c.caretAt();
    c.val(nv.substr(0, cat) + v + nv.substr(cat));
    cat += v.length;
    c.selectRange(cat, cat);
    return setTimeout(function () { hideSug(); }, 60);
  };

  const showSug = function (data, part) {
    if (typeof data !== 'object' || !data.length) {
      return;
    }

    data.sort();

    const ul = sugb.find('> ul');

    ul.find('li').remove();

    for (let i = 0; i < data.length; i += 1) {
      (function () {
        const el = $('<li />');
        el.text(data[i]); // if(i==0) el.addClass('sel');
        el.attr('ins', data[i].replace(part, ''));
        el.click(function () { insertVal($(this).attr('ins')); });
        el.appendTo(ul);
      }(i));
    }

    sugpos.text(c.val().substr(0, c.caretAt()));
    sugpos.html(sugpos.html() + '<div class="poslin">&nbsp;</div>');

    const pos = sugpos.find('.poslin').offset();

    sugb.removeAttr('style');
    sugb.css({ left: pos.left + 'px' });
    if (sugb.outerHeight() > $('body').outerHeight() - pos.top) {
      sugb.css({ bottom: '0px' });
    } else {
      sugb.css({ top: (pos.top - sugb.parent().offset().top) + 'px' });
    }

    sugb.show();
  };

  let cto = 0;
  let lastValid = 0;
  let lastQ = '';

  c.on('keydown', function (event) {
    try {
      if (!sugb.is(':visible')) {
        return;
      }
    } catch (e) {
      //
    }

    if (
      event.keyCode === 27 || /* home key */
      event.keyCode === 37 || /* left arrow */
      event.keyCode === 39 /* right arrow */
    ) {
      hideSug();
      return;
    }

    const ISUP = (event.keyCode === 38);
    const ISDW = (event.keyCode === 40);
    const ISENT = (event.keyCode === 10 || event.keyCode === 13);

    if (!ISUP && !ISDW && !ISENT) {
      return;
    }

    const lis = sugb.find('li');
    const curpos = lis.filter('.sel');
    if (ISENT) {
      if (!curpos.length) {
        hideSug();
        return;
      }
      curpos.trigger('click');
    } else if (ISDW) {
      if (!curpos.length) {
        lis.first().addClass('sel');
      } else {
        let i = curpos.index();
        if (i + 1 >= lis.length) {
          i = -1;
        }
        i += 1;
        curpos.removeClass('sel');
        const p = $(lis.get(i)).addClass('sel').position();
        sugb.scrollTop(p.top);
      }
    } else if (ISUP) {
      if (!curpos.length) {
        lis.last().addClass('sel');
      } else {
        let i = curpos.index();
        if (i - 1 < 0) {
          i = lis.length;
        }
        i -= 1;
        curpos.removeClass('sel');
        const p = $(lis.get(i)).addClass('sel').position();
        sugb.scrollTop(p.top);
      }
    }

    event.preventDefault();
    event.stopPropagation();
  });

  c.on('keyup', function () {
    clearTimeout(cto);
    cto = setTimeout(function () {
      const v = c.val();
      if (v === lastQ) {
        return;
      }

      hideSug();
      if (v === '') {
        lastQ = '';
        return;
      }

      const part = getWorkingOn(v, c.caretAt());
      if (part === false) {
        return;
      }
      const parts = getSearchObject(part);
      if (parts === false) {
        return;
      }
      const data = JSON.stringify(parts);

      lastValid += 1;
      const lastExp = lastValid;

      hideSug();

      $.ajax({
        url: '/getSuggestions',
        dataType: 'html',
        data: data,
        type: 'POST',
        complete: function (rs) {
          if (
            lastExp !== lastValid ||
            rs.status !== 200
          ) {
            return;
          }

          let r;
          try {
            r = JSON.parse(rs.responseText);
          } catch (e) {
            return;
          }
          try {
            if (parts[1] === r[0]) {
              return;
            }
          } catch (e) {
            //
          }
          showSug(r, parts[1]);
          lastQ = v;
        },
      });
    }, 5);
  });

  $('#output_wrappr').click(function () {
    hideSug();
  });
});
