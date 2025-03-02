import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'bland';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  loading?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onClick,
  children,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  icon,
  loading = false,
}) => {
  // Base styles for button
  const baseStyles = "font-normal rounded-lg flex items-center justify-center transition-colors";
  
  // Variant styles
  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-blue-950 hover:bg-blue-900 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    bland: "bg-white hover:text-blue-700 text-blue-600",
  };
  
  // Size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
  
  // Disabled styles
  const disabledStyles = disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer";
  
  // Combine all styles
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`;

  return (
    <motion.button
      type={type}
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      initial={{ opacity: 0.9 }}
      animate={{ 
        opacity: 1,
        transition: { duration: 0.2 }
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <motion.div
            className="h-4 w-4 rounded-full border-2 border-t-transparent border-white"
            animate={{ rotate: 360 }}
            transition={{ 
              repeat: Infinity, 
              duration: 1, 
              ease: "linear" 
            }}
          />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span className='font-semibold tracking-tight'>{children}</span>
          {icon && <span>{icon}</span>}
        </div>
      )}
    </motion.button>
  );
};

export default AnimatedButton;