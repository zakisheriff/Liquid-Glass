'use client';

import { useEffect, useRef } from 'react';
import { SPRINGS, createSpring, usePress, useRefraction } from '@zakisheriff/liquid-glass';
import { mountLensOptics } from './lensOptics';
import { PreviewThemeContext, PreviewThemeToggle, usePreviewMode } from './PreviewTheme';
import { RefractionPlayground } from './RefractionPlayground';

/** A free-floating droplet you can drag over type to watch light bend. */
export function LensDemo() {
  const [mode, setMode] = usePreviewMode();
  const stage = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const poster = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useRefraction(lens, { kind: 'lens', zoom: 1.035, thickness: 64, bezel: 40, dispersion: 0.7 }, true, poster,
    () => stage.current?.dataset.optics !== 'ready');
  usePress(lens, { grow: 0.12, lean: 0, stretch: 0.14 });

  useEffect(() => mountLensOptics(stage.current!, poster.current!, lens.current!, canvas.current!), []);

  useEffect(() => {
    const area = stage.current!;
    const el = lens.current!;
    const pos = { x: 0, y: 0 };
    const paint = () => {
      el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    };
    const x = createSpring(0, SPRINGS.drag, (v) => {
      pos.x = v;
      paint();
    });
    const y = createSpring(0, SPRINGS.drag, (v) => {
      pos.y = v;
      paint();
    });
    const center = () => {
      x.set((area.clientWidth - el.offsetWidth) / 2, true);
      y.set(18, true);
    };
    center();

    let grab: { id: number; dx: number; dy: number } | null = null;
    const down = (e: PointerEvent) => {
      const box = area.getBoundingClientRect();
      grab = { id: e.pointerId, dx: e.clientX - box.left - pos.x, dy: e.clientY - box.top - pos.y };
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== grab?.id) return;
      const box = area.getBoundingClientRect();
      x.tune(SPRINGS.drag);
      y.tune(SPRINGS.drag);
      x.set(Math.min(box.width - el.offsetWidth / 2, Math.max(-el.offsetWidth / 2, e.clientX - box.left - grab.dx)));
      y.set(Math.min(box.height - el.offsetHeight / 2, Math.max(-el.offsetHeight / 2, e.clientY - box.top - grab.dy)));
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== grab?.id) return;
      grab = null;
      // Drift a touch further, then settle with a wobble.
      x.tune(SPRINGS.release);
      y.tune(SPRINGS.release);
      x.set(Math.min(area.clientWidth - el.offsetWidth, Math.max(0, x.target)));
      y.set(Math.min(area.clientHeight - el.offsetHeight, Math.max(0, y.target)));
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    window.addEventListener('resize', center);
    return () => {
      x.stop();
      y.stop();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      window.removeEventListener('resize', center);
    };
  }, []);

  return (
    <PreviewThemeContext.Provider value={mode}>
    <section className="lens-section" id="refraction">
      <header className="section-head">
        <h2>Light, bent for real.</h2>
      </header>
      <div ref={stage} className="lens-demo preview-scope" data-theme={mode}>
        <PreviewThemeToggle label="Refraction" mode={mode} onChange={setMode} />
        <div ref={poster} className="lens-demo__poster" aria-hidden="true">
          <span>Liquid Glass</span>
          <canvas ref={canvas} className="lens-demo__optics" />
        </div>
        <div ref={lens} className="lg-glass lens-demo__lens" role="img" aria-label="Draggable glass lens" />
        <RefractionPlayground />
      </div>
    </section>
    </PreviewThemeContext.Provider>
  );
}
