import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createSpring, clamp, springFrom } from '../../engine/spring';
import { haptic } from '../../engine/haptics';
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

const OPEN = springFrom(0.4, 0.78);
const CLOSE = springFrom(0.32, 0.92);

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
    const paint = (p: number) => {
      // Grow from the trigger's own box: same corner, same size at p = 0.
      panel.style.width = `${w + (W - w) * p}px`;
      panel.style.height = `${h + (H - h) * p}px`;
      panel.style.borderRadius = `${h / 2 + (24 - h / 2) * clamp(p, 0, 1)}px`;
      const q = clamp((p - 0.3) / 0.7, 0, 1);
      content.style.opacity = String(q);
      content.style.filter = q < 1 ? `blur(${(1 - q) * 10}px)` : '';
      content.style.scale = String(0.86 + 0.14 * clamp(p, 0, 1));
      trigger.style.opacity = p > 0.02 ? '0' : '';
    };
    paint(0);
    const s = createSpring(0, OPEN, (p) => {
      paint(p);
      if (p <= 0.001 && s.target === 0) {
        trigger.style.opacity = '';
        setMounted(false);
      }
    });
    spring.current = s;
    s.set(1);
    content.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus({ preventScroll: true });
    return () => {
      s.stop();
      spring.current = null;
      trigger.style.opacity = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                disabled={item.disabled}
                onClick={() => select(item)}
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
