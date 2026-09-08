'use client';

import React from 'react';
import styles from './button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
    const variantClass =
      variant === 'outline'
        ? styles.variantOutline
        : variant === 'ghost'
        ? styles.variantGhost
        : styles.variantDefault;

    const sizeClass =
      size === 'sm'
        ? styles.sizeSm
        : size === 'lg'
        ? styles.sizeLg
        : size === 'icon'
        ? styles.sizeIcon
        : styles.sizeDefault;

    return (
      <button
        ref={ref}
        type="button"
        className={`${styles.button} ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
