import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import cn from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';

import Toolbar, { Separator, Switch, Button, Label } from './Toolbar/';
import Icon from './Icon/';
import ResizeHandle from './ResizeHandle';
import ConsoleInput from './ConsoleInput';
import ConsoleOutput from './ConsoleOutput';

import styles from './index.scss';

import nodeJsLogo from './nodeJSLogo.png';

const title = 'Node.js® CodeIn';


export default class ConsoleView extends Component {

  static propTypes = {
    settings: PropTypes.shape({}),
    commands: PropTypes.arrayOf(PropTypes.shape({})),
    saveSettings: PropTypes.func,
    clear: PropTypes.func,
    executeCommand: PropTypes.func,
    isConnected: PropTypes.bool,
    theme: PropTypes.shape({}),
  };

  render() {
    const {
      settings,
      isConnected,
      commands,
      saveSettings,
      clear,
      executeCommand,
      theme,
    } = this.props;
    const {
      preserveInput,
      showScrollbars,
      showInputArea,
      autoExpand,
      highlight,
      themeClass,
      inputAreaHeight,
    } = settings;

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

        <ConsoleOutput
          className={styles.consoleOutput}
          commands={commands}
        />

        <ResizeHandle
          onStart={() => {
            if (showInputArea) {
              this.startingHeight = this.commandsInput.clientHeight;
            }
          }}
          onDrag={(y) => { if (showInputArea) { this.commandsInput.style.height = `${this.startingHeight - y}px`; } }}
          onStop={(y) => {
            if (showInputArea) {
              saveSettings({ inputAreaHeight: this.startingHeight - y });
            }
          }}
        >
          <button className={cn(styles.resizeHandle, theme.ResizeHandle)} />
        </ResizeHandle>

        <CSSTransitionGroup
          component="div"
          transitionName={{
            leave: styles.leave,
            leaveActive: styles.leaveActive,
          }}
          transitionEnter={false}
          transitionLeave
          transitionLeaveTimeout={500}
        >
          {(showInputArea && (
          <div
            ref={(c) => { this.commandsInput = c; }}
            className={styles.commandsInput}
            style={{ ...{ height: (inputAreaHeight && `${inputAreaHeight}px`) || '' } }}
          >
            <Icon glyph="input" className={styles.commandsInputIcon} />
            <ConsoleInput
              preserveInputAfterSend={preserveInput}
              onSend={executeCommand}
              onClear={clear}
            />
          </div>
          )) || null}
        </CSSTransitionGroup>

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

          <Label><Icon glyph={(isConnected && 'connected') || 'disconnected'} /></Label>
          <Separator className={styles.smallSeparator} />
          <Label>{(isConnected && 'Connected') || 'Disconnected' }</Label>

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
