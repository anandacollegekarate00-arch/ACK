/**
 * Input Component
 * Modern input field with variants, icons, and states
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import './Input.css';

const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      placeholder,
      value,
      onChange,
      onFocus,
      onBlur,
      error,
      helperText,
      disabled = false,
      required = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      variant = 'default',
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = (e) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const baseClass = 'input';
    const variantClass = `input--${variant}`;
    const sizeClass = `input--${size}`;
    const errorClass = error ? 'input--error' : '';
    const disabledClass = disabled ? 'input--disabled' : '';
    const focusedClass = isFocused ? 'input--focused' : '';
    const fullWidthClass = fullWidth ? 'input--full' : '';

    const wrapperClasses = [
      `${baseClass}-wrapper`,
      variantClass,
      sizeClass,
      errorClass,
      disabledClass,
      focusedClass,
      fullWidthClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [
      `${baseClass}-field`,
      leftIcon ? 'input-field--has-left-icon' : '',
      rightIcon ? 'input-field--has-right-icon' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="input-container">
        {label && (
          <label className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}

        <motion.div
          className={wrapperClasses}
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {leftIcon && <span className="input-icon input-icon--left">{leftIcon}</span>}

          <input
            ref={ref}
            type={type}
            className={inputClasses}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            {...props}
          />

          {rightIcon && <span className="input-icon input-icon--right">{rightIcon}</span>}
        </motion.div>

        {(error || helperText) && <div className={`input-helper ${error ? 'input-helper--error' : ''}`}>{error || helperText}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea variant
export const Textarea = forwardRef(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      onFocus,
      onBlur,
      error,
      helperText,
      disabled = false,
      required = false,
      rows = 4,
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = (e) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const wrapperClasses = [
      'input-wrapper',
      'input-wrapper--textarea',
      error ? 'input--error' : '',
      disabled ? 'input--disabled' : '',
      isFocused ? 'input--focused' : '',
      fullWidth ? 'input--full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="input-container">
        {label && (
          <label className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}

        <motion.div
          className={wrapperClasses}
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <textarea
            ref={ref}
            className="input-field input-field--textarea"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            rows={rows}
            {...props}
          />
        </motion.div>

        {(error || helperText) && <div className={`input-helper ${error ? 'input-helper--error' : ''}`}>{error || helperText}</div>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
