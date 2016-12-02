/* global $ */
import { store } from 'client/Core/store';
import { clear } from 'client/Console/services/console';
import { SETTINGS_STORE_PATH, saveSettings } from 'client/Console/services/settings';

function getSettings() {
  return store.getState()[SETTINGS_STORE_PATH];
}

const minHeight = 40;
const maxHeight = 500;
function adjustLayout() {
  const { inputAreaHeight } = getSettings();
  if (
    isNaN(inputAreaHeight * 1) ||
    inputAreaHeight < minHeight ||
    inputAreaHeight > maxHeight
  ) {
    return;
  }

  const formWrap = $('#formwrap');
  const outputWrapper = $('#output_wrappr');
  const wrap = $('#wrap');

  const newHeight = (formWrap.is(':visible') && inputAreaHeight) || 0;

  formWrap.height(newHeight);
  outputWrapper.height(wrap.height() - newHeight);
}


/**
 * Useless buttons (duplicate, clear, reload)
 */
$(() => {
  $('.new-window').click(() => window.open(window.location.href));
  $('.clear-console').click(() => { store.dispatch(clear()); });
  $('.reload').click(() => window.location.reload());
});

/**
 * Hide/Show write area
 */
$(() => {
  let currentState;
  const swa = $('.show-write-area');
  function handleChange() {
    const { showInputArea } = getSettings();
    if (currentState !== showInputArea) {
      if (showInputArea) {
        swa.addClass('sel');
        $('#formwrap').show().removeClass('h');
        adjustLayout();
        $('#command').focus();
      } else {
        swa.removeClass('sel');
        $('#formwrap').hide('fast', function hide() { $(this).addClass('h'); adjustLayout(); });
      }
      currentState = showInputArea;
    }
  }
  swa.click(() => store.dispatch(saveSettings({ showInputArea: !currentState })));
  store.subscribe(() => handleChange());
  handleChange();
});

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
 * Themes changer
 */
$(() => {
  let currentTheme;
  const themeSwitchers = $('.t_dark_ui, .t_light_ui');
  function actTheme() {
    const { themeClass } = getSettings();
    if (themeClass !== currentTheme) {
      themeSwitchers.removeClass('sel');
      $('body')
        .removeClass(currentTheme)
        .addClass(themeClass);
      $(this).addClass('sel');

      $(themeClass === 'dark-ui' ? '.t_dark_ui' : '.t_light_ui').addClass('sel');
      currentTheme = themeClass;
    }
  }

  themeSwitchers.click(() =>
    store.dispatch(saveSettings({ themeClass: (currentTheme !== 'dark-ui' && 'dark-ui') || '' })));

  store.subscribe(() => actTheme());
  actTheme();
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
 * Expand/collapse all objects
 */
$(() => {
  const vw = $('#output_viewer');
  const vwr = $('#output_wrappr');

  $('.expand-all').click(() => {
    let acoll = vw.find('.arrow-collapsed');
    while (acoll.length) {
      acoll.click();
      acoll = vw.find('.arrow-collapsed');
    }
  });

/**
 * Collapse everything
 */
  $('.collapse-all').click(() => {
    vw.find('.arrow-expanded').click();
    vw.find('.expandable > .object').remove();
    vwr.scrollLeft(0).scrollTop(vw.height());
  });
});


/**
 * Resizable input area
 */
$(() => {
  // RESIZING CONTAINER AREA
  // @TODO: move to tools.js
  $('#formwrap')
  .resizable({
    handles: 'n',
    minHeight,
    maxHeight,
  })
  .on('resize', (event, { size: { height } }) => {
    $('#output_wrappr').height($('#wrap').height() - height);
    $('#formwrap').height(height);
    event.stopPropagation();
    //
  })
  .on('resizestop', (event, { size: { height } }) => {
    store.dispatch(saveSettings({ inputAreaHeight: height }));
  });

  store.subscribe(() => adjustLayout());
  $(window).on('resize', () => adjustLayout());
  adjustLayout();
});


/**
 * Everything should be unselectable
 */
$(() => $('.tool').unsel(true));
