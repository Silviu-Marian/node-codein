import React, { PropTypes } from 'react';
import c from 'classnames';

import styles from './Label.scss';

export default function Label({ className, children, theme, ...restProps }) {
  return (
    <div
      className={c(className, styles.label, theme.Label)}
      {...restProps}
    >
      {children}
    </div>
  );
}

Label.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  theme: PropTypes.shape({
    Label: PropTypes.string,
  }),
};
