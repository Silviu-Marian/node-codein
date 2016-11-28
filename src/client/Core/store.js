// Dynamic Reducers Loading - extended implementation of stackoverflow/32968016
// @TODO: persistence layer - https://www.npmjs.com/package/redux-localstorage

import { createStore, combineReducers } from 'redux';

const reducers = {};
const reducersByStorePath = {};
let currentReducerId = 0; // allows removing reducers by id

/**
 * getReducer - retrieves all reducers for a given storePath
 */
function getReducer(storePath = '*') {
  return (state = {}, action) => {
    if (typeof action.type !== 'string' || typeof reducers[storePath] !== 'object') {
      return state;
    }
    let newState = state;

    [action.type, '*']
      .filter(actionType => typeof reducers[storePath][actionType] === 'object')
      .forEach((actionType) => {
        Object.values(reducers[storePath][actionType])
          .filter(reducer => typeof reducer === 'function')
          .forEach((reducer) => {
            newState = reducer(state, action);
          });
      });

    // what's left after all those mutations
    return newState;
  };
}

/**
 * Store - the one and only
 */
const store = createStore(getReducer());

/**
 * addReducer - registers a new reducer for a given store path or store path/action type combination
 * * @return {function}           callable that removes the reducer when called
 */
export function addReducer(...params) {
  const storePath = params[0];
  const actionType = (typeof params[1] !== 'function' && params[1]) || '*';
  const reducer = (typeof params[1] === 'function' && params[1]) || params[2];
  if (!storePath || typeof storePath !== 'string') {
    throw new TypeError('storePath must be a non-empty string');
  }

  if (typeof params[1] !== 'function' && (!actionType || typeof actionType !== 'string')) {
    throw new TypeError('actionType must be a non-empty string; \'*\' will handle multiple actionTypes');
  }

  if (typeof reducer !== 'function') {
    throw new TypeError('reducer must be a pure function');
  }

  reducers[storePath] = reducers[storePath] || {};
  reducers[storePath][actionType] = reducers[storePath][actionType] || {};

  // Index Reducer By storePath
  if (!reducersByStorePath[storePath]) {
    reducersByStorePath[storePath] = getReducer(storePath);
    store.replaceReducer(combineReducers(reducersByStorePath));
  }

  // Index Reducer By Allocated Id
  const reducerId = currentReducerId += 1;
  reducers[storePath][actionType][reducerId] = reducer;

  // Return removeReducer Function
  return () => { delete reducers[storePath][actionType][reducerId]; };
}

/**
 * addStorePath - registers a new path in store
 */
export function addStorePath(storePath = '', initialState = {}) {
  if (!storePath) {
    throw new TypeError('storePath must be a non-empty string');
  }
  const type = `@@store/add_store_path_action!!!${Date.now()}`;
  const removeReducer = addReducer(storePath, type, (state = initialState) =>
    ({ ...state, ...initialState }));
  store.dispatch({ type });
  removeReducer();
}

/**
* dispatch, subscribe, getState, replaceReducer - convenience wrappers
*/
export const dispatch = (...params) => store.dispatch(...params);
export const subscribe = (...params) => store.subscribe(...params);
export const getState = (...params) => store.getState(...params);
export const replaceReducer = (...params) => store.replaceReducer(...params);
