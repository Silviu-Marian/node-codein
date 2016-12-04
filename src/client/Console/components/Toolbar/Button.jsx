import React, { PropTypes } from 'react';
import c from 'classnames';

import styles from './Button.scss';

export default function Button({
  className,
  theme,
  active,
  onClick,
  href,
  rel,
  children,
  ...restProps
}) {
  const TagName = (href && 'a') || 'button';
  return (
    <TagName
      onClick={onClick}
      href={href}
      rel={href && c(rel, 'noopener', 'noreferrer')}
      className={c(className, {
        [styles.button]: true,
        [theme.Button]: true,
        [styles.active]: active,
        [theme.ActiveButton]: active,
      })}
      {...restProps}
    >
      {children}
    </TagName>
  );
}

Button.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
  href: PropTypes.string,
  rel: PropTypes.string,
  active: PropTypes.bool,
  theme: PropTypes.shape({
    Button: PropTypes.string,
    ActiveButton: PropTypes.string,
  }),
};
