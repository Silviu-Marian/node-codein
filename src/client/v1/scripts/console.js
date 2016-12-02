/* global $, SUGB */

import { store } from 'client/Core/store';

import { CONSOLE_STORE_PATH, clear, pushNotification } from 'client/Console/services/console';
import { execute, addToHistory } from 'client/Console/services/commands';
import { SETTINGS_STORE_PATH } from 'client/Console/services/settings';
import { renderAny } from './localTree';

const escape = v => $('<span />').text(v).html();

$(document).ready(() => {
  const c = $('#command');
  const vw = $('#output_viewer');
  const vwr = $('#output_wrappr');

  /**
   * React to console commands
   */
  let commandsCount = 0;
  store.subscribe(() => {
    const { commands } = store.getState()[CONSOLE_STORE_PATH];
    if ((!commands || !commands.length) && commandsCount !== 0) {
      const { preserveInput } = store.getState()[SETTINGS_STORE_PATH];
      if (!preserveInput) {
        c.val('');
      }
      vw.html('');
    } else {
      // Add any new messages
      commands
        .slice(commandsCount)
        .forEach(({ type, message, messageType }) => {
          switch (type) {
            case 'notification': {
              const messageClass = (typeof messageType === 'string' && messageType) || 'error';
              $('<div class="output" />')
                .addClass(messageClass)
                .append('<span class="eicon">W </span>')
                .append(escape(message))
                .appendTo(vw);
              break;
            }
            case 'message': {
              const { autoExpand } = store.getState()[SETTINGS_STORE_PATH];
              $('<div class="output" />')
                .append(renderAny(message, autoExpand))
                .appendTo(vw);
              break;
            }
            case 'input': {
              $('<div class="cli" />')
                .append(escape(message))
                .appendTo(vw);
              break;
            }
            default:
              break;
          }
        });
    }

    // Scroll to bottom
    vwr.scrollLeft(0).scrollTop(vw.height());

    // Internal State
    commandsCount = (commands && commands.length) || 0;
  });

  // SEND ENTER KEY EVENTS
  c
    .focus()
    .tabby()
    .on('keypress', (event) => {
      if (
        (event.keyCode === 10 || event.keyCode === 13) && // enter was pressed
        !event.shiftKey && // shift was not held down
        !event.altKey && // alt key was not held down
        (!SUGB || (SUGB && !SUGB.is(':visible'))) && // suggestions box was not visible to handle the event
        c.val().trim() // command was not empty
      ) {
        event.preventDefault();

        // Save to commands history
        const v = c.val();
        store.dispatch(addToHistory(v));
        store.dispatch(execute(v));

        const { preserveInput } = store.getState()[SETTINGS_STORE_PATH];
        if (!preserveInput) {
          c.val('');
        }

        return false;
      }
      return true;
    });

  // Ctrl+L clears the console
  $([window, c]).each((key, item) => {
    $(item)
      .on('keydown', (event) => {
        if (
          (event.ctrlKey && event.keyCode === 76) || // ctrl+L
          event.keyCode === 12 /* 'clear' event */
        ) {
          event.preventDefault();
          store.dispatch(clear());
          return false;
        }
        return true;
      });
  });

  // @TODO: should not be the case
  if (!$.browser.webkit) {
    store.dispatch(pushNotification('WARNING: Unsupported browser, certain features might be unavailable.', 'warning'));
  }
});
