'use client';

import { useEffect, useRef } from 'react';

/**
 * The screen-recorded demo. Nothing is downloaded until it scrolls near the
 * viewport; then it plays muted on a loop and pauses again once off screen.
 */
export function DemoVideo() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const watch = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (element.preload !== 'auto') element.preload = 'auto';
        if (!still) void element.play().catch(() => {});
      } else {
        element.pause();
      }
    }, { rootMargin: '200px 0px' });
    watch.observe(element);
    return () => watch.disconnect();
  }, []);

  return (
    <video
      ref={video}
      className="demo-video"
      poster="/video/demo-poster.jpg"
      width={2626}
      height={1664}
      muted
      loop
      playsInline
      controls
      preload="none"
      aria-label="Screen recording of the Liquid Glass playground: buttons, sliders, switches, tab bar, menu and sheet in use"
    >
      {/* AV1 where it decodes (much smaller); everything else takes the MP4. */}
      <source src="/video/demo.webm" type='video/webm; codecs="av01.0.12M.08"' />
      <source src="/video/demo.mp4" type="video/mp4" />
    </video>
  );
}
