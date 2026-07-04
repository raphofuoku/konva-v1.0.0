import React from 'react';
import './Button.css';

const Button = React.forwardRef(function Button(
  { variant = 'primary', className = '', children, ...props },
  ref
) {
  const classes = ['btn', `btn-${variant}`, className].filter(Boolean).join(' ');
  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});

export default Button;