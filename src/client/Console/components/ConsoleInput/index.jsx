import React, { Component, PropTypes } from 'react';
import cn from 'classnames';

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/dialog/dialog';

import styles from './index.scss';

export default class ConsoleInput extends Component {
  static propTypes = {
    className: PropTypes.string,
    onClear: PropTypes.func,
    onSend: PropTypes.func,
    preserveInputAfterSend: PropTypes.bool,
  }

  static defaultProps = {
    onClear: () => {},
    onSend: input => input,
  }

  constructor(...props) {
    super(...props);
    this.textarea = null;
    this.cm = null;
  }

  componentDidMount() {
    this.cm = CodeMirror.fromTextArea(this.textarea, {
      lineWrapping: true,
      matchBrackets: true,
      styleActiveLine: true,
      scrollbarStyle: 'null',
    });

    // Ctrl+L Clears The Console
    this.cm.on('keydown', (instance, event) => {
      const { keyCode, ctrlKey } = event;
      if (
        (keyCode === 76 && ctrlKey) || // ctrl+L
        (keyCode === 12) /* 'clear' event */
      ) {
        event.preventDefault();
        this.props.onClear(event);
      }
    });

    // Enter sends the command
    this.cm.on('keydown', (instance, event) => {
      const { keyCode, altKey, ctrlKey, shiftKey } = event;
      const input = this.cm.getValue().trim();
      if (
        (keyCode === 10 || keyCode === 13) &&
        !altKey && !shiftKey && !ctrlKey &&
        input && input.length
      ) {
        const { onSend, preserveInputAfterSend } = this.props;
        event.preventDefault();
        onSend(input);
        if (!preserveInputAfterSend) {
          this.cm.setValue('');
        }
      }
    });

    // Focus
    this.cm.focus();
  }

  componentWillUnmount() {
    this.cm.toTextArea();
  }

  render() {
    const { className } = this.props;
    return (
      <div className={cn(className, styles.ConsoleInput)}>
        <textarea
          ref={(c) => { this.textarea = c; }}
        />
      </div>
    );
  }
}
