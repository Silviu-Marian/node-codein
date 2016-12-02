/* global $ */
function getSubString(str = '', cursor) {
  if (!str) {
    return false;
  }

  // substring
  const subString = (cursor === str.length && str) || str.substr(0, cursor);

  // is inside a string or regex
  const shouldContinue = [/"/g, /'/g, /\//g]
    .map(regex => subString.match(regex))
    .reduce((bottomLine, matches) =>
      (bottomLine && (!matches || (matches && matches.length % 2 === 1))) || false, true);

  if (!shouldContinue) {
    return false;
  }

  // rightmost part
  return subString.split(/[^A-Za-z0-9_$.]/gi).pop() || false;
}

// @TODO: Move to server
function getRequestData(str = '') {
  if (!str) {
    return false;
  }

  const stringParts = str.split('.');
  const lastBit = stringParts.pop();
  return [stringParts.join('.'), lastBit];
}

$(document).ready(() => {
  const c = $('#command');
  const sugpos = $('.sugpos');
  const sugb = window.SUGB = $('<div id="autosug" class="suggestions"><ul></ul></div>').appendTo('#wrap').hide();

  const hideSug = () => sugb.hide();
  function insertVal(v) {
    const nv = c.val();
    let cat = c.caretAt();
    c.val(nv.substr(0, cat) + v + nv.substr(cat));
    cat += v.length;
    c.selectRange(cat, cat);
    return setTimeout(() => hideSug(), 60);
  }

  function showSug(data, part) {
    if (typeof data !== 'object' || !data.length) {
      return;
    }

    data.sort();

    const ul = sugb.find('> ul');

    ul.find('li').remove();

    for (let j = 0; j < data.length; j += 1) {
      ((i) => {
        const el = $('<li />');
        el.text(data[i]); // if(i==0) el.addClass('sel');
        el.attr('ins', data[i].replace(part, ''));
        el.click(function onElClick() { insertVal($(this).attr('ins')); });
        el.appendTo(ul);
      })(j);
    }

    sugpos.text(c.val().substr(0, c.caretAt()));
    sugpos.html(`${sugpos.html()}<div class="poslin">&nbsp;</div>`);

    const pos = sugpos.find('.poslin').offset();

    sugb.removeAttr('style');
    sugb.css({ left: `${pos.left}px` });
    if (sugb.outerHeight() > $('body').outerHeight() - pos.top) {
      sugb.css({ bottom: '0px' });
    } else {
      sugb.css({ top: `${(pos.top - sugb.parent().offset().top)}px` });
    }

    sugb.show();
  }

  let cto = 0;
  let lastValid = 0;
  let lastQ = '';

  c.on('keydown', (event) => {
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

  c.on('keyup', () => {
    clearTimeout(cto);
    cto = setTimeout(() => {
      const v = c.val();
      if (v === lastQ) {
        return;
      }

      hideSug();
      if (v === '') {
        lastQ = '';
        return;
      }

      const part = getSubString(v, c.caretAt());
      if (part === false) {
        return;
      }
      const parts = getRequestData(part.trim());
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
        data,
        type: 'POST',
        complete: (rs) => {
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

  $('#output_wrappr').click(() => hideSug());
});
