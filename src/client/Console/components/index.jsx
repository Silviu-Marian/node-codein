import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import cn from 'classnames';


import Toolbar, { Separator, Switch, Button, Label } from './Toolbar/';
import Icon from './Icon/';
import ResizeHandle from './ResizeHandle';

import styles from './index.scss';
import uiDark from './themes/ui-dark.scss';
import uiLight from './themes/ui-light.scss';

import nodeJsLogo from './images/node-logo.png';

const title = 'Node.js® CodeIn';
const themes = {
  'ui-dark': uiDark,
  'ui-light': uiLight,
};

export default class ConsoleView extends Component {

  static propTypes = {
    settings: PropTypes.shape({}),
    saveSettings: PropTypes.func,
    clear: PropTypes.func,
    isConnected: PropTypes.bool,
  };

  render() {
    const { settings, isConnected, saveSettings, clear } = this.props;
    const {
      preserveInput,
      showScrollbars,
      showInputArea,
      autoExpand,
      highlight,
      themeClass,
      inputAreaHeight,
    } = settings;
    const theme = themes[themeClass];

    return (
      <div className={cn(styles.consoleView, theme.ConsoleView)}>
        <Helmet title={title} />
        <Toolbar theme={theme}>
          <Label><img src={nodeJsLogo} alt={title} className={styles.nodeJsLogo} /></Label>
          <Separator className={styles.smallSeparator} />
          <Label>{title}</Label>

          <Separator />

          <Switch
            active={!showScrollbars}
            onClick={() => saveSettings({ showScrollbars: !showScrollbars })}
          >
            {(showScrollbars && 'Scrolling') || 'Panning'}
          </Switch>

          <Separator className={styles.largeSeparator} />

          <Switch active={themeClass === 'ui-light'} onClick={() => saveSettings({ themeClass: 'ui-light' })}>Light</Switch>
          <Switch active={themeClass === 'ui-dark'} onClick={() => saveSettings({ themeClass: 'ui-dark' })}>Dark</Switch>

          <Separator className={styles.largeSeparator} />

          <Button href="https://nodejs.org/docs/latest/api/" target="_blank"><Icon glyph="code" /></Button>
          <Button href="https://twitter.com/nodejs" target="_blank"><Icon glyph="twitter" /></Button>
        </Toolbar>

        <div className={styles.consoleOutput}>Resizable area - console output</div>

        <ResizeHandle
          onStart={() => { this.startingHeight = this.commandsInput.clientHeight; }}
          onDrag={(y) => { this.commandsInput.style.height = `${this.startingHeight - y}px`; }}
          onStop={y => saveSettings({ inputAreaHeight: this.startingHeight - y })}
        >
          <button className={cn(styles.resizeHandle, theme.ResizeHandle)} />
        </ResizeHandle>


        <div
          ref={(c) => { this.commandsInput = c; }}
          className={styles.commandsInput}
          style={{ ...{ height: (inputAreaHeight && `${inputAreaHeight}px`) || '' } }}
        >
          Resizable area - commands
        </div>

        <Toolbar theme={theme}>
          <Button active={showInputArea} onClick={() => saveSettings({ showInputArea: !showInputArea })}><Icon glyph="console" /></Button>
          <Button onClick={() => clear()}><Icon glyph="clear" /></Button>
          <Button active={autoExpand} onClick={() => saveSettings({ autoExpand: !autoExpand })}><Icon glyph="expand" /></Button>
          <Button active={highlight} onClick={() => saveSettings({ highlight: !highlight })}><Icon glyph="highlight" /></Button>
          <Button
            active={preserveInput}
            onClick={() => saveSettings({ preserveInput: !preserveInput })}
          >
            <Icon glyph={(preserveInput && 'lock') || 'unlock'} />
          </Button>

          <Separator className={styles.largeSeparator} />

          <Label className={styles.connectionStatus}><Icon glyph={(isConnected && 'connected') || 'disconnected'} /></Label>
          <Separator className={styles.smallSeparator} />
          <Label className={styles.connectionStatusText}>{(isConnected && 'Connected') || 'Disconnected' }</Label>

          <Separator />

          <Switch className={styles.expandAll}>Expand All</Switch>
          <Switch className={styles.collapseAll}>Collapse All</Switch>

          <Separator className={styles.largeSeparator} />

          <Button href={location.href}><Icon glyph="refresh" /></Button>
          <Button
            onClick={() => window.open(location.href, `w${Date.now()}`, 'modal=yes,alwaysRaised=yes')}
          >
            <Icon glyph="duplicate" />
          </Button>
        </Toolbar>
      </div>
    );
  }
}
