import React from 'react';

const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  onClick,
  ...props 
}) => {
  const baseClasses = "rounded-lg p-4 sm:p-6 transition-all duration-200";
  
  const variants = {
    default: "card-gradient",
    interactive: "card-gradient hover:bg-white/20 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  if (onClick) {
    return (
      <button
        className={classes}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;