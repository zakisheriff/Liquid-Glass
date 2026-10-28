/**
 * Best-effort haptic tick for the web.
 *
 * Android: Vibration API. iOS Safari 18+: toggling a native `<input switch>`
 * through its label fires the system selection haptic, so we keep one hidden.
 */
let label: HTMLLabelElement | null = null;

const isIOS = () =>
  typeof navigator !== 'undefined' &&
  (/iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

export function haptic(): void {
  if (typeof window === 'undefined') return;
  try {
    if (typeof navigator.vibrate === 'function' && !isIOS()) {
      navigator.vibrate(8);
      return;
    }
    if (!isIOS()) return;
    if (!label?.isConnected) {
      label = document.createElement('label');
      label.setAttribute('aria-hidden', 'true');
      label.style.cssText = 'position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9px;top:-9px';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      input.tabIndex = -1;
      label.append(input);
      document.body.append(label);
    }
    label.click();
  } catch {
    /* haptics are a nicety */
  }
}
