import { addStorePath, addReducer } from 'client/Core/store';


/**
 * Store Path
 */
export const SUGGESTIONS_STORE_PATH = 'SUGGESTIONS_STORE_PATH';
addStorePath(SUGGESTIONS_STORE_PATH, {
  suggestions: [],
});


/**
 * Replace Suggestions List
 */
export const SET_SUGGESTIONS_ACTION = 'SET_SUGGESTIONS_ACTION';
export const setSuggestions = (suggestions = []) =>
  ({ type: SET_SUGGESTIONS_ACTION, suggestions });
addReducer(SUGGESTIONS_STORE_PATH, SET_SUGGESTIONS_ACTION, (state, { suggestions }) =>
  ({ ...state, suggestions }));


/**
 * Get Suggestions
 */
export const getSuggestions = (input = '') => {
  const noOp = { type: 'IGNORE' };
  if (!input) {
    return noOp;
  }
  return noOp;
};
