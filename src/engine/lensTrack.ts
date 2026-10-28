/**
 * Shared behaviour for tab bars and segmented controls.
 *
 * At rest the selection is a flat pill. Touch it and the pill inflates into a
 * clear refracting lens that rides above the bar, follows the finger (leaning
 * and stretching with speed), magnifies and tints what passes beneath it, then
 * drops into the nearest slot with a wobble.
 */
import { useEffect, useRef } from 'react';
import { guardSelection } from './selection';
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
  /** Magnification applied by the backdrop filter to the original glyphs. */
  contentZoom?: number;
  /**
   * The lens draws a magnified copy of the bar (Safari, Firefox). The real
   * glyphs then fade out beneath the lens so they don't show doubled through
   * its clear glass.
   */
  copied?: boolean;
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
    let padY = 0;
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
      startedAt: number;
    } | null = null;
    let dropTimer = 0;
    let suppressClick = false;
    // Direct children only: a copied lens (Safari) holds inert clones of them.
    const buttons = Array.from(bar.querySelectorAll<HTMLElement>(':scope > [data-lg-item]'));
    let glyphs: Array<{ node: HTMLElement; x: number; y: number; width: number; height: number; label: boolean; host: HTMLElement; dx: number; dy: number }> = [];
    const preview = (index?: number) => {
      if (index === undefined) delete bar.dataset.previewing;
      else bar.dataset.previewing = '';
      buttons.forEach((button, i) => button.toggleAttribute('data-lg-preview', i === index));
    };

    const measure = () => {
      const style = getComputedStyle(bar);
      pad = parseFloat(style.paddingLeft) || 0;
      padY = parseFloat(style.paddingTop) || 0;
      slot = (bar.clientWidth - pad - (parseFloat(style.paddingRight) || 0)) / latest.current.count;
      height = bar.clientHeight - padY - (parseFloat(style.paddingBottom) || 0);
      const { overhang, spread } = latest.current;
      H = Math.round(bar.offsetHeight + overhang);
      // Give narrow segments the same lifted clearance at their sides as
      // above/below. A percentage alone leaves short labels tightly boxed.
      W = Math.round(Math.max(slot * (1 + spread), slot + H - height));
      lens.style.width = `${W}px`;
      lens.style.height = `${H}px`;
      lens.style.left = `${pad + (slot - W) / 2}px`;
      lens.style.top = `${padY + (height - H) / 2}px`;
      select.style.width = `${slot}px`;
      select.style.left = `${pad}px`;
      glyphs = buttons.flatMap((button) =>
        Array.from(button.querySelectorAll<HTMLElement>('.lg-nav__label, .lg-nav__icon > .lg-symbol')).map((node) => {
          // Symbols are already masked to their shape, so their hide mask
          // goes on the icon box around them.
          const label = node.classList.contains('lg-nav__label');
          const host = label ? node : (node.parentElement as HTMLElement);
          const n = node.getBoundingClientRect();
          const h = host.getBoundingClientRect();
          return {
            node,
            x: button.offsetLeft + node.offsetLeft - pad,
            y: node.offsetTop,
            width: node.offsetWidth,
            height: node.offsetHeight,
            label,
            host,
            dx: n.left - h.left,
            dy: n.top - h.top,
          };
        }),
      );
    };

    const paint = () => {
      const { swell, squash } = state;
      const x = state.x;
      const lift = clamp(state.lift, 0, 1.08);
      if (!W || !H) return;
      const kx = ((slot + (W - slot) * lift) / W) * (1 + squash);
      const ky = ((height + (H - height) * lift) / H) * (1 - squash * 0.6);
      const grow = 1 + (latest.current.swell / Math.max(bar.offsetWidth, 1)) * swell;
      const transform = `translateX(${x}px) scale(${kx}, ${ky})`;
      lens.style.transform = transform;
      select.style.transform = `translateX(${x}px)`;
      lens.style.opacity = String(clamp(lift * 4, 0, 1));
      bar.style.scale = `${grow}`;
      lens.style.setProperty('--lg-lift', String(clamp(lift, 0, 1)));
      bar.style.setProperty('--lg-lift', String(clamp(lift, 0, 1)));
      // Paint a true capsule over each original glyph. A single horizontal
      // gradient turns an icon blue in a rectangular strip before the curved
      // end reaches it. Account for the filter's source magnification too.
      for (const glyph of glyphs) {
        if (lift <= 0.02 && !gesture) {
          glyph.node.style.removeProperty('--lg-content-tint');
          glyph.node.style.removeProperty('transform');
          glyph.host.style.removeProperty('--lg-content-hide');
          continue;
        }
        if (latest.current.copied) {
          // Cut the lens's true footprint out of the real glyph.
          const hy = H * ky / 2;
          const hx = H * kx / 2;
          const run = Math.max(0, (W - H) * kx / 2);
          const ccx = x + slot / 2 - glyph.x + glyph.dx;
          const ccy = height / 2 - glyph.y + glyph.dy;
          const fade = clamp(lift * 3, 0, 1);
          const solid = `rgb(0 0 0 / ${fade})`;
          glyph.host.style.setProperty('--lg-content-hide', [
            'linear-gradient(#000, #000)',
            `radial-gradient(ellipse ${hx}px ${hy}px at ${ccx - run}px ${ccy}px, ${solid} calc(100% - 1px), transparent 100%)`,
            `radial-gradient(ellipse ${hx}px ${hy}px at ${ccx + run}px ${ccy}px, ${solid} calc(100% - 1px), transparent 100%)`,
            `linear-gradient(${solid}, ${solid}) ${ccx - run}px ${ccy - hy}px / ${run * 2}px ${hy * 2}px no-repeat`,
          ].join(', '));
        }
        const zoom = latest.current.contentZoom ?? 1;
        const ry = H * ky / (2 * zoom);
        const rx = H * kx / (2 * zoom);
        const straight = Math.max(0, (W - H) * kx / (2 * zoom));
        const dy = clamp(Math.abs(glyph.y + glyph.height / 2 - height / 2) / ry, 0, 1);
        const half = straight + rx * Math.sqrt(1 - dy * dy);
        const from = x + slot / 2 - half - glyph.x;
        const to = x + slot / 2 + half - glyph.x;
        const normal = 'var(--lg-fg)';
        const active = 'var(--lg-track-active, var(--lg-accent))';
        const coverage = clamp((Math.min(glyph.width, to) - Math.max(0, from)) / Math.max(1, glyph.width), 0, 1);
        const scale = 1 + clamp(lift, 0, 1) * coverage * (glyph.label ? 0.035 : 0.08);
        const cx = (x + slot / 2 - glyph.x - glyph.width / 2) / scale + glyph.width / 2;
        const cy = (height / 2 - glyph.y - glyph.height / 2) / scale + glyph.height / 2;
        const left = cx - straight / scale;
        const right = cx + straight / scale;
        const radiusX = rx / scale;
        const radiusY = ry / scale;
        glyph.node.style.setProperty('--lg-content-tint', [
          `radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${left}px ${cy}px, ${active} calc(100% - 0.5px), transparent 100%)`,
          `radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${right}px ${cy}px, ${active} calc(100% - 0.5px), transparent 100%)`,
          `linear-gradient(${active}, ${active}) ${left}px ${cy - radiusY}px / ${right - left}px ${radiusY * 2}px no-repeat`,
          `linear-gradient(${normal}, ${normal})`,
        ].join(', '));
        glyph.node.style.transform = `scale(${scale})`;
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
      delete bar.dataset.keyboard;
      if (!event.isPrimary || event.button !== 0 || gesture) return;
      const index = itemAt(event);
      if (index < 0) return;
      clearTimeout(dropTimer);
      measure();
      const box = bar.getBoundingClientRect();
      gesture = { id: event.pointerId, startX: event.clientX, anchor: index * slot, moved: false, box, hovered: index, startedAt: performance.now() };
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
      const { moved, box, startedAt } = gesture;
      const at = moved ? position(event.clientX) : gesture.anchor;
      const index = clamp(Math.round(at / slot), 0, latest.current.count - 1);
      gesture = null;
      preview();
      delete lens.dataset.pressed;
      if (bar.hasPointerCapture?.(event.pointerId)) bar.releasePointerCapture(event.pointerId);
      const inside = event.clientY >= box.top - 30 && event.clientY <= box.bottom + 30;
      // A quick tap should show the full lift, just like holding the tab.
      // Drags still settle immediately when the pointer is released.
      const drop = () => {
        lift.tune(SPRINGS.settle);
        lift.set(0);
      };
      const hold = commit && !moved ? Math.max(0, 200 - (performance.now() - startedAt)) : 0;
      if (hold) dropTimer = window.setTimeout(drop, hold);
      else drop();
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
      clearTimeout(dropTimer);
      if (!gesture) {
        lift.tune(SPRINGS.settle);
        lift.set(0);
        return;
      }
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
      bar.dataset.keyboard = '';
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
    const unguard = guardSelection(bar);
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
      clearTimeout(dropTimer);
      api.current = null;
      [x, lift, swell].forEach((s) => s.stop());
      unguard();
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
      glyphs.forEach(({ node, host }) => {
        node.style.removeProperty('--lg-content-tint');
        node.style.removeProperty('transform');
        host.style.removeProperty('--lg-content-hide');
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.count]);

  useEffect(() => {
    api.current?.setIndex(options.index);
  }, [options.index]);
}
