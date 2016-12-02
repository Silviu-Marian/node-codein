import { addStorePath, addReducer } from 'client/Core/store';

/**
 * Store Path
 */
export const SETTINGS_STORE_PATH = 'SETTINGS_STORE_PATH';
addStorePath(SETTINGS_STORE_PATH, {
  showInputArea: true,
  inputAreaHeight: null,
  autoExpand: false,
  highlight: true,
  showSpine: true,
  preserveInput: false,
  themeClass: 'ui-light',
  showScrollbars: false,
}, true);

/**
 * Save Settings
 */
export const SAVE_SETTINGS_ACTION = 'SAVE_SETTINGS_ACTION';
export const saveSettings = settings => ({ type: SAVE_SETTINGS_ACTION, settings });
addReducer(SETTINGS_STORE_PATH, SAVE_SETTINGS_ACTION, (state, { settings }) =>
  ({ ...state, ...settings }));
