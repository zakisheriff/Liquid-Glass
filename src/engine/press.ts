/**
 * The Liquid Glass touch response: the shape swells under the finger, leans
 * and stretches toward a drag like a droplet held by surface tension, lights
 * up where it's touched, then lets go with a soft jelly wobble.
 */
import { useEffect } from 'react';
import { SPRINGS, createSpring, rubberband, springFrom } from './spring';

/** Finger-following feel: quick but never twitchy. */
const FOLLOW = springFrom(0.2, 0.82);

export interface PressOptions {
  /** Swell on touch as a fraction (0.14 = 14%). Defaults to iOS sizing: small
   *  circles swell ~20%, wide pills ~10%. Mouse presses swell a little less. */
  grow?: number;
  /** How far (px) the shape may lean toward a drag. */
  lean?: number;
  /** Max anisotropic stretch while dragging (0.1 = 10%). */
  stretch?: number;
  disabled?: boolean;
}

export function usePress(ref: React.RefObject<HTMLElement | null>, options: PressOptions = {}) {
  const { grow, lean = 10, stretch = 0.2, disabled = false } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;

    const v = { sx: 1, sy: 1, tx: 0, ty: 0 };
    const paint = () => {
      el.style.scale = `${v.sx} ${v.sy}`;
      el.style.translate = `${v.tx}px ${v.ty}px`;
    };
    const springs = (['sx', 'sy', 'tx', 'ty'] as const).map((key) =>
      createSpring(key[0] === 's' ? 1 : 0, SPRINGS.release, (value) => {
        v[key] = value;
        paint();
      }),
    );
    const to = (targets: number[], feel: typeof SPRINGS.press) =>
      springs.forEach((s, i) => {
        s.tune(feel);
        s.set(targets[i]);
      });

    let pointer: { id: number; x: number; y: number; box: DOMRect; base: number } | null = null;

    const light = (event: PointerEvent, box: DOMRect) => {
      el.style.setProperty('--lg-x', `${((event.clientX - box.left) / box.width) * 100}%`);
      el.style.setProperty('--lg-y', `${((event.clientY - box.top) / box.height) * 100}%`);
    };

    const track = (event: PointerEvent) => {
      if (!pointer) return;
      const { box, base } = pointer;
      light(event, box);
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      const tx = rubberband(dx, lean * 2.2, 0.5);
      const ty = rubberband(dy, lean * 2.2, 0.5);
      const dist = Math.hypot(dx, dy);
      // Surface tension: the drop elongates toward the finger, then saturates.
      // The stretch blends continuously with direction (cos²/sin²), so moving
      // from a sideways drag to a downward one morphs instead of flipping.
      const pull = 1 - 1 / (1 + dist / 55);
      const k = stretch * pull;
      const cx = dist ? (dx / dist) ** 2 : 0;
      const cy = dist ? (dy / dist) ** 2 : 0;
      to([base * (1 + k * cx - k * 0.5 * cy), base * (1 + k * cy - k * 0.5 * cx), tx, ty], FOLLOW);
    };

    const move = (event: PointerEvent) => {
      if (event.pointerId === pointer?.id) track(event);
    };

    const up = (event?: PointerEvent) => {
      if (event && event.pointerId !== pointer?.id) return;
      pointer = null;
      delete el.dataset.pressed;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      to([1, 1, 0, 0], SPRINGS.release);
    };

    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || pointer) return;
      if ((el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') return;
      const box = el.getBoundingClientRect();
      const w = el.offsetWidth || 1;
      const h = el.offsetHeight || 1;
      const natural = Math.min(0.22, Math.max(0.07, 9 / Math.sqrt(w * h)));
      const amount = (grow ?? natural) * (event.pointerType === 'mouse' ? 0.75 : 1);
      const base = 1 + amount;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, box, base };
      el.dataset.pressed = '';
      light(event, box);
      to([base, base, 0, 0], SPRINGS.press);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    };

    const blur = () => up();
    el.addEventListener('pointerdown', down);
    window.addEventListener('blur', blur);
    return () => {
      up();
      springs.forEach((s) => s.stop());
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('blur', blur);
      el.style.removeProperty('scale');
      el.style.removeProperty('translate');
    };
  }, [ref, grow, lean, stretch, disabled]);
}
