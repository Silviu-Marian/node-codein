import React, { PropTypes, Component } from 'react';

import Primitive from './Primitive';

import styles from './ObjectVal.scss';

/**
 * Renders Primitive-ish values
 */
export default class ObjectVal extends Component {

  static propTypes = {
    data: PropTypes.shape,
    expand: PropTypes.bool,
  };

  static defaultProps = {
    expand: false,
  }

  constructor(...params) {
    super(...params);
    this.state = {
      expanded: {},
    };
    this.toggleExpanded = ::this.toggleExpanded;
  }

  toggleExpanded(keyName = '') {
    this.setState({
      expanded: {
        ...this.state.expanded,
        [keyName]: !this.state.expanded[keyName],
      },
    });
  }

  render() {
    const { data, expand } = this.props;
    return (
      <ul className={styles.object}>
        {
          Object.keys(data.value)
            .sort()
            .map(key => ({ keyName: key, ...data.value.value[key] }))
            .map((item) => {
              const { type, value, keyName } = item;
              if (
                type !== 'object' ||
                (type === 'object' && value === null) ||
                (type === 'object' && typeof value !== 'object') ||
                (type === 'object' && typeof value === 'undefined')
              ) {
                return (
                  <li className={styles.primitiveRow}>
                    <Primitive nl2br data={item} />
                  </li>
                );
              }

              return (
                <li className={styles.object}>
                  <button onClick={() => this.toggleExpanded(keyName)}>{'>'}</button>
                  <span>{keyName}</span>
                  {(expand && (
                    <ObjectVal data={item} expand={this.state.expanded[keyName]} />
                  )) || null}
                </li>
              );
            })
        }
      </ul>
    );
  }
}
