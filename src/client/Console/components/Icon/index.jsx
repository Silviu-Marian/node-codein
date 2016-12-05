import React, { PropTypes } from 'react';
import cn from 'classnames';
import styles from './index.scss';

export default function Icon({ glyph, className }) {
  return (
    <span className={cn(styles.Icon, className)}>
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
  className: PropTypes.string,
};
