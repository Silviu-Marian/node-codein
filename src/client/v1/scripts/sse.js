/* global $ */
import { store } from 'client/Core/store';
import { LISTENER_STORE_PATH, subscribe } from 'client/Console/services/listen';

$(() => {
  const constat = $('.constat');
  const conmsg = constat.find('.msg');
  const conic = constat.find('.eicon');

  let currentState;
  function showOnline() {
    const { isConnected } = store.getState()[LISTENER_STORE_PATH];
    if (isConnected !== currentState) {
      if (isConnected) {
        conmsg.text('Connected');
        conic.text('~');
      } else {
        conmsg.text('Disconnected');
        conic.text('W');
      }
      currentState = isConnected;
    }
  }
  store.subscribe(() => showOnline());
  showOnline();

  store.dispatch(subscribe());
});
