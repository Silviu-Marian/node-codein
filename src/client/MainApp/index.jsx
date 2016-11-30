import React, { Component } from 'react';
import Helmet from 'react-helmet';

import './index.scss';

export default class MainApp extends Component {
  componentWillUnmount() { }

  render() {
    return (
      <div className="MainApp">
        <Helmet title="nodejs™ console" />
      </div>
    );
  }
}
