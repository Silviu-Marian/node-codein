import React, { PropTypes } from 'react';

import styles from './Primitive.scss';

/**
 * Renders Primitive-ish values
 */
const tabs = '  '.replace(/ /g, '\u00a0');
export default function Primitive({ data, nl2br = false }) {
  const { value, type, reference, ctor } = (
    (data && data.type && data) ||
    ({ value: data, type: typeof data })
  );
  switch (true) {
    // circular
    case type === 'object' && reference && typeof value === 'undefined':
      return <span className={styles.circularRef}>(circular reference)</span>;
    case value === null:
    case value === undefined:
      return <span className={styles.undefined}>{String(value)}</span>;
    case type === 'boolean':
      return <span className={styles.boolean}>{Boolean(value)}</span>;
    case type === 'number':
      return <span className={styles.number}>{Number(value)}</span>;
    case type === 'sybmol':
      return <span className={styles.symbol}>{String(value)}</span>;
    case type === 'string':
    case type === 'function': {
      const body = (nl2br && value
        .replace(/\t/gmi, tabs)
        .replace(/\r\n/gmi, '\n')
        .replace(/\r/gmi, '\n')
        .split(/\n/gmi)
        .reduce((accum, item) => [...accum, item, <br />], [])
      ) || value;

      if (type === 'string') {
        return <span className={styles.string} nl2br={nl2br}>{body}</span>;
      }

      return <span className={styles.function} nl2br={nl2br}>{body}</span>;
    }
    case type === 'object':
    default:
      switch (ctor) {
        case 'Date':
        case 'RegExp':
          return <span className={styles.other}>${value}</span>;
        default:
          return <span className={styles.object}>{JSON.stringify(value)}</span>;
      }
  }
}

Primitive.propTypes = {
  data: PropTypes.shape({}),
  nl2br: PropTypes.bool,
};
