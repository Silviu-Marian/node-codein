import React, { PropTypes } from 'react';
import c from 'classnames';

import styles from './Switch.scss';

export default function Switch({ className, active, onClick, theme, children, ...restProps }) {
  return (
    <button
      onClick={onClick}
      className={c(className, {
        [styles.switch]: true,
        [styles.active]: active,
        [theme.Switch]: true,
        [theme.ActiveSwitch]: active,
      })}
      {...restProps}
    >
      {children}
    </button>
  );
}

Switch.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
  active: PropTypes.bool,
  theme: PropTypes.shape({
    Switch: PropTypes.string,
    ActiveSwitch: PropTypes.string,
  }),
};
