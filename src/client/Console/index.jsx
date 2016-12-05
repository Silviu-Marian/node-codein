import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SETTINGS_STORE_PATH, saveSettings } from './services/settings';
import { LISTENER_STORE_PATH, subscribe } from './services/listen';
import { CONSOLE_STORE_PATH, clear } from './services/console';
import { execute, addToHistory } from './services/commands';

import ConsoleView from './components';

import uiDark from './themes/ui-dark.scss';
import uiLight from './themes/ui-light.scss';

const noTheme = {};
const themes = {
  'ui-dark': uiDark,
  'ui-light': uiLight,
};

@connect(
  state => ({
    settings: state[SETTINGS_STORE_PATH],
    isConnected: state[LISTENER_STORE_PATH].isConnected,
    commands: state[CONSOLE_STORE_PATH].commands,
  }),
  dispatch => bindActionCreators({
    saveSettings,
    clear,
    execute,
    addToHistory,
    subscribe,
  }, dispatch),
)
export default class Console extends Component {
  static propTypes = {
    settings: PropTypes.shape({}),
    commands: PropTypes.arrayOf(PropTypes.shape({})),
    saveSettings: PropTypes.func,
    clear: PropTypes.func,
    addToHistory: PropTypes.func,
    execute: PropTypes.func,
    subscribe: PropTypes.func,
    isConnected: PropTypes.bool,
  }

  constructor(props, context) {
    super(props, context);
    this.saveSettings = ::props.saveSettings;
    this.clear = ::props.clear;
    this.executeCommand = ::this.executeCommand;

    this.props.subscribe();
  }

  executeCommand(input) {
    this.props.addToHistory(input);
    this.props.execute(input);
  }

  render() {
    const { settings, isConnected, commands } = this.props;
    return (
      <ConsoleView
        settings={settings}
        isConnected={isConnected}
        commands={commands}
        saveSettings={this.saveSettings}
        executeCommand={this.executeCommand}
        clear={this.clear}
        theme={themes[settings.themeClass] || noTheme}
      />
    );
  }
}
