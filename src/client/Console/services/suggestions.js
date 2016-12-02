import { addStorePath, addReducer } from 'client/Core/store';

/**
 * Store Path
 */
export const SUGGESTIONS_STORE_PATH = 'SUGGESTIONS_STORE_PATH';
addStorePath(SUGGESTIONS_STORE_PATH, {
  suggestionsStartWith: '',
  suggestions: [],
});


/**
 * Replace Suggestions List
 */
const SET_SUGGESTIONS_ACTION = 'SET_SUGGESTIONS_ACTION';
const setSuggestions = ({ suggestions = [], suggestionsStartWith = '' } = {}) =>
  ({ type: SET_SUGGESTIONS_ACTION, suggestions, suggestionsStartWith });
export const clearAll = () => setSuggestions();
addReducer(SUGGESTIONS_STORE_PATH, SET_SUGGESTIONS_ACTION,
  (state, { suggestions, suggestionsStartWith }) =>
    ({ ...state, suggestions, suggestionsStartWith }));


/**
 * Get Suggestions
 */
let index = 0;
export const getSuggestions = (body = '') => (dispatch) => {
  if (!body) {
    return;
  }
  const requestIndex = index += 1;
  dispatch(setSuggestions({ suggestions: [], suggestionsStartWith: '' }));
  fetch('/getSuggestions', { method: 'post', body })
    .then(response => response.json())
    .then(results => requestIndex === index && dispatch(setSuggestions(results)))
    .catch(error => error);
};
