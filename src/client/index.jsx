import React from 'react';
import ReactDOM from 'react-dom';

import MainApp from 'client/MainApp';

import 'client/v1';

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
