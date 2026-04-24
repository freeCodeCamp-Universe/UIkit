// Terminal typewriter for the landing hero. Types a short script
// character-by-character with a rAF-driven clock so the effect feels
// native to the page (no library, no setInterval drift). Respects
// prefers-reduced-motion by painting the whole script at once.

const lines: string[] = [
  'camp@fcc:~$ pnpm add @freecodecamp/uikit',
  '+ @freecodecamp/uikit 0.1.0',
  '+ @freecodecamp/uikit-css 0.1.0',
  'camp@fcc:~$ open components',
  '→ opening https://fcc-uikit.netlify.app/components/button'
];

const script: string = lines.join('\n');

function render(body: HTMLElement, instant: boolean): void {
  if (instant) {
    body.textContent = script;
    return;
  }
  const charsPerSecond = 55;
  const msPerChar = 1000 / charsPerSecond;
  let start: number | null = null;
  let last = 0;

  const step = (now: number): void => {
    if (start === null) start = now;
    const elapsed = now - start;
    const chars = Math.min(script.length, Math.floor(elapsed / msPerChar));
    if (chars !== last) {
      body.textContent = script.slice(0, chars);
      last = chars;
    }
    if (chars < script.length) {
      requestAnimationFrame(step);
    }
  };
  requestAnimationFrame(step);
}

const body = document.querySelector<HTMLElement>('[data-terminal-body]');
if (body) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  render(body, reduced);
}
