// Dynamic Reducers Loading - extended implementation of stackoverflow/32968016
// @TODO: persistence layer - https://www.npmjs.com/package/redux-localstorage

import { compose, createStore, combineReducers } from 'redux';
import persistState, { transformState, mergePersistedState } from 'redux-localstorage';
import adapter from 'redux-localstorage/lib/adapters/localStorage';

const reducers = {};
const reducersByStorePath = {};
const persistentStorePaths = {};
let currentReducerId = 0; // allows removing reducers by id

/**
 * getReducer - retrieves a combined reducer for a given storePath
 */
function getReducer(storePath) {
  return compose(
    mergePersistedState(),
  )((state = {}, action) => {
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
  });
}

/**
 * Store - the one and only
 */
export const store = createStore(getReducer(), compose(
  /* [middlewares] */
  persistState(compose(
    transformState([
      state => Object.keys(persistentStorePaths)
        .filter(storePath => persistentStorePaths[storePath])
        .reduce((prev, storePath) => ({ ...prev, [storePath]: state[storePath] }), {}),
    ], []),
  )(adapter(localStorage)), 'node-codein'),
));

/**
 * addReducer - registers a new reducer for a given store path or store path/action type combination
 * @param {string}  storePath     store path on which reducer operates
 * @param {string}  [actionType]  action.type on which reducer operates
 * @param {function} reducer      the reducer, signature is (currentState, action) => newState
 * @return {function}             callable that removes the reducer when called
 */
export function addReducer(...params) {
  const storePath = params[0];
  const actionType = (typeof params[1] !== 'function' && params[1]) || '*';
  const reducer = (typeof params[1] === 'function' && params[1]) || params[2];

  if (!storePath || typeof storePath !== 'string') {
    throw new TypeError('storePath must be a non-empty string');
  } else if (typeof params[1] !== 'function' && (!actionType || typeof actionType !== 'string')) {
    throw new TypeError('actionType must be a non-empty string; \'*\' will handle multiple actionTypes');
  } else if (typeof reducer !== 'function') {
    throw new TypeError('reducer must be a pure function');
  }

  reducers[storePath] = reducers[storePath] || {};
  reducers[storePath][actionType] = reducers[storePath][actionType] || {};

  // Index Reducer By storePath
  if (!reducersByStorePath[storePath]) {
    reducersByStorePath[storePath] = getReducer(storePath);
    store.replaceReducer(combineReducers(
      Object.keys(store.getState()).reduce((prevReducer, key) => ({
        ...prevReducer,
        [key]: prevReducer[key] || ((state = {}) => state),
      }), reducersByStorePath),
    ));
  }

  // Index Reducer By Allocated Id
  const reducerId = currentReducerId += 1;
  reducers[storePath][actionType][reducerId] = reducer;

  // Return removeReducer Function
  return () => { delete reducers[storePath][actionType][reducerId]; };
}

/**
 * addStorePath - ensures a new path in store / will skip if store path exists
 * @param {string}  storePath     store path to add
 * @param {object}  initialState  defaults
 */
export function addStorePath(storePath = '', initialState = {}, persistent = false) {
  if (!storePath) {
    throw new TypeError('storePath must be a non-empty string');
  }

  // Mark storePath as Persistent
  persistentStorePaths[storePath] = persistent;

  // Add the storePath
  if (!store.getState()[storePath]) {
    const type = `@@store/add_store_path_action!!!${Date.now()}`;
    const removeReducer = addReducer(storePath, type, (state = initialState) =>
    ({ ...state, ...initialState }));
    store.dispatch({ type });
    removeReducer();
  }
}
