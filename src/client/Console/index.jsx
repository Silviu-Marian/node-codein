import React, { Component } from 'react';
import Helmet from 'react-helmet';

import style from './index.scss';

export default class MainApp extends Component {
  componentWillUnmount() { }

  render() {
    return (
      <div className={style.console}>
        <Helmet title="nodejs™ console" />
      </div>
    );
  }
}
