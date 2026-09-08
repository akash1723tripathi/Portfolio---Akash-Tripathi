'use client';

import React, { createContext, useContext, useRef, useEffect } from 'react';
import styles from './prompt-input.module.css';

interface PromptInputContextType {
  value: string;
  onValueChange: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const PromptInputContext = createContext<PromptInputContextType | null>(null);

export interface PromptInputProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (val: string) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  children,
  value = '',
  onValueChange = () => {},
  onSubmit = () => {},
  isLoading = false,
  disabled = false,
  className = '',
}) => {
  return (
    <PromptInputContext.Provider
      value={{
        value,
        onValueChange,
        onSubmit,
        isLoading,
        disabled,
      }}
    >
      <div
        className={`${styles.promptInput} ${disabled ? styles.promptInputDisabled : ''} ${className}`}
      >
        {children}
      </div>
    </PromptInputContext.Provider>
  );
};

export interface PromptInputTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const PromptInputTextarea: React.FC<PromptInputTextareaProps> = ({
  placeholder = 'Ask Ollie anything about Akash...',
  className = '',
  disabled: externalDisabled,
  ...props
}) => {
  const context = useContext(PromptInputContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const value = context?.value ?? (props.defaultValue as string) ?? '';
  const isLoading = context?.isLoading ?? false;
  const disabled = externalDisabled ?? context?.disabled ?? false;

  // Auto-resize height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim() && !disabled) {
        context?.onSubmit();
      }
    }
  };

  return (
    <textarea
      ref={textareaRef}
      className={`${styles.textarea} ${className}`}
      value={value}
      onChange={(e) => context?.onValueChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      {...props}
    />
  );
};

export interface PromptInputActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const PromptInputActions: React.FC<PromptInputActionsProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`${styles.actions} ${styles.actionsEnd} ${className}`}>
      {children}
    </div>
  );
};

export interface PromptInputActionProps {
  children: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export const PromptInputAction: React.FC<PromptInputActionProps> = ({
  children,
  tooltip,
  className = '',
}) => {
  return (
    <div className={`${styles.actionItem} ${className}`}>
      {children}
      {tooltip && <span className={styles.tooltip}>{tooltip}</span>}
    </div>
  );
};
