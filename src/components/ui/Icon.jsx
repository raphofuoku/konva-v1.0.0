export default function Icon({ name, size, className = '', style, ...rest }) {
    return (
      <span
        className={`k-icon ${className}`.trim()}
        aria-hidden="true"
        style={size ? { fontSize: size, ...style } : style}
        {...rest}
      >
        {name}
      </span>
    );
  }