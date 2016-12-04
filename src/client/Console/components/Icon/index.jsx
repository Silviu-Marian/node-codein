import React, { PropTypes } from 'react';
import styles from './index.scss';

export default function Icon({ glyph }) {
  return (
    <span className={styles.Icon}>
      {Icon.glyphs[glyph]}
    </span>
  );
}

Icon.glyphs = {
  console: '_',
  clear: '×',
  expand: '³',
  highlight: 'p',
  unlock: 'w',
  lock: 'x',
  refresh: 'V',
  duplicate: 'D',
  code: 'H',
  twitter: 't',
  connected: '~',
  disconnected: '×',
  input: '>',
};

Icon.propTypes = {
  glyph: PropTypes.oneOf(Object.keys(Icon.glyphs)),
};
