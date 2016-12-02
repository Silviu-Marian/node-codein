import { addStorePath, addReducer } from 'client/Core/store';
import { pushMessage, pushNotification } from 'client/Console/services/console';
/**
 * Store Path
 */
export const LISTENER_STORE_PATH = 'LISTENER_STORE_PATH';
addStorePath(LISTENER_STORE_PATH, {
  isConnected: false,
});


/**
 * Set online/offline
 */
export const LISTENER_SET_CONNECTED_ACTION = 'LISTENER_SET_CONNECTED_ACTION';
export const setConnected = (mode = true) =>
  ({ type: LISTENER_SET_CONNECTED_ACTION, mode });
addReducer(LISTENER_STORE_PATH, LISTENER_SET_CONNECTED_ACTION, (state, { mode }) =>
  ({ ...state, isConnected: mode }));

/**
 * Subscribe
 */
let index = 0;
let subscribed = false;
export const subscribe = () => (dispatch) => {
  if (subscribed) {
    return;
  }
  subscribed = true;

  const connect = () => {
    dispatch(setConnected(true));
    fetch(`/listen?${Date.now()}${index += 1}`, { method: 'get' })
      .then(response => response.json())
      .then(messages => messages.map(({ type, contents }) => {
        switch (type) {
          case 'warn':
          case 'error':
            dispatch(pushNotification(typeof contents === 'object' ? contents.value : contents, type));
            break;
          case 'log':
          case 'info':
          default:
            dispatch(pushMessage(contents));
            break;
        }
        return contents;
      }))
      .then(() => setTimeout(() => connect(), 60))
      .catch(() => {
        dispatch(setConnected(false));
        setTimeout(() => connect(), 5000);
      });
  };
  connect();
};
