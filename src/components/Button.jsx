const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

export default function Button({
  variant = 'secondary',
  size,
  icon: Icon,
  children,
  className = '',
  ...props
}) {
  const iconOnly = !children;
  return (
    <button
      className={[
        'btn',
        VARIANTS[variant],
        size === 'sm' ? 'btn-sm' : '',
        iconOnly ? 'btn-icon' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {Icon && <Icon className={children ? 'text-[15px]' : 'text-[16px]'} />}
      {children}
    </button>
  );
}
