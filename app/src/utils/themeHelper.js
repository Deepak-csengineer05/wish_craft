/**
 * Helper to dynamically inject CSS variables based on a base HSL hue.
 * Regenerates the entire shade range to customize themes dynamically.
 * @param {number} hue - The HSL hue value (0 - 360)
 */
export function applyTheme(hue) {
  if (typeof hue !== 'number' || isNaN(hue)) {
    hue = 198; // Default Teal-Blue
  }

  const root = document.documentElement;

  // Base theme colors matching index.css structure
  root.style.setProperty('--theme-hue', hue);
  root.style.setProperty('--deep-black', `hsl(${hue}, 70%, 5%)`);
  root.style.setProperty('--deep-violet', `hsl(${hue}, 70%, 9%)`);
  root.style.setProperty('--violet-dark', `hsl(${hue}, 70%, 15%)`);
  root.style.setProperty('--violet', `hsl(${hue}, 60%, 26%)`);
  root.style.setProperty('--violet-mid', `hsl(${hue}, 56%, 40%)`);
  root.style.setProperty('--violet-soft', `hsl(${hue}, 50%, 55%)`);
  root.style.setProperty('--violet-light', `hsl(${hue}, 50%, 75%)`);
  root.style.setProperty('--violet-glow', `hsla(${hue}, 70%, 55%, 0.35)`);

  // Accent Gradients matching index.css structure
  root.style.setProperty(
    '--grad-violet',
    `linear-gradient(135deg, hsl(${hue}, 70%, 12%) 0%, hsl(${hue}, 60%, 25%) 50%, hsl(${hue}, 56%, 42%) 100%)`
  );
  root.style.setProperty(
    '--grad-violet-glow',
    `linear-gradient(135deg, hsl(${hue}, 60%, 25%) 0%, hsl(${hue}, 50%, 55%) 100%)`
  );
  root.style.setProperty(
    '--grad-violet-text',
    `linear-gradient(135deg, hsl(${hue}, 50%, 78%), hsl(${hue}, 50%, 58%), hsl(${hue}, 50%, 88%))`
  );
}
