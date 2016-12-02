/* global $, SUGB */

import { store } from 'client/Core/store';
import { HISTORY_STORE_PATH, addToHistory, markFirstVisit } from 'client/Console/services/commands';

let waitForDown = false;
let waitForUp = false;
let cursor = null;

export function save(input) {
  store.dispatch(addToHistory(input));
  cursor = null;
}


export function getPrev() {
  const e = store.getState()[HISTORY_STORE_PATH].commands;
  let index = (cursor === null) ? e.length - 1 : cursor - 1;
  index = (index < 0) ? 0 : index;

  const r = e[index];
  cursor = index;

  return r || '';
}

export function getNext() {
  const e = store.getState()[HISTORY_STORE_PATH].commands;
  let index = (cursor === null) ? e.length - 1 : cursor + 1;
  index = (index > e.length - 1) ? e.length - 1 : index;

  const r = e[index];
  cursor = index + 1;

  return r || '';
}

$(document).ready(() => {
  const c = $('#command');
  const ch = $('#commandhint');
  const isFirstVisit = store.getState()[HISTORY_STORE_PATH].isFirstVisit;

  // Handle first-time users
  store.dispatch(markFirstVisit());
  if (!isFirstVisit) {
    ch.text('');
  }

  c.on('keyup', (event) => {
    try {
      if (SUGB.is(':visible')) {
        return;
      }
    } catch (e) {
      //
    }

    // hide command hint
    ch[(c.val() === '' && 'show') || 'hide']();

    if (event.keyCode !== 38 && event.keyCode !== 40) {
      waitForUp = false;
      waitForDown = false;
      return;
    }

    const ISUP = (event.keyCode === 38);
    const ISDW = (event.keyCode === 40);
    const len = c.val().length;
    const at = c.caretAt();
    const hassmth = len || c.val().trim().length;

    if ((ISUP && at !== 0) || (ISDW && at !== len)) {
      waitForUp = false;
      waitForDown = false;
      return;
    }
    if (hassmth && ISDW && !waitForDown) { waitForDown = true; return; }
    if (hassmth && ISUP && !waitForUp) { waitForUp = true; return; }

    if (ISUP) {
      c.val(getPrev());
      c.selectRange(0, 0);
      waitForUp = true;
      waitForDown = false;
    } else {
      const gn = getNext();
      c.val(gn);
      c.selectRange(gn.length, gn.length);
      waitForDown = true;
      waitForUp = false;
    }

    ch.hide();
  });
});
