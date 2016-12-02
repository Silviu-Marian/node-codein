import { store, addReducer, addStorePath } from 'client/Core/store';
import { clear, pushInput, pushMessage, pushNotification } from './console';

/**
 * Store
 */
export const HISTORY_STORE_PATH = 'HISTORY_STORE_PATH';
addStorePath(HISTORY_STORE_PATH, {
  commands: [],
  isFirstVisit: true,
}, true);

/**
 * addToHistory - adds a command to history of ran commands
 */
export const ADD_TO_HISTORY_ACTION = 'ADD_TO_HISTORY_ACTION';
export const MAX_COMMANDS_IN_HISTORY = 50;
export const addToHistory = (input = '') =>
  ({ type: ADD_TO_HISTORY_ACTION, command: input.trim() });

addReducer(HISTORY_STORE_PATH, ADD_TO_HISTORY_ACTION, (state, { command }) =>
  ((!command || command === state.commands[state.commands.length - 1]) && state) ||
  ({
    ...state,
    commands: [...state.commands, command]
      .reverse()
      .slice(0, MAX_COMMANDS_IN_HISTORY)
      .reverse(),
  }));


/**
 * markFirstVisit
 */
export const MARK_FIRST_VISIT_ACTION = 'MARK_FIRST_VISIT_ACTION';
export const markFirstVisit = () => ({ type: MARK_FIRST_VISIT_ACTION });
addReducer(HISTORY_STORE_PATH, MARK_FIRST_VISIT_ACTION, state =>
  ({ ...state, isFirstVisit: false }));


/**
 * execute - run a command locally or on the server
 */
export const BUILTIN_COMMANDS = {
  clear: () => clear(),
};

export function execute(body = '') {
  // Is this command handled internally?
  const cleanCommand = body.replace(/[\s;]+$/, '').replace(/\r|\n|\t|\s/gmi, '');
  if (BUILTIN_COMMANDS[cleanCommand]) {
    store.dispatch(pushInput(body));
    return BUILTIN_COMMANDS[cleanCommand]();
  }

  // Handle command via server
  fetch('/execute', { method: 'post', body })
    .then(response => response.json())
    .then(({ result, error }) => {
      store.dispatch((error && pushNotification(error)) || pushMessage(result));
    })
    .catch((error) => {
      store.dispatch(pushNotification(`Failed: ${error}`));
    });

  // Add command to console
  return pushInput(body);
}
