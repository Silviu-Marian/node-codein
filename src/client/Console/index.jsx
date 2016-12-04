import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SETTINGS_STORE_PATH, saveSettings } from './services/settings';
import { LISTENER_STORE_PATH } from './services/listen';
import { clear } from './services/console';

import ConsoleView from './components';

@connect(
  state => ({
    settings: state[SETTINGS_STORE_PATH],
    isConnected: state[LISTENER_STORE_PATH].isConnected,
  }),
  dispatch => bindActionCreators({ saveSettings, clear }, dispatch),
)
export default class Console extends Component {
  static propTypes = {
    settings: PropTypes.shape({}),
    saveSettings: PropTypes.func,
    clear: PropTypes.func,
    isConnected: PropTypes.bool,
  }

  constructor(props, context) {
    super(props, context);
    this.saveSettings = ::props.saveSettings;
    this.clear = ::props.clear;
  }

  render() {
    const { settings, isConnected } = this.props;
    return (
      <ConsoleView
        settings={settings}
        isConnected={isConnected}
        saveSettings={this.saveSettings}
        clear={this.clear}
      />
    );
  }
}
