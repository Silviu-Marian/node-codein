import React, { Component, PropTypes } from 'react';
import cn from 'classnames';

import Primitive from './Primitive';
import ObjectVal from './ObjectVal';

import styles from './index.scss';

/**
 * Console Output class
 */
export default class ConsoleOutput extends Component {
  static propTypes = {
    className: PropTypes.string,
    commands: PropTypes.arrayOf(PropTypes.shape({})),
    autoExpand: PropTypes.bool,
    theme: PropTypes.shape({}),
  }

  static defaultProps = {
    commands: [],
  }

  componentDidMount() {
    this.scrollToLatest();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.commands.length !== this.props.commands.length) {
      this.scrollToLatest();
    }
  }

  scrollToLatest() {
    this.viewer.scrollTop = this.viewer.scrollHeight;
    this.viewer.scrollLeft = 0;
  }

  render() {
    const { className, commands, autoExpand, theme } = this.props;
    return (
      <div
        className={cn(styles.consoleOutput, className, theme.consoleOutput)}
        ref={(c) => { this.viewer = c; }}
      >
        {
          commands
            .map(({ type, message, messageType }, key) => {
              switch (type) {
                case 'notification': {
                  return <div key={key}><span>{messageType || 'error'}</span> {message}</div>;
                }
                case 'message': {
                  return <ConsoleRow key={key} data={message} expand={autoExpand} />;
                }
                case 'input':
                  return <div key={key}><span>{'>>>> '}</span> {message}</div>;
                default:
                  return null;
              }
            })
        }
      </div>
    );
  }
}


/**
 * Console Row
 */
export function ConsoleRow({ data, expand }) {
  // Force Value Format
  if (typeof data !== 'object' || data === null) {
    return <Primitive nl2br data={data} />;
  }

  // Decision Point
  const object = data;
  switch (object.type) {
    case 'object': {
      const keyInUse = `[object ${object.ctor || 'Object'}]`;
      object.key = keyInUse;
      const newObject = {
        ctor: object.ctor,
        type: object.type,
        value: { },
      };
      newObject.value[keyInUse] = object;
      return <ObjectVal expand={expand} data={newObject} />;
    }
    default:
      return <Primitive nl2br data={object} />;
  }
}

ConsoleRow.propTypes = {
  data: PropTypes.any.isRequired, // eslint-disable-line
  expand: PropTypes.bool,
};
