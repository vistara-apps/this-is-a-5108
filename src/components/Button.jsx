import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  disabled = false,
  ...props 
}) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "button-primary",
    secondary: "button-secondary",
    icon: "p-2 rounded-lg hover:bg-white/10 transition-colors"
  };

  const sizes = {
    sm: "py-2 px-3 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg"
  };

  const classes = `${baseClasses} ${variants[variant]} ${variant !== 'icon' ? sizes[size] : ''} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;