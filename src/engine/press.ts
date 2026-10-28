/**
 * The Liquid Glass touch response: the shape swells under the finger, leans
 * and stretches toward a drag like a droplet held by surface tension, lights
 * up where it's touched, then lets go with a soft jelly wobble.
 */
import { useEffect } from 'react';
import { SPRINGS, createSpring, rubberband } from './spring';

export interface PressOptions {
  /** Extra px the larger side grows by on touch. Mouse uses ~45% of it. */
  grow?: number;
  /** How far (px) the shape may lean toward a drag. */
  lean?: number;
  /** Max anisotropic stretch while dragging (0.1 = 10%). */
  stretch?: number;
  disabled?: boolean;
}

export function usePress(ref: React.RefObject<HTMLElement | null>, options: PressOptions = {}) {
  const { grow = 14, lean = 7, stretch = 0.08, disabled = false } = options;

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
      const tx = rubberband(dx, box.width * 0.9, 0.35) * (lean / 12);
      const ty = rubberband(dy, box.height * 0.9, 0.35) * (lean / 12);
      const dist = Math.hypot(dx, dy);
      const pull = 1 - 1 / (1 + dist / 90);
      const horizontal = Math.abs(dx) >= Math.abs(dy);
      const s = 1 + stretch * pull;
      to(
        [base * (horizontal ? s : 1 / s), base * (horizontal ? 1 / s : s), tx, ty],
        SPRINGS.drag,
      );
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
      const amount = event.pointerType === 'mouse' ? grow * 0.45 : grow;
      const base = 1 + amount / Math.max(el.offsetWidth, el.offsetHeight, 1);
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
