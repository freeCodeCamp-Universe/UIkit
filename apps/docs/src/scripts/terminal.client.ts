const lines: string[] = [
  'camp@fcc:~$ curl design.freecodecamp.org/components/button.md',
  '→ install steps + full source (Button.tsx, button.css)',
  'camp@fcc:~$ cp Button.tsx button.css src/ui/button/',
  'camp@fcc:~$ open playground',
  '→ opening https://design.freecodecamp.org/playground'
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
