import React, { PropTypes, Children, cloneElement } from 'react';
import cn from 'classnames';

import styles from './index.scss';

export default function Toolbar({ className, theme, children, ...restProps }) {
  return (
    <div
      className={cn(className, styles.toolbar, theme.Toolbar)}
      {...restProps}
    >
      {Children.map(children, child => cloneElement(child, { theme }))}
    </div>
  );
}

Toolbar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  theme: PropTypes.shape({
    Toolbar: PropTypes.string,
  }),
};

Toolbar.defaultProps = {
  theme: {},
};

export function Separator({ className }) {
  return (
    <span className={cn(className, styles.separator)} />
  );
}

Separator.propTypes = {
  className: PropTypes.string,
};

export Button from './Button';
export Switch from './Switch';
export Label from './Label';
