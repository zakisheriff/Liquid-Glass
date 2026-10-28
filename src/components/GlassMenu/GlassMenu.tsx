import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createSpring, clamp, springFrom } from '../../engine/spring';
import { haptic } from '../../engine/haptics';
import { usePress } from '../../engine/press';
import { GlassButton } from '../GlassButton';
import './GlassMenu.css';

export interface GlassMenuItem {
  label: React.ReactNode;
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Shows a trailing checkmark. */
  checked?: boolean;
  /** Red label for irreversible actions. */
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface GlassMenuProps {
  /** Icon for the trigger button (e.g. an ellipsis). */
  icon: React.ReactNode;
  items: GlassMenuItem[];
  /** Accessible name for the trigger. */
  'aria-label': string;
  /** Which edge of the trigger the menu grows from. Default 'end' (right). */
  align?: 'start' | 'end';
  /** Trigger size, as for GlassButton. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Menu width in px. Default 230. */
  width?: number;
  /** Trailing checkmark icon. */
  check?: React.ReactNode;
  className?: string;
}

const OPEN = springFrom(0.36, 0.74);
/** Underdamped, so the droplet lands in the button with a slight jiggle. */
const CLOSE = springFrom(0.42, 0.66);
const FADE = springFrom(0.24, 1);
const FADE_OUT = springFrom(0.2, 1);

const Tick = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * iOS 26 pull-down menu. The glass button itself grows into the menu from its
 * corner, its items sharpening out of a blur as it opens, and on close the
 * menu folds back down into the button.
 */
export const GlassMenu: React.FC<GlassMenuProps> = ({
  icon,
  items,
  'aria-label': ariaLabel,
  align = 'end',
  size = 'md',
  width = 230,
  check,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const spring = useRef<ReturnType<typeof createSpring> | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Held, the open menu behaves like any glass button: it swells and is drawn
  // out toward the finger, then wobbles back.
  usePress(surfaceRef, { grow: 0.035, lean: 6, stretch: 0.1, disabled: !mounted });

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Reopened mid-close: grow back out from wherever the droplet is.
      if (spring.current) {
        spring.current.tune(OPEN);
        spring.current.set(1);
      }
    } else if (spring.current) {
      spring.current.tune(CLOSE);
      spring.current.set(0);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!mounted) return;
    const surface = surfaceRef.current!;
    const panel = panelRef.current!;
    const content = contentRef.current!;
    const trigger = triggerRef.current!;
    const w = trigger.offsetWidth;
    const h = trigger.offsetHeight;
    const W = Math.max(w, Math.min(width, window.innerWidth - 24));
    content.style.width = `${W}px`;
    const H = Math.max(h, content.offsetHeight);
    // The glass keeps its final size and morphs with a transform from the
    // trigger's corner. Resizing a backdrop-filtered layer every frame makes
    // Safari paint stray colours along its edges.
    surface.style.width = `${W}px`;
    surface.style.height = `${H}px`;
    const end = align === 'end';
    // The live droplet outline, shared by the glass and the items above it.
    const box = { cw: w, ch: h, r: h / 2 };
    let scaleNow = 1;
    let closing = false;
    const clipContent = () => {
      // Items are scaled about the trigger's corner; clip in their own units.
      const k = scaleNow;
      const right = Math.max(0, W - box.cw / k);
      const bottom = Math.max(0, H - box.ch / k);
      content.style.clipPath = box.cw >= W - 0.5 && box.ch >= H - 0.5 && k === 1
        ? ''
        : `inset(0 ${end ? 0 : right}px ${bottom}px ${end ? right : 0}px round ${box.r / k}px)`;
    };
    const shape = (p: number) => {
      const cw = Math.max(1, w + (W - w) * p);
      const ch = Math.max(1, h + (H - h) * p);
      const sx = cw / W;
      const sy = ch / H;
      panel.style.transform = `scale(${sx}, ${sy})`;
      // In flight it's a round droplet (fully rounded on its short side) and
      // only squares off into the menu's corners as it lands. The radius is
      // given in the panel's own, unscaled units.
      const land = clamp((p - 0.5) / 0.5, 0, 1);
      const r = (Math.min(cw, ch) / 2) * (1 - land) + 24 * land;
      panel.style.borderRadius = `${r / sx}px / ${r / sy}px`;
      box.cw = cw;
      box.ch = ch;
      box.r = r;
      clipContent();
      // Near the button's size the two shapes coincide, so the button and the
      // menu cross-fade there: the button melts into the menu on open and
      // reappears inside the shrinking droplet on close.
      // Closing, the button starts showing through early so the droplet
      // never sits as a blank pill between the items and the label.
      const k = clamp(p / (closing ? 0.7 : 0.35), 0, 1);
      panel.style.opacity = String(closing ? Math.min(1, k * 1.4) : k);
      trigger.style.opacity = String(1 - k);
      // Past the button's size the close overshoots: the button squashes
      // and springs back as part of the same motion.
      trigger.style.scale = closing && p < -0.0005 ? `${1 - p * 0.6} ${1 + p * 1.2}` : '';
    };
    // The items ride above the glass on their own layer: they grow out of a
    // blur as the droplet lands, on a critically damped curve so they sharpen
    // once and stay sharp.
    const reveal = (q: number) => {
      const t = clamp(q, 0, 1);
      const blur = 9 * (1 - t) ** 2.5;
      content.style.opacity = String(t);
      scaleNow = t < 0.999 ? 0.82 + 0.18 * t : 1;
      content.style.scale = scaleNow === 1 ? '' : String(scaleNow);
      clipContent();
      content.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
    };
    shape(0);
    reveal(0);
    const s = createSpring(0, OPEN, (p, v) => {
      shape(p);
      // Unmount only once the landing jiggle has fully settled.
      if (s.target === 0 && p === 0 && v === 0) {
        trigger.style.opacity = '';
        trigger.style.scale = '';
        setMounted(false);
      }
    });
    const fade = createSpring(0, FADE, reveal);
    spring.current = {
      ...s,
      tune: s.tune,
      set(target: number, instant?: boolean) {
        closing = target === 0;
        // A closing menu lets clicks through to the button beneath it.
        surface.style.pointerEvents = closing ? 'none' : '';
        fade.tune(target ? FADE : FADE_OUT);
        fade.set(target, instant);
        s.set(target, instant);
      },
    } as typeof s;
    spring.current.set(1);
    content.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus({ preventScroll: true });
    return () => {
      s.stop();
      fade.stop();
      spring.current = null;
      trigger.style.opacity = '';
      trigger.style.scale = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Slide a finger across the items: the one beneath it lights up, and
  // letting go there picks it, as on iOS.
  useEffect(() => {
    if (!mounted) return;
    const panel = surfaceRef.current!;
    let held: number | null = null;
    let hot: HTMLElement | null = null;
    const itemAt = (x: number, y: number) =>
      (document.elementFromPoint(x, y) as HTMLElement | null)?.closest<HTMLElement>('.lg-menu__item:not(:disabled)') ?? null;
    const light = (next: HTMLElement | null) => {
      if (next === hot) return;
      hot?.removeAttribute('data-active');
      hot = next;
      if (hot) {
        hot.setAttribute('data-active', '');
        haptic();
      }
    };
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      held = event.pointerId;
      hot = null;
      light(itemAt(event.clientX, event.clientY));
    };
    const move = (event: PointerEvent) => {
      if (event.pointerId === held) light(itemAt(event.clientX, event.clientY));
    };
    const up = (event: PointerEvent) => {
      if (event.pointerId !== held) return;
      held = null;
      const target = hot;
      light(null);
      const index = target ? Number(target.dataset.index) : -1;
      const item = itemsRef.current[index];
      if (item && !item.disabled) {
        event.preventDefault();
        haptic();
        item.onSelect?.();
        setOpen(false);
      }
    };
    const cancel = (event: PointerEvent) => {
      if (event.pointerId !== held) return;
      held = null;
      light(null);
    };
    // Touch drags must not scroll the page while scrubbing the menu.
    const hold = (event: TouchEvent) => {
      if (held !== null && event.cancelable) event.preventDefault();
    };
    panel.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    panel.addEventListener('touchmove', hold, { passive: false });
    return () => {
      panel.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      panel.removeEventListener('touchmove', hold);
    };
  }, [mounted]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!anchorRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('pointerdown', outside, true);
    window.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', outside, true);
      window.removeEventListener('keydown', key);
    };
  }, [open]);

  const select = (item: GlassMenuItem) => {
    haptic();
    item.onSelect?.();
    setOpen(false);
  };

  return (
    <span ref={anchorRef} className={['lg-menu-anchor', className].filter(Boolean).join(' ')} data-align={align}>
      <GlassButton
        ref={triggerRef}
        size={size}
        icon={icon}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      />
      {mounted && (
        <div ref={surfaceRef} className="lg-menu-surface">
          <div ref={panelRef} className="lg-glass lg-menu" data-liquid-glass="" aria-hidden="true" />
          <div ref={contentRef} className="lg-menu__content" role="menu" aria-label={ariaLabel}>
            {items.map((item, index) => (
              <button
                key={index}
                type="button"
                role="menuitem"
                className="lg-menu__item"
                data-destructive={item.destructive ? '' : undefined}
                data-index={index}
                disabled={item.disabled}
                onClick={(event) => {
                  // Pointer picks are handled on release; this is keyboard.
                  if (event.detail === 0) select(item);
                }}
              >
                {item.icon != null && <span className="lg-menu__icon">{item.icon}</span>}
                <span className="lg-menu__label">{item.label}</span>
                {item.checked && <span className="lg-menu__check">{check ?? <Tick />}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </span>
  );
};

GlassMenu.displayName = 'GlassMenu';
