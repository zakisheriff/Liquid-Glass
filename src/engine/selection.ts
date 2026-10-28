/**
 * Holding or dragging a control must never select text. iOS starts a
 * selection from a long press and happily extends it into a neighbouring
 * label, so while a gesture that began on `el` is down, any new selection is
 * cancelled and a stray one is cleared. Returns a cleanup function.
 */
export function guardSelection(el: HTMLElement): () => void {
  let held = false;
  const block = (event: Event) => {
    if (held) event.preventDefault();
  };
  const clear = () => {
    const selection = window.getSelection?.();
    if (selection && !selection.isCollapsed) selection.removeAllRanges();
  };
  const down = () => {
    held = true;
    clear();
  };
  const up = () => {
    if (!held) return;
    held = false;
    clear();
  };
  el.addEventListener('pointerdown', down, true);
  document.addEventListener('selectstart', block, true);
  window.addEventListener('pointerup', up, true);
  window.addEventListener('pointercancel', up, true);
  return () => {
    el.removeEventListener('pointerdown', down, true);
    document.removeEventListener('selectstart', block, true);
    window.removeEventListener('pointerup', up, true);
    window.removeEventListener('pointercancel', up, true);
  };
}
