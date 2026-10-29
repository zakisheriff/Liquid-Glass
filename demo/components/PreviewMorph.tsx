'use client';

import { createContext, useCallback, useContext, useId, useRef } from 'react';
import { flushSync } from 'react-dom';

type Change = (update: () => void) => void;
export const PreviewMorphContext = createContext<Change>((update) => update());
export const usePreviewChange = () => useContext(PreviewMorphContext);

/** Match each glass surface and label across an option change. The browser
 * morphs their geometry and fades entering/leaving items without remounting. */
export function usePreviewMorph() {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const running = useRef<ViewTransition | null>(null);
  const revision = useRef(0);
  const morph = useCallback<Change>((update) => {
    const area = ref.current;
    if (!area || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      update();
      return;
    }
    running.current?.skipTransition();
    const version = ++revision.current;
    const marked = new Set<HTMLElement>();
    const mark = () => {
      const surfaces = area.querySelectorAll<HTMLElement>('.device__bottom, .stage__column > .lg-track, .stage__buttons .lg-button, .lg-menu-surface, .playground__dock > .lg-nav, .playground__dock-search');
      surfaces.forEach((surface, i) => {
        const name = `preview-${id}-${i}`;
        surface.style.setProperty('view-transition-name', name);
        marked.add(surface);
        surface.querySelectorAll<HTMLElement>('.lg-track__item, .device__action, .lg-menu__item').forEach((item) => {
          if (item.closest('[data-lg-copy]')) return;
          const label = item.getAttribute('aria-label') ?? item.textContent ?? '';
          item.style.setProperty('view-transition-name', `${name}-${label.replace(/[^a-zA-Z0-9_-]/g, '-')}`);
          marked.add(item);
        });
      });
    };
    if (!document.startViewTransition) {
      flushSync(update);
      area.animate([{ opacity: 0.65, translate: '0 5px' }, { opacity: 1, translate: '0 0' }], { duration: 300, easing: 'ease-out' });
      return;
    }
    mark();
    const transition = document.startViewTransition(() => {
      if (version !== revision.current) return;
      flushSync(update);
      mark();
    });
    running.current = transition;
    void transition.ready.catch(() => {});
    // A newer option supersedes the current animation instead of queuing it.
    void transition.finished.catch(() => {}).finally(() => {
      if (version !== revision.current) return;
      marked.forEach((element) => element.style.removeProperty('view-transition-name'));
      running.current = null;
    });
  }, [id]);
  return { ref, morph };
}
