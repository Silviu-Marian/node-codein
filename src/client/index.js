import { addStorePath, addReducer, subscribe, dispatch, getState } from 'client/Core/store';

addStorePath('test', { x: 0, y: 0 });

addReducer('test', 'moveX', (state, { value }) => ({ ...state, x: value }));
addReducer('test', 'moveY', (state, { value }) => ({ ...state, y: value }));

subscribe(() => {
  const state = getState();
  console.log(state); // eslint-disable-line
});


dispatch({ type: 'moveX', value: 22 });
dispatch({ type: 'moveY', value: 52 });
