import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from 'client/Core/store';

// Polyfills
import Promise from 'promise-polyfill';

// Import v1
import 'client/v1';

// Import v2
import Console from 'client/Console';

// Styles
import styles from './index.scss';

window.Promise = window.Promise || Promise;
window.addEventListener('load', () => {
  const alwaysTrue = true;
  if (alwaysTrue) {
    return;
  }
  // Markup
  const getMarkup = RootComponent => (
    <Provider store={store}>
      <RootComponent />
    </Provider>
  );

  // Create Target Div
  const rootContainer = document.createElement('div');
  rootContainer.className = styles.rootContainer;
  document.getElementsByTagName('body')[0].appendChild(rootContainer);

  // Mount
  ReactDOM.render(getMarkup(Console), rootContainer);

  // HMR
  if (module.hot) {
    module.hot.accept('client/Console', () => {
      const UpdatedConsole = require('client/Console').default; // eslint-disable-line
      ReactDOM.render(getMarkup(UpdatedConsole), rootContainer);
    });
  }
});
