import React from 'react';

export interface FormStepperStep {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
}

type StepState = 'complete' | 'current' | 'upcoming';

export interface FormStepperProps {
  steps: readonly FormStepperStep[];
  current: string;
  onStepChange: (id: string) => void;
  children?: (step: FormStepperStep) => React.ReactNode;
  className?: string;
  /** Override step gating. Defaults to array-index comparison. */
  isStepAccessible?: (step: FormStepperStep, state: StepState) => boolean;
  ariaLabel?: string;
}

export const FormStepper = ({
  steps,
  current,
  onStepChange,
  children,
  className = '',
  isStepAccessible,
  ariaLabel = 'Progress'
}: FormStepperProps): React.ReactElement => {
  const currentIndex = Math.max(
    0,
    steps.findIndex(s => s.id === current)
  );
  const resolved = steps[currentIndex] ?? steps[0];
  const classes = ['form-stepper', className].filter(Boolean).join(' ');
  const stateAt = (i: number): StepState => {
    if (i < currentIndex) return 'complete';
    if (i === currentIndex) return 'current';
    return 'upcoming';
  };
  const accessible = (step: FormStepperStep, state: StepState): boolean => {
    if (isStepAccessible) return isStepAccessible(step, state);
    // Default: complete + current are navigable; upcoming gated.
    return state !== 'upcoming';
  };

  return (
    <div className={classes}>
      <ol className='form-stepper__progress' aria-label={ariaLabel}>
        {steps.map((step, i) => {
          const state = stateAt(i);
          const canJump = accessible(step, state);
          return (
            <li key={step.id} className='form-stepper__step' data-state={state}>
              <button
                type='button'
                className='form-stepper__step-btn'
                aria-current={state === 'current' ? 'step' : undefined}
                disabled={!canJump}
                onClick={() => onStepChange(step.id)}
              >
                <span className='form-stepper__step-index' aria-hidden='true'>
                  {i + 1}
                </span>
                <span className='form-stepper__step-text'>
                  <span className='form-stepper__step-label'>{step.label}</span>
                  {step.description !== undefined && (
                    <span className='form-stepper__step-description'>
                      {step.description}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {resolved !== undefined && (
        <div className='form-stepper__body'>{children?.(resolved)}</div>
      )}
    </div>
  );
};
FormStepper.displayName = 'FormStepper';
