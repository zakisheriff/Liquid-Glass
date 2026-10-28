/**
 * Shared behaviour for tab bars and segmented controls.
 *
 * At rest the selection is a flat pill. Touch it and the pill inflates into a
 * clear refracting lens that rides above the bar, follows the finger (leaning
 * and stretching with speed), magnifies and tints what passes beneath it, then
 * drops into the nearest slot with a wobble.
 */
import { useEffect, useRef } from 'react';
import { SPRINGS, clamp, createSpring, rubberband } from './spring';
import { haptic } from './haptics';

export interface LensTrackRefs {
  bar: React.RefObject<HTMLElement | null>;
  lens: React.RefObject<HTMLElement | null>;
  select: React.RefObject<HTMLElement | null>;
  glass: React.RefObject<HTMLElement | null>;
}

export interface LensTrackOptions {
  count: number;
  index: number;
  onSelect: (index: number) => void;
  /** How far past the bar's height the lifted lens reaches (px). */
  overhang: number;
  /** Extra width (as a fraction of a slot) the lifted lens gains. */
  spread: number;
  /** How much the whole bar swells while touched (px on its long side). */
  swell: number;
}

export function useLensTrack(refs: LensTrackRefs, options: LensTrackOptions) {
  const latest = useRef(options);
  latest.current = options;
  const api = useRef<{ setIndex: (index: number, instant?: boolean) => void } | null>(null);

  useEffect(() => {
    const bar = refs.bar.current;
    const lens = refs.lens.current;
    const glass = refs.glass.current;
    const select = refs.select.current;
    if (!bar || !lens || !glass || !select) return;

    let slot = 0;
    let height = 0;
    let pad = 0;
    // The lens is laid out at its full lifted size (W×H) and only scaled
    // *down* toward the resting pill. At full lift it renders 1:1: true pill
    // curves and a pixel-sharp baked rim, never a stretched bitmap.
    let W = 0;
    let H = 0;
    const state = { x: 0, lift: 0, swell: 0, squash: 0 };
    let current = latest.current.index;
    let gesture: {
      id: number;
      startX: number;
      anchor: number;
      moved: boolean;
      box: DOMRect;
      hovered: number;
    } | null = null;
    let suppressClick = false;
    const buttons = Array.from(bar.querySelectorAll<HTMLElement>('[data-lg-item]'));
    let glyphs: Array<{ node: HTMLElement; x: number; y: number; width: number; label: boolean }> = [];
    const preview = (index?: number) => {
      if (index === undefined) delete bar.dataset.previewing;
      else bar.dataset.previewing = '';
      buttons.forEach((button, i) => button.toggleAttribute('data-lg-preview', i === index));
    };

    const measure = () => {
      const style = getComputedStyle(bar);
      pad = parseFloat(style.paddingLeft) || 0;
      slot = (bar.clientWidth - pad - (parseFloat(style.paddingRight) || 0)) / latest.current.count;
      height = bar.clientHeight - (parseFloat(style.paddingTop) || 0) - (parseFloat(style.paddingBottom) || 0);
      const { overhang, spread } = latest.current;
      W = Math.round(slot * (1 + spread));
      H = Math.round(bar.offsetHeight + overhang);
      lens.style.width = `${W}px`;
      lens.style.height = `${H}px`;
      lens.style.left = `${pad + (slot - W) / 2}px`;
      lens.style.top = `${pad + (height - H) / 2}px`;
      select.style.width = `${slot}px`;
      glyphs = buttons.flatMap((button) =>
        Array.from(button.querySelectorAll<HTMLElement>('.lg-nav__label, .lg-nav__icon > .lg-symbol')).map((node) => ({
          node,
          x: button.offsetLeft + node.offsetLeft - pad,
          y: node.offsetTop + node.offsetHeight / 2,
          width: node.offsetWidth,
          label: node.classList.contains('lg-nav__label'),
        })),
      );
    };

    const paint = () => {
      const { x, swell, squash } = state;
      const lift = clamp(state.lift, 0, 1.08);
      if (!W || !H) return;
      const kx = ((slot + (W - slot) * lift) / W) * (1 + squash);
      const ky = ((height + (H - height) * lift) / H) * (1 - squash * 0.6);
      const transform = `translateX(${x}px) scale(${kx}, ${ky})`;
      lens.style.transform = transform;
      select.style.transform = `translateX(${x}px)`;
      lens.style.opacity = String(clamp(lift * 4, 0, 1));
      const grow = 1 + (latest.current.swell / Math.max(bar.offsetWidth, 1)) * swell;
      bar.style.scale = `${grow}`;
      lens.style.setProperty('--lg-lift', String(clamp(lift, 0, 1)));
      bar.style.setProperty('--lg-lift', String(clamp(lift, 0, 1)));
      // Tint the original glyphs precisely where the curved lens overlaps.
      // A moving gradient gives the native partial-blue transition without
      // drawing a second, ghosted row of icons or labels.
      for (const glyph of glyphs) {
        if (lift <= 0.02 && !gesture) {
          glyph.node.style.removeProperty('--lg-content-tint');
          glyph.node.style.removeProperty('transform');
          continue;
        }
        const ry = H * ky / 2;
        const dy = clamp(Math.abs(glyph.y - height / 2) / ry, 0, 1);
        const half = Math.max(0, (W - H) * kx / 2) + H * kx / 2 * Math.sqrt(1 - dy * dy);
        const from = x + slot / 2 - half - glyph.x;
        const to = x + slot / 2 + half - glyph.x;
        const normal = 'var(--lg-fg)';
        const active = 'var(--lg-track-active, var(--lg-accent))';
        glyph.node.style.setProperty('--lg-content-tint', `linear-gradient(90deg, ${normal} ${from}px, ${active} ${from}px, ${active} ${to}px, ${normal} ${to}px)`);
        const coverage = clamp((Math.min(glyph.width, to) - Math.max(0, from)) / Math.max(1, glyph.width), 0, 1);
        glyph.node.style.transform = `scale(${1 + clamp(lift, 0, 1) * coverage * (glyph.label ? 0.035 : 0.08)})`;
      }
      if (!gesture && lift < 0.02) delete bar.dataset.lifted;
    };

    const x = createSpring(current * slot, SPRINGS.snap, (value, velocity) => {
      state.x = value;
      // Fast travel stretches the droplet along its path.
      state.squash = clamp(Math.abs(velocity) / 6000, 0, 0.08);
      paint();
    });
    const lift = createSpring(0, SPRINGS.lift, (value) => {
      state.lift = value;
      paint();
    });
    const swell = createSpring(0, SPRINGS.press, (value) => {
      state.swell = value;
      paint();
    });

    const place = (index: number, instant = false) => {
      current = index;
      if (!gesture) {
        x.tune(SPRINGS.snap);
        x.set(index * slot, instant);
      }
    };

    const position = (clientX: number) => {
      if (!gesture) return 0;
      const raw = gesture.anchor + (clientX - gesture.startX) * bar.offsetWidth / Math.max(1, gesture.box.width);
      const max = slot * (latest.current.count - 1);
      // iOS gives only a few points of overscroll past the end segments.
      const give = Math.min(14, slot * 0.12);
      if (raw < 0) return rubberband(raw, give, 0.55);
      if (raw > max) return max + rubberband(raw - max, give, 0.55);
      return raw;
    };

    const light = (clientX: number, box: DOMRect) => {
      glass.style.setProperty('--lg-x', `${clamp(((clientX - box.left) / box.width) * 100, 0, 100)}%`);
      lens.style.setProperty('--lg-x', `${clamp(((clientX - box.left - pad - state.x) / slot) * 100, 0, 100)}%`);
    };

    const itemAt = (event: PointerEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-lg-item]');
      return target && bar.contains(target) ? Number(target.dataset.lgItem) : -1;
    };

    const onDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || gesture) return;
      const index = itemAt(event);
      if (index < 0) return;
      measure();
      const box = bar.getBoundingClientRect();
      gesture = { id: event.pointerId, startX: event.clientX, anchor: index * slot, moved: false, box, hovered: index };
      suppressClick = false;
      bar.dataset.lifted = '';
      preview(index);
      lens.dataset.pressed = '';
      light(event.clientX, box);
      haptic();
      lift.tune(SPRINGS.lift);
      lift.set(1);
      swell.tune(SPRINGS.press);
      swell.set(1);
      // The lens slides out of the old selection toward the finger.
      x.tune(SPRINGS.snap);
      x.set(index * slot);
      paint();
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== gesture?.id) return;
      if (!gesture.moved && Math.abs(event.clientX - gesture.startX) > 5) {
        gesture.moved = true;
        try {
          bar.setPointerCapture(event.pointerId);
        } catch {
          /* already released */
        }
      }
      light(event.clientX, gesture.box);
      if (!gesture.moved) return;
      const at = position(event.clientX);
      x.tune(SPRINGS.drag);
      x.set(at);
      const hovered = clamp(Math.round(at / slot), 0, latest.current.count - 1);
      if (hovered !== gesture.hovered) {
        gesture.hovered = hovered;
        preview(hovered);
        haptic();
      }
    };

    const finish = (event: PointerEvent, commit: boolean) => {
      if (event.pointerId !== gesture?.id) return;
      const { moved, box } = gesture;
      const at = moved ? position(event.clientX) : gesture.anchor;
      const index = clamp(Math.round(at / slot), 0, latest.current.count - 1);
      gesture = null;
      preview();
      delete lens.dataset.pressed;
      if (bar.hasPointerCapture?.(event.pointerId)) bar.releasePointerCapture(event.pointerId);
      const inside = event.clientY >= box.top - 30 && event.clientY <= box.bottom + 30;
      lift.tune(SPRINGS.settle);
      lift.set(0);
      swell.tune(SPRINGS.release);
      swell.set(0);
      x.tune(SPRINGS.snap);
      if (commit && (moved || inside)) {
        suppressClick = true;
        current = index;
        x.set(index * slot);
        if (index !== latest.current.index) latest.current.onSelect(index);
      } else {
        x.set(current * slot);
      }
    };

    const onUp = (event: PointerEvent) => finish(event, true);
    const onCancel = (event: PointerEvent) => finish(event, false);
    const onBlur = () => {
      if (!gesture) return;
      const id = gesture.id;
      gesture = null;
      preview();
      delete lens.dataset.pressed;
      if (bar.hasPointerCapture(id)) bar.releasePointerCapture(id);
      lift.tune(SPRINGS.settle);
      lift.set(0);
      swell.tune(SPRINGS.release);
      swell.set(0);
      x.tune(SPRINGS.snap);
      x.set(current * slot);
    };

    const onClick = (event: MouseEvent) => {
      if (suppressClick && event.detail !== 0) {
        suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-lg-item]');
      if (!target) return;
      const index = Number(target.dataset.lgItem);
      if (index !== latest.current.index) latest.current.onSelect(index);
    };

    const onKey = (event: KeyboardEvent) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const { count, index } = latest.current;
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? count - 1
            : (index + (event.key === 'ArrowRight' ? 1 : count - 1)) % count;
      latest.current.onSelect(next);
      bar.querySelector<HTMLElement>(`[data-lg-item="${next}"]`)?.focus();
    };

    const onTouchMove = (event: TouchEvent) => {
      // Holding the lens owns the gesture: the page must not scroll under it.
      if (gesture && event.cancelable) event.preventDefault();
    };

    const observer = new ResizeObserver(() => {
      measure();
      if (!gesture) x.set(current * slot, true);
    });

    measure();
    x.set(current * slot, true);
    bar.dataset.ready = '';
    observer.observe(bar);
    bar.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('blur', onBlur);
    bar.addEventListener('click', onClick, true);
    bar.addEventListener('keydown', onKey);
    bar.addEventListener('touchmove', onTouchMove, { passive: false });

    api.current = { setIndex: place };

    return () => {
      api.current = null;
      [x, lift, swell].forEach((s) => s.stop());
      observer.disconnect();
      bar.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('blur', onBlur);
      bar.removeEventListener('click', onClick, true);
      bar.removeEventListener('keydown', onKey);
      bar.removeEventListener('touchmove', onTouchMove);
      delete bar.dataset.ready;
      delete bar.dataset.lifted;
      preview();
      glyphs.forEach(({ node }) => {
        node.style.removeProperty('--lg-content-tint');
        node.style.removeProperty('transform');
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.count]);

  useEffect(() => {
    api.current?.setIndex(options.index);
  }, [options.index]);
}
