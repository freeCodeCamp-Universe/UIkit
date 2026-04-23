import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';

export type TextareaVariant = 'default' | 'mono';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: TextareaVariant;
  invalid?: boolean;
  autoResize?: boolean;
}

function fit(el: HTMLTextAreaElement | null): void {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className = '',
      variant = 'default',
      invalid,
      autoResize,
      onInput,
      ...rest
    },
    ref
  ) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);
    useEffect(() => {
      if (!autoResize) return;
      fit(innerRef.current);
    }, [autoResize, rest.value, rest.defaultValue]);
    const classes = [
      'textarea',
      variant !== 'default' && `textarea--${variant}`,
      className
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <textarea
        ref={innerRef}
        className={classes}
        aria-invalid={invalid || undefined}
        data-auto-resize={autoResize ? 'true' : undefined}
        onInput={e => {
          if (autoResize) fit(e.currentTarget);
          onInput?.(e);
        }}
        {...rest}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
