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
      const bottom = layer.getBoundingClientRect().bottom;
      const top = element.getBoundingClientRect().top;
      element.style.height = `${Math.max(0, bottom - top)}px`;
    };
    // The grabber owns sheet dragging; the body owns scrolling. Interactive
    // controls retain their own pointer handlers and the sheet ignores them.
    const scrollBody = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest('button, input, textarea, a, [role="slider"], [role="switch"]')) event.stopPropagation();
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
