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

const OPEN = springFrom(0.38, 0.72);
const CLOSE = springFrom(0.32, 0.92);
const FADE = springFrom(0.26, 1);
const FADE_OUT = springFrom(0.14, 1);

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
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const spring = useRef<ReturnType<typeof createSpring> | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Held, the open menu behaves like any glass button: it swells and is drawn
  // out toward the finger, then wobbles back.
  usePress(panelRef, { grow: 0.035, lean: 6, stretch: 0.1, disabled: !mounted });

  useEffect(() => {
    if (open) setMounted(true);
    else if (spring.current) {
      spring.current.tune(CLOSE);
      spring.current.set(0);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!mounted) return;
    const panel = panelRef.current!;
    const content = contentRef.current!;
    const trigger = triggerRef.current!;
    const w = trigger.offsetWidth;
    const h = trigger.offsetHeight;
    const W = Math.max(w, Math.min(width, window.innerWidth - 24));
    content.style.width = `${W}px`;
    const H = Math.max(h, content.offsetHeight);
    const shape = (p: number) => {
      // Grow from the trigger's own box: same corner, same size at p = 0.
      // The shape may overshoot a little; that's the liquid feel.
      const cw = w + (W - w) * p;
      const ch = h + (H - h) * p;
      panel.style.width = `${cw}px`;
      panel.style.height = `${ch}px`;
      // In flight it's a round droplet (fully rounded on its short side) and
      // only squares off into the menu's corners as it lands.
      const land = clamp((p - 0.5) / 0.5, 0, 1);
      panel.style.borderRadius = `${(Math.min(cw, ch) / 2) * (1 - land) + 24 * land}px`;
      // Near the button's size the two shapes coincide, so the button and the
      // menu cross-fade there: the button melts into the menu on open and
      // reappears smoothly as the menu folds back, instead of popping in.
      const k = clamp(p / 0.35, 0, 1);
      panel.style.opacity = String(k);
      trigger.style.opacity = String(1 - k);
    };
    // The items reveal on their own critically damped curve so they sharpen
    // once and stay sharp: no bounce back into blur, no scaling (which makes
    // browsers re-raster the text the moment motion stops). The blur only
    // lives in the first part of the reveal, so nothing looks soft once the
    // shape has settled.
    const reveal = (q: number) => {
      const t = clamp(q, 0, 1);
      const blur = 9 * (1 - t) ** 2.5;
      content.style.opacity = String(t);
      content.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
    };
    shape(0);
    reveal(0);
    const s = createSpring(0, OPEN, (p) => {
      shape(p);
      if (p <= 0.02 && s.target === 0) {
        trigger.style.opacity = '';
        setMounted(false);
      }
    });
    const fade = createSpring(0, FADE, reveal);
    spring.current = {
      ...s,
      tune: s.tune,
      set(target: number, instant?: boolean) {
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Slide a finger across the items: the one beneath it lights up, and
  // letting go there picks it, as on iOS.
  useEffect(() => {
    if (!mounted) return;
    const panel = panelRef.current!;
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
        <div ref={panelRef} className="lg-glass lg-menu" data-liquid-glass="">
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
