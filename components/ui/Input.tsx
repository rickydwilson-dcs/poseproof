import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, type = 'text', id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-text-secondary ml-1"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-pink transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={cn(
              // Base styles - Instagram inspired
              'flex h-12 w-full bg-surface dark:bg-surface-secondary text-base text-text transition-all duration-200 ease-out',
              // Border radius - 12px for inputs
              'rounded-[12px]',
              // Borders
              'border',
              hasError
                ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
                : 'border-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink',
              // Padding
              leftIcon ? 'pl-11 pr-4' : 'px-4',
              rightIcon && 'pr-11',
              // Placeholder
              'placeholder:text-text-tertiary',
              // Focus
              'focus:outline-none',
              // Disabled
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-pink transition-colors">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-error ml-1"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
