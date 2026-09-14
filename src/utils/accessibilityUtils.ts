/**
 * Accessibility helper for screen reader announcements.
 */
export function announceToScreenReader(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
  const existingRegion = document.getElementById('sr-announcer');
  if (existingRegion) {
    existingRegion.setAttribute('aria-live', politeness);
    existingRegion.textContent = message;
    return;
  }

  const liveRegion = document.createElement('div');
  liveRegion.id = 'sr-announcer';
  liveRegion.className = 'sr-only';
  liveRegion.setAttribute('aria-live', politeness);
  liveRegion.setAttribute('role', 'status');
  liveRegion.textContent = message;
  document.body.appendChild(liveRegion);
}
