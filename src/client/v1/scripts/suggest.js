/* global $ */

import { store } from 'client/Core/store';
import { getSuggestions, clearAll, SUGGESTIONS_STORE_PATH } from 'client/Console/services/suggestions';

$(document).ready(() => {
  const c = $('#command');
  const sugpos = $('.sugpos');
  const suggestionsBox = $('<div id="autosug" class="suggestions"><ul></ul></div>').appendTo('#wrap').hide();

  function insertVal(v) {
    const nv = c.val();
    let cat = c.caretAt();
    c.val(nv.substr(0, cat) + v + nv.substr(cat));
    cat += v.length;
    c.selectRange(cat, cat);
    return setTimeout(() => store.dispatch(clearAll()), 60);
  }

  function showSug(data, part) {
    if (typeof data !== 'object' || !data.length) {
      return;
    }

    data.sort();
    const ul = suggestionsBox.find('> ul');
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

    suggestionsBox
      .removeAttr('style')
      .css({ left: `${pos.left}px` });
    if (suggestionsBox.outerHeight() > $('body').outerHeight() - pos.top) {
      suggestionsBox.css({ bottom: '0px' });
    } else {
      suggestionsBox.css({ top: `${(pos.top - suggestionsBox.parent().offset().top)}px` });
    }

    suggestionsBox.show();
  }

  // React to suggestions list updates
  let currentList = [];
  let currentInput = '';
  function handleChanges() {
    const { suggestions, suggestionsStartWith } = store.getState()[SUGGESTIONS_STORE_PATH];
    if (currentList !== suggestions || currentInput !== suggestionsStartWith) {
      if (suggestions && suggestions.length) {
        showSug(suggestions, suggestionsStartWith);
      } else {
        suggestionsBox.hide();
      }
      currentList = suggestions;
      currentInput = suggestionsStartWith;
    }
  }
  store.subscribe(() => handleChanges());

  // Handle keys
  c.on('keydown', (event) => {
    if (!suggestionsBox.is(':visible')) {
      return;
    }

    if (
      event.keyCode === 27 || /* home key */
      event.keyCode === 37 || /* left arrow */
      event.keyCode === 39 /* right arrow */
    ) {
      store.dispatch(clearAll());
      return;
    }

    const ISUP = (event.keyCode === 38);
    const ISDW = (event.keyCode === 40);
    const ISENT = (event.keyCode === 10 || event.keyCode === 13);

    if (!ISUP && !ISDW && !ISENT) {
      return;
    }

    const lis = suggestionsBox.find('li');
    const curpos = lis.filter('.sel');
    if (ISENT) {
      if (!curpos.length) {
        store.dispatch(clearAll());
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
        suggestionsBox.scrollTop(p.top);
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
        suggestionsBox.scrollTop(p.top);
      }
    }

    event.preventDefault();
    event.stopPropagation();
  });

  let cto = 0;
  let lastQ = '';
  c.on('keyup', () => {
    clearTimeout(cto);
    cto = setTimeout(() => {
      const command = c.val();
      if (command === lastQ || !command) {
        return;
      }

      const cursor = c.caretAt();
      const input = (cursor === command.length && command) || command.substr(0, cursor);
      lastQ = command;
      store.dispatch(getSuggestions(input));
    }, 5);
  });

  $('#output_wrappr').click(() => store.dispatch(clearAll()));
});
