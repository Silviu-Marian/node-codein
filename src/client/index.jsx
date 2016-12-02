import React from 'react';
import ReactDOM from 'react-dom';

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
  // Create Target Div
  const rootContainer = document.createElement('div');
  rootContainer.className = styles.rootContainer;
  document.getElementsByTagName('body')[0].appendChild(rootContainer);

  // Mount
  ReactDOM.render(<Console />, rootContainer);

  // HMR
  if (module.hot) {
    module.hot.accept('client/Console', () => {
      const UpdatedConsole = require('client/Console').default; // eslint-disable-line
      ReactDOM.render(<UpdatedConsole />, rootContainer);
    });
  }
});
