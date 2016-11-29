import { expect } from 'chai';

import { store, addStorePath, addReducer } from './store';

describe('store manager - modular redux interface with persistence layer', () => {
  it('should export a redux store', () => {
    expect(store.subscribe).to.be.a('function');
    expect(store.dispatch).to.be.a('function');
    expect(store.getState).to.be.a('function');
    expect(store.replaceReducer).to.be.a('function');
  });

  it('should make storePaths available', () => {
    addStorePath('test', { x: 0, y: 0 }, false);
    expect(store.getState().test.x).to.equal(0);
    expect(store.getState().test.y).to.equal(0);
  });

  it('should add/execute reducers', () => {
    addReducer('test', 'incrementX', state => ({ ...state, x: state.x + 1 }));
    store.dispatch({ type: 'incrementX' });
    expect(store.getState().test.x).to.equal(1);
  });

  it('should delete reducers', () => {
    const deleteReducer = addReducer('test', 'incrementY', state => ({ ...state, y: state.y + 1 }));
    deleteReducer();
    store.dispatch({ type: 'incrementY' });
    expect(store.getState().test.y).to.equal(0);
  });
});
