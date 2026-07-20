import React, { forwardRef, useCallback, useState } from 'react';

export interface HotspotItem {
  /** Stable id. In quiz mode this is compared against `targetId`. */
  id: string;
  /** Accessible name for the region (announced to screen readers). */
  label: string;
  /**
   * The clickable shape - a `CircleHotspot` / `RectHotspot` / `EllipseHotspot`
   * / `PolygonHotspot`, or any custom SVG node carrying `hotspots__shape`.
   */
  shape: React.ReactNode;
  disabled?: boolean;
}

export interface HotspotsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect'
> {
  /** Background layer: an image `src` string, or any node (component, `<svg>`). */
  background: React.ReactNode;
  /** Alt text used when `background` is an image `src` string. */
  backgroundAlt?: string;
  /** Coordinate space width - hotspot geometry is expressed against this. */
  width: number;
  /** Coordinate space height. Also sets the container aspect ratio. */
  height: number;
  /** Clickable regions overlaid on the background. */
  hotspots: HotspotItem[];
  /** Quiz mode: the id of the correct hotspot. Omit for free selection. */
  targetId?: string;
  /** Instruction shown above the image (quiz mode). */
  prompt?: React.ReactNode;
  /** Reveal a hint naming the target after this many wrong attempts. Default `3`. */
  hintAfter?: number;
  /** Controlled selection. Omit for uncontrolled. */
  selectedId?: string | null;
  /** Lock the whole widget. */
  disabled?: boolean;
  /** Fires on every pick with the chosen hotspot id. */
  onSelect?: (id: string) => void;
  /** Quiz mode: fires when the target is picked. */
  onCorrect?: (id: string) => void;
  /** Quiz mode: fires when a non-target is picked. */
  onIncorrect?: (id: string) => void;
}

export const Hotspots = forwardRef<HTMLDivElement, HotspotsProps>(
  (
    {
      background,
      backgroundAlt = '',
      width,
      height,
      hotspots,
      targetId,
      prompt,
      hintAfter = 3,
      selectedId,
      disabled = false,
      onSelect,
      onCorrect,
      onIncorrect,
      className = '',
      style,
      ...rest
    },
    ref
  ) => {
    const isControlled = selectedId !== undefined;
    const [internal, setInternal] = useState<string | null>(null);
    const [attempts, setAttempts] = useState(0);
    const [announcement, setAnnouncement] = useState('');
    const selected = isControlled ? selectedId : internal;

    const isQuiz = targetId !== undefined;
    const correct = isQuiz && selected != null && selected === targetId;
    const wrong = isQuiz && selected != null && selected !== targetId;
    const targetLabel = hotspots.find(h => h.id === targetId)?.label;

    const handlePick = useCallback(
      (item: HotspotItem) => {
        if (disabled || item.disabled) return;
        if (!isControlled) setInternal(item.id);
        setAttempts(a => a + 1);
        onSelect?.(item.id);
        if (isQuiz) {
          if (item.id === targetId) {
            setAnnouncement(`Correct: ${item.label}`);
            onCorrect?.(item.id);
          } else {
            setAnnouncement('Not quite - try again');
            onIncorrect?.(item.id);
          }
        } else {
          setAnnouncement(`Selected: ${item.label}`);
        }
      },
      [
        disabled,
        isControlled,
        isQuiz,
        targetId,
        onSelect,
        onCorrect,
        onIncorrect
      ]
    );

    const hotspotState = (item: HotspotItem): string => {
      if (selected !== item.id) return 'idle';
      if (!isQuiz) return 'selected';
      return item.id === targetId ? 'correct' : 'incorrect';
    };

    const classes = ['hotspots', className].filter(Boolean).join(' ');
    const showHint = isQuiz && !correct && attempts >= hintAfter;

    return (
      <div
        ref={ref}
        className={classes}
        aria-disabled={disabled || undefined}
        style={style}
        {...rest}
      >
        {prompt !== undefined && <p className='hotspots__prompt'>{prompt}</p>}
        <div
          className='hotspots__stage'
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          <div className='hotspots__background'>
            {typeof background === 'string' ? (
              <img src={background} alt={backgroundAlt} />
            ) : (
              background
            )}
          </div>
          <svg
            className='hotspots__overlay'
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio='none'
            aria-hidden={hotspots.length === 0 || undefined}
          >
            {hotspots.map(item => {
              const itemDisabled = disabled || item.disabled;
              return (
                <g
                  key={item.id}
                  className='hotspots__hotspot'
                  data-state={hotspotState(item)}
                  data-hotspot-id={item.id}
                  role='button'
                  tabIndex={itemDisabled ? -1 : 0}
                  aria-label={item.label}
                  aria-pressed={selected === item.id}
                  aria-disabled={itemDisabled || undefined}
                  onClick={() => handlePick(item)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePick(item);
                    }
                  }}
                >
                  {item.shape}
                </g>
              );
            })}
          </svg>
        </div>
        <div className='hotspots__status'>
          {correct && (
            <p className='hotspots__feedback hotspots__feedback--correct'>
              ✓ Correct{targetLabel ? ` - ${targetLabel}` : ''}.
            </p>
          )}
          {wrong && (
            <p className='hotspots__feedback hotspots__feedback--incorrect'>
              Not quite. Try again - look for the region in the prompt.
            </p>
          )}
          {showHint && targetLabel && (
            <p className='hotspots__feedback hotspots__feedback--hint'>
              Hint: look for <strong>{targetLabel}</strong>.
            </p>
          )}
        </div>
        <span className='hotspots__sr-status' role='status' aria-live='polite'>
          {announcement}
        </span>
      </div>
    );
  }
);
Hotspots.displayName = 'Hotspots';
