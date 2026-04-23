import React, { forwardRef } from 'react';

type CommonProps = {
  className?: string;
  invalid?: boolean;
};

type InputBased = CommonProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'as'> & {
    as?: 'input';
  };

type TextareaBased = CommonProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'as'> & {
    as: 'textarea';
  };

export type FormControlProps = InputBased | TextareaBased;

export const FormControl = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormControlProps
>((props, ref) => {
  const {
    as = 'input',
    className = '',
    invalid,
    ...rest
  } = props as CommonProps & {
    as?: 'input' | 'textarea';
    [key: string]: unknown;
  };
  const isTextarea = as === 'textarea';
  const classes = ['input', isTextarea && 'input--textarea', className]
    .filter(Boolean)
    .join(' ');
  const ariaInvalid = invalid || undefined;
  if (isTextarea) {
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        className={classes}
        aria-invalid={ariaInvalid}
        {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  }
  return (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      className={classes}
      aria-invalid={ariaInvalid}
      {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
    />
  );
});
FormControl.displayName = 'FormControl';
