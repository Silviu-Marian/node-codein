import { addStorePath, addReducer } from 'client/Core/store';

/**
 * Store Path
 */
export const CONSOLE_STORE_PATH = 'CONSOLE_STORE_PATH';
addStorePath(CONSOLE_STORE_PATH, {
  commands: [],
});


/**
 * Actions & Reducers
 */

// Clear all messages in the Console
export const CLEAR_ACTION = 'CONSOLE_CLEAR_ACTION';
export const clear = () => ({ type: CLEAR_ACTION });
addReducer(CONSOLE_STORE_PATH, CLEAR_ACTION, state =>
    ({ ...state, commands: [] }));


// Add Notification (warning, info, error)
export const PUSH_NOTIFICATION_ACTION = 'PUSH_NOTIFICATION_ACTION';
export const pushNotification = (message, messageType) =>
  ({ type: PUSH_NOTIFICATION_ACTION, message, messageType });
addReducer(CONSOLE_STORE_PATH, PUSH_NOTIFICATION_ACTION, (state, { messageType, message }) =>
  ({ ...state, commands: [...state.commands, { type: 'notification', message, messageType }] }));


// Add message (be it an object or primitive value)
export const PUSH_MESSAGE_ACTION = 'PUSH_MESSAGE_ACTION';
export const pushMessage = message => ({ type: PUSH_MESSAGE_ACTION, message });
addReducer(CONSOLE_STORE_PATH, PUSH_MESSAGE_ACTION, (state, { message }) =>
  ({ ...state, commands: [...state.commands, { type: 'message', message }] }));


// Add User Command
export const PUSH_INPUT_ACTION = 'PUSH_USER_INPUT_ACTION';
export const pushInput = message => ({ type: PUSH_INPUT_ACTION, message });
addReducer(CONSOLE_STORE_PATH, PUSH_INPUT_ACTION, (state, { message }) =>
  ({ ...state, commands: [...state.commands, { type: 'input', message }] }));
