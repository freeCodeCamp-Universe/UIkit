import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

export type TileFace =
  | React.ReactNode
  | {
      /** Tile content: text, `<img>`, `<Image>`, an icon — any node. */
      content: React.ReactNode;
      /** Accessible name, used when `content` is non-text (e.g. an image). */
      label?: string;
    };

export interface TileMatcherPair {
  /** Stable pair identity. Two tiles match when their pair `id` is equal. */
  id: string;
  /**
   * One face → duplicated into an identical pair (classic concentration).
   * Two faces → a related pair (e.g. term ↔ definition).
   */
  faces: [TileFace] | [TileFace, TileFace];
}

export interface TileMatcherProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  /** Deck definition. Tile count is `2 × pairs.length`. */
  pairs: TileMatcherPair[];
  /** Fixed column count. Omit for a responsive auto-fit grid. */
  columns?: number;
  /** Flip animation on reveal. `false` swaps faces instantly. Default `true`. */
  animateFlip?: boolean;
  /** Start tiles face-down (memory game). `false` shows every face. Default `true`. */
  faceDown?: boolean;
  /** Delay before a mismatched pair flips back, in ms. Default `900`. */
  mismatchDelay?: number;
  /** Lock the whole board (no flips). */
  disabled?: boolean;
  /** Shuffle the deck. Default `true`. */
  shuffle?: boolean;
  /** Seed for a deterministic shuffle (tests, visual snapshots). */
  seed?: number;
  /** Fires when a pair is matched. */
  onMatch?: (pairId: string, tileIds: [string, string]) => void;
  /** Fires when two flipped tiles do not match. */
  onMismatch?: (tileIds: [string, string]) => void;
  /** Fires once every pair is matched. */
  onComplete?: (stats: { moves: number; matches: number }) => void;
}

interface Tile {
  tileId: string;
  pairId: string;
  content: React.ReactNode;
  label?: string;
}

function isFaceObject(
  face: TileFace
): face is { content: React.ReactNode; label?: string } {
  return (
    typeof face === 'object' &&
    face !== null &&
    !React.isValidElement(face) &&
    !Array.isArray(face) &&
    'content' in face
  );
}

/** Deterministic PRNG (mulberry32) for seeded shuffles. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildDeck(
  pairs: TileMatcherPair[],
  shuffle: boolean,
  seed?: number
): Tile[] {
  const tiles: Tile[] = [];
  for (const pair of pairs) {
    const faces =
      pair.faces.length === 1 ? [pair.faces[0], pair.faces[0]] : pair.faces;
    faces.forEach((face, i) => {
      tiles.push({
        tileId: `${pair.id}#${i}`,
        pairId: pair.id,
        content: isFaceObject(face) ? face.content : face,
        label: isFaceObject(face) ? face.label : undefined
      });
    });
  }
  if (!shuffle) return tiles;
  const rng = seed === undefined ? Math.random : mulberry32(seed);
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = tiles[i] as Tile;
    tiles[i] = tiles[j] as Tile;
    tiles[j] = tmp;
  }
  return tiles;
}

function tileLabel(tile: Tile, revealed: boolean): string {
  if (!revealed) return 'Hidden tile';
  if (tile.label) return tile.label;
  if (typeof tile.content === 'string' || typeof tile.content === 'number') {
    return String(tile.content);
  }
  return 'Tile';
}

export const TileMatcher = forwardRef<HTMLDivElement, TileMatcherProps>(
  (
    {
      pairs,
      columns,
      animateFlip = true,
      faceDown = true,
      mismatchDelay = 900,
      disabled = false,
      shuffle = true,
      seed,
      onMatch,
      onMismatch,
      onComplete,
      className = '',
      style,
      ...rest
    },
    ref
  ) => {
    const deck = useMemo(
      () => buildDeck(pairs, shuffle, seed),
      [pairs, shuffle, seed]
    );

    const [flipped, setFlipped] = useState<string[]>([]);
    const [matched, setMatched] = useState<Set<string>>(new Set());
    const [moves, setMoves] = useState(0);
    const [locked, setLocked] = useState(false);
    const [announcement, setAnnouncement] = useState('');

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(
      () => () => {
        if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      },
      []
    );

    const completedRef = useRef(false);
    useEffect(() => {
      if (
        pairs.length > 0 &&
        matched.size === pairs.length &&
        !completedRef.current
      ) {
        completedRef.current = true;
        setAnnouncement('Board complete');
        onComplete?.({ moves, matches: matched.size });
      }
    }, [matched, pairs.length, moves, onComplete]);

    const handleFlip = useCallback(
      (tile: Tile) => {
        if (
          disabled ||
          locked ||
          matched.has(tile.pairId) ||
          flipped.includes(tile.tileId) ||
          flipped.length === 2
        ) {
          return;
        }

        const next = [...flipped, tile.tileId];
        setFlipped(next);
        if (next.length < 2) return;

        setMoves(m => m + 1);
        const [aId, bId] = next as [string, string];
        const a = deck.find(t => t.tileId === aId);
        const b = deck.find(t => t.tileId === bId);

        if (a && b && a.pairId === b.pairId) {
          setMatched(prev => new Set(prev).add(a.pairId));
          setFlipped([]);
          setAnnouncement(`Matched: ${tileLabel(a, true)}`);
          onMatch?.(a.pairId, [aId, bId]);
        } else {
          setLocked(true);
          setAnnouncement('No match');
          onMismatch?.([aId, bId]);
          timeoutRef.current = setTimeout(() => {
            setFlipped([]);
            setLocked(false);
            timeoutRef.current = null;
          }, mismatchDelay);
        }
      },
      [
        deck,
        disabled,
        locked,
        matched,
        flipped,
        mismatchDelay,
        onMatch,
        onMismatch
      ]
    );

    const classes = [
      'tile-matcher',
      !animateFlip && 'tile-matcher--no-flip',
      !faceDown && 'tile-matcher--open',
      className
    ]
      .filter(Boolean)
      .join(' ');

    const gridStyle = columns
      ? ({ '--tm-cols': String(columns) } as React.CSSProperties)
      : undefined;

    return (
      <div
        ref={ref}
        className={classes}
        aria-disabled={disabled || undefined}
        style={style}
        {...rest}
      >
        <div className='tile-matcher__grid' style={gridStyle}>
          {deck.map(tile => {
            const isMatched = matched.has(tile.pairId);
            const isFlipped = flipped.includes(tile.tileId);
            const revealed = !faceDown || isFlipped || isMatched;
            const state = isMatched ? 'matched' : revealed ? 'up' : 'down';
            return (
              <button
                key={tile.tileId}
                type='button'
                className='tile-matcher__tile'
                data-state={state}
                data-pair-id={tile.pairId}
                aria-label={tileLabel(tile, revealed)}
                aria-pressed={isFlipped}
                disabled={disabled || isMatched}
                onClick={() => handleFlip(tile)}
              >
                <span className='tile-matcher__inner'>
                  <span className='tile-matcher__face tile-matcher__face--back'>
                    <span className='tile-matcher__cover' aria-hidden='true' />
                  </span>
                  <span className='tile-matcher__face tile-matcher__face--front'>
                    {tile.content}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <span
          className='tile-matcher__sr-status'
          role='status'
          aria-live='polite'
        >
          {announcement}
        </span>
      </div>
    );
  }
);
TileMatcher.displayName = 'TileMatcher';
