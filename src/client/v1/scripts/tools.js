/* global $ */
import { store } from 'client/Core/store';
import { SETTINGS_STORE_PATH, saveSettings } from 'client/Console/services/settings';

function getSettings() {
  return store.getState()[SETTINGS_STORE_PATH];
}

/**
 * Autoexpand
 */
$(() => {
  let currentState;
  const autoexp = $('.autoexpand');
  function actAutoExpand() {
    const { autoExpand } = getSettings();
    if (currentState !== autoExpand) {
      if (autoExpand) {
        autoexp.addClass('sel');
      } else {
        autoexp.removeClass('sel');
      }
      currentState = autoExpand;
    }
  }
  autoexp.click(() => store.dispatch(saveSettings({ autoExpand: !currentState })));
  store.subscribe(() => actAutoExpand());
  actAutoExpand();
});

/**
 * Highlight and show spine
 */
$(() => {
  let currentState;
  const dotstruct = $('.dotstruct');
  function actDotStruct() {
    const { highlight, showSpine } = getSettings();
    if (highlight !== currentState || showSpine !== currentState) {
      if (highlight || showSpine) {
        dotstruct.addClass('sel');
        $('body').removeClass('nodots');
      } else {
        dotstruct.removeClass('sel');
        $('body').addClass('nodots');
      }
      currentState = (highlight || showSpine);
    }
  }
  dotstruct.click(() =>
    store.dispatch(saveSettings({ highlight: !currentState, showSpine: !currentState })));
  store.subscribe(() => actDotStruct());
  actDotStruct();
});

/**
 * Preserve input
 */
$(() => {
  let currentState;
  const preserve = $('.preserve');
  function actPreserve() {
    const { preserveInput } = getSettings();
    if (preserveInput !== currentState) {
      if (preserveInput) {
        preserve.addClass('sel').text('x');
      } else {
        preserve.removeClass('sel').text('w');
      }
      currentState = preserveInput;
    }
  }
  preserve.click(() => store.dispatch(saveSettings({ preserveInput: !currentState })));
  store.subscribe(() => actPreserve());
  actPreserve();
});


/**
 * Scroll/pan
 */
$(() => {
  let currentMode;
  const iscr = $('.iScroll');
  function actiscr() {
    const { showScrollbars } = getSettings();
    if (currentMode !== showScrollbars) {
      if (showScrollbars) {
        $('#output_wrappr')
          .removeClass('dragscrollable')
          .css({ overflow: 'auto' })
          .off();
        $('#output_viewer')
          .off();
        iscr
          .removeClass('sel')
          .text('Scrolling');
      } else {
        $('#output_wrappr')
          .addClass('dragscrollable')
          .css({ overflow: 'hidden' })
          .dragscrollable();
        iscr
          .addClass('sel')
          .text('Panning');
      }
      currentMode = showScrollbars;
    }
  }
  iscr.click(() => store.dispatch(saveSettings({ showScrollbars: !currentMode })));
  store.subscribe(() => actiscr());
  actiscr();
});


/**
 * Expand everything
 */
$(() => {
  const vw = $('#output_viewer');

  $('.expand-all').click(() => {
    let acoll = vw.find('.arrow-collapsed');
    while (acoll.length) {
      acoll.click();
      acoll = vw.find('.arrow-collapsed');
    }
  });
});

/**
 * Collapse everything
 */
$(() => {
  const vw = $('#output_viewer');
  const vwr = $('#output_wrappr');

  $('.collapse-all').click(() => {
    vw.find('.arrow-expanded').click();
    vw.find('.expandable > .object').remove();
    vwr.scrollLeft(0).scrollTop(vw.height());
  });
});
