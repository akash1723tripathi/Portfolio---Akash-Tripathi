'use client';

import React, { createContext, useContext, useState } from 'react';
import styles from './chain-of-thought.module.css';

interface ChainOfThoughtContextType {
  openSteps: Record<string, boolean>;
  toggleStep: (id: string) => void;
}

const ChainOfThoughtContext = createContext<ChainOfThoughtContextType | null>(null);

export interface ChainOfThoughtProps {
  children: React.ReactNode;
  className?: string;
}

export const ChainOfThought: React.FC<ChainOfThoughtProps> = ({ children, className }) => {
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => {
    setOpenSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ChainOfThoughtContext.Provider value={{ openSteps, toggleStep }}>
      <div className={`${styles.chainOfThought} ${className || ''}`}>{children}</div>
    </ChainOfThoughtContext.Provider>
  );
};

interface ChainOfThoughtStepContextType {
  stepId: string;
  isOpen: boolean;
  isActive: boolean;
}

const ChainOfThoughtStepContext = createContext<ChainOfThoughtStepContextType | null>(null);

export interface ChainOfThoughtStepProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  id?: string;
  isActive?: boolean;
}

export const ChainOfThoughtStep: React.FC<ChainOfThoughtStepProps> = ({
  children,
  defaultOpen = false,
  id,
  isActive = false,
}) => {
  const generatedId = React.useId();
  const stepId = id || generatedId;
  const context = useContext(ChainOfThoughtContext);

  const isOpen = context ? context.openSteps[stepId] ?? defaultOpen : defaultOpen;

  return (
    <ChainOfThoughtStepContext.Provider value={{ stepId, isOpen, isActive }}>
      <div className={`${styles.step} ${isActive ? styles.stepActive : ''}`}>{children}</div>
    </ChainOfThoughtStepContext.Provider>
  );
};

export interface ChainOfThoughtTriggerProps {
  children: React.ReactNode;
}

export const ChainOfThoughtTrigger: React.FC<ChainOfThoughtTriggerProps> = ({
  children,
}) => {

  const cotContext = useContext(ChainOfThoughtContext);
  const stepContext = useContext(ChainOfThoughtStepContext);

  if (!stepContext) return null;

  const { stepId, isOpen, isActive } = stepContext;

  const handleClick = () => {
    if (cotContext) {
      cotContext.toggleStep(stepId);
    }
  };

  return (
    <button type="button" className={styles.trigger} onClick={handleClick}>
      <div className={styles.triggerLeft}>
        <span>{children}</span>
      </div>
      <svg
        className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );

};

export interface ChainOfThoughtContentProps {
  children: React.ReactNode;
}

export const ChainOfThoughtContent: React.FC<ChainOfThoughtContentProps> = ({ children }) => {
  const stepContext = useContext(ChainOfThoughtStepContext);

  if (!stepContext || !stepContext.isOpen) return null;

  return <div className={styles.content}>{children}</div>;
};

export interface ChainOfThoughtItemProps {
  children: React.ReactNode;
}

export const ChainOfThoughtItem: React.FC<ChainOfThoughtItemProps> = ({ children }) => {
  return <div className={styles.item}>{children}</div>;
};
