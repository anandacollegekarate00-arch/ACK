/**
 * Button Component
 * iOS-inspired button with variants and animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const widthClass = fullWidth ? 'btn--full' : '';
  const disabledClass = disabled || loading ? 'btn--disabled' : '';

  const classes = [baseClass, variantClass, sizeClass, widthClass, disabledClass, className].filter(Boolean).join(' ');

  return (
    <motion.button
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {leftIcon && <span className="btn__icon btn__icon--left">{leftIcon}</span>}

      <span className="btn__content">
        {loading ? (
          <span className="btn__spinner">
            <svg className="spinner" viewBox="0 0 24 24">
              <circle className="spinner__track" cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
              <circle className="spinner__path" cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
            </svg>
          </span>
        ) : (
          children
        )}
      </span>

      {rightIcon && <span className="btn__icon btn__icon--right">{rightIcon}</span>}
    </motion.button>
  );
};

export default Button;
