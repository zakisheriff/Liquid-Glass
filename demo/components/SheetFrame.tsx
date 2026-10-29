'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePreviewTheme } from './PreviewTheme';

/** A scrollable body and an action pinned to the visible sheet, at any detent. */
export function SheetFrame({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const theme = usePreviewTheme();

  useLayoutEffect(() => {
    const element = frame.current;
    const content = body.current;
    const sheet = element?.closest<HTMLElement>('.lg-sheet');
    const layer = sheet?.parentElement;
    if (!element || !content || !sheet || !layer) return;
    const fit = () => {
      const box = layer.getBoundingClientRect();
      const top = element.getBoundingClientRect().top;
      // Never shorter than at the medium detent (top half of the screen):
      // below it, as when closing, the action rides down with the sheet
      // instead of staying pinned while the sheet slides over it.
      const offset = top - sheet.getBoundingClientRect().top;
      const floor = box.height / 2 - offset;
      element.style.height = `${Math.max(0, box.bottom - top, floor)}px`;
    };
    // As on iOS: below full height a drag anywhere on the sheet moves it.
    // Fully raised, the body scrolls first, and only once it is back at the
    // top does a pull drag the sheet down. Controls keep their own gestures.
    const scrollBody = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest('button, input, textarea, a, [role="slider"], [role="switch"]')) return;
      if (sheet.hasAttribute('data-raised') && content.scrollTop > 0) event.stopPropagation();
    };
    fit();
    const motion = new MutationObserver(fit);
    motion.observe(sheet, { attributes: true, attributeFilter: ['style'] });
    const resize = new ResizeObserver(fit);
    resize.observe(layer);
    content.addEventListener('pointerdown', scrollBody);
    return () => {
      motion.disconnect();
      resize.disconnect();
      content.removeEventListener('pointerdown', scrollBody);
    };
  }, []);

  useLayoutEffect(() => {
    const sheet = frame.current?.closest<HTMLElement>('.lg-sheet');
    if (!sheet) return;
    sheet.dataset.theme = theme;
    sheet.classList.add('preview-scope');
  }, [theme]);

  return (
    <div ref={frame} className="sheet-frame">
      <div ref={body} className="sheet-frame__body">{children}</div>
      <div className="sheet-frame__footer">{footer}</div>
    </div>
  );
}
