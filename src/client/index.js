import { addReducer, addStorePath, store } from 'client/Core/store';

store.subscribe(() => console.log(JSON.stringify(store.getState())));

addStorePath('test', { x: 0, y: 0 }, true);
addReducer('test', 'setX', (state, { x }) => ({ ...state, x }));
addReducer('test', 'setY', (state, { y }) => ({ ...state, y }));

store.dispatch({ type: 'setX', x: 33 });
store.dispatch({ type: 'setY', y: 55 });
