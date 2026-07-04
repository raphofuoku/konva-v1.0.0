import React from 'react';
import './TextField.css';

const TextField = React.forwardRef(function TextField({ className = '', ...props }, ref) {
  return <input ref={ref} className={`text-field ${className}`.trim()} {...props} />;
});

export default TextField;