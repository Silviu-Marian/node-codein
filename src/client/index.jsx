import React from 'react';
import ReactDOM from 'react-dom';

// Polyfills
import Promise from 'promise-polyfill';

// Import v2
import MainApp from 'client/MainApp';

// Import client/v1
import 'client/v1';


window.Promise = window.Promise || Promise;
window.addEventListener('load', () => {
  // Create Target Div
  const rootContainer = document.createElement('div');
  document.getElementsByTagName('body')[0].appendChild(rootContainer);

  // Mount
  ReactDOM.render(<MainApp />, rootContainer);

  // HMR
  if (module.hot) {
    module.hot.accept('client/MainApp', () => {
      const UpdatedMainApp = require('client/MainApp').default; // eslint-disable-line
      ReactDOM.render(<UpdatedMainApp />, rootContainer);
    });
  }
});
