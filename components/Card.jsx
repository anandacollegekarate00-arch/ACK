/**
 * Card Component
 * iOS-inspired card with elevation levels and variants
 */

import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

const Card = ({
  children,
  variant = 'elevated',
  padding = 'md',
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  style,
  ...props
}) => {
  const baseClass = 'card';
  const variantClass = `card--${variant}`;
  const paddingClass = `card--padding-${padding}`;
  const hoverableClass = hoverable ? 'card--hoverable' : '';
  const clickableClass = clickable || onClick ? 'card--clickable' : '';

  const classes = [baseClass, variantClass, paddingClass, hoverableClass, clickableClass, className].filter(Boolean).join(' ');

  const motionProps =
    hoverable || clickable
      ? {
          whileHover: { y: -4, scale: 1.01 },
          whileTap: { scale: 0.99 },
          transition: { type: 'spring', stiffness: 300, damping: 20 },
        }
      : {};

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component className={classes} onClick={onClick} style={style} {...motionProps} {...props}>
      {children}
    </Component>
  );
};

// Card Header
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card__header ${className}`} {...props}>
    {children}
  </div>
);

// Card Body
export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`card__body ${className}`} {...props}>
    {children}
  </div>
);

// Card Footer
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card__footer ${className}`} {...props}>
    {children}
  </div>
);

// Card Title
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`card__title ${className}`} {...props}>
    {children}
  </h3>
);

// Card Description
export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`card__description ${className}`} {...props}>
    {children}
  </p>
);

export default Card;
