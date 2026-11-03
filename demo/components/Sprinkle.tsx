'use client';

import React from 'react';

/** Stickers a letter turns into for a moment as the pointer passes over it (`/stickers/*.webp`). */
const STICKERS = [
  'acoustic-coupler',
  'airplane',
  'astronaut-helmet',
  'balloon-dog',
  'banana',
  'baseball',
  'boombox',
  'bowling-pin',
  'boxing-glove',
  'brick-phone',
  'cartoon-speech-bubble-sign',
  'cassette-tape',
  'chalkboard-for-pictionary',
  'chat',
  'check-flag',
  'cinema-screen',
  'coat-hanger',
  'cocktail',
  'compact-disc',
  'confetti',
  'cowboy-boot',
  'crab',
  'crescent-moon-and-star',
  'croissant',
  'crt-tv',
  'cuban-link-chain',
  'dart-target',
  'desk-lamp',
  'dining-table',
  'disco-ball',
  'drafting-table',
  'fax-machine',
  'fiber-optic-internet-modem',
  'fireworks-show',
  'flamingo',
  'flip-phone',
  'floating-teacup',
  'game-cartridge',
  'game-controller',
  'glue-gun',
  'gold-medal',
  'hammer',
  'hammock',
  'heart',
  'hourglass',
  'ice-cream',
  'joystick',
  'key',
  'label-maker',
  'lantern',
  'laptop',
  'lava-lamp',
  'lighthouse',
  'lion',
  'lipstick',
  'magic-8-ball',
  'magnet-crane',
  'mechanical-keyboard',
  'megaphone',
  'microchip',
  'mini-synth',
  'moon',
  'movie-ticket',
  'oil-lamp',
  'overhead-projector',
  'palm-organiser',
  'panda',
  'parcel',
  'plant-pot',
  'pocket-calculator',
  'pocket-tv',
  'polaroid-camera',
  'pottery-wheel-kit',
  'rabbit',
  'red-flag',
  'red-fox',
  'reel-to-reel',
  'retro-microphone',
  'robot',
  'rotary-phone',
  'router',
  'rubber-duck',
  'satellite',
  'server',
  'skyscraper',
  'slab-phone',
  'slide-projector',
  'slinky',
  'smiley-ball',
  'soccer-ball',
  'speaker-cabinet',
  'stack-of-books',
  'super8-camera',
  'tablet-slab',
  'tailors-thimble',
  'taped-banana',
  'telescope',
  'tennis-ball',
  'thermometer',
  'toaster',
  'traffic-cone',
  'treadmill',
  'trophy',
  'trophy-cup',
  'typewriter',
  'umbrella',
  'vcr',
  'virtual-pet',
  'walkman',
  'wall-clock',
  'wallet',
  'wheelbarrow',
  'wine-glass',
  'wrench',
];
const src = (name: string) => `/stickers/${name}.webp`;

let preloaded = false;
/** Fetch every sticker once, the first time the pointer reaches the title, so none pops in blank. */
function preload() {
  if (preloaded) return;
  preloaded = true;
  for (const name of STICKERS) new Image().src = src(name);
}

/**
 * Splits text into letters the hover effect can swap. Words stay unbroken so
 * the title wraps the same as plain text.
 */
export function Sprinkle({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((word, w) =>
        /^\s+$/.test(word) ? (
          word
        ) : (
          <span key={w} className="sprinkle__word">
            {Array.from(word).map((ch, c) => (
              <span key={c} data-ch="">
                {ch}
              </span>
            ))}
          </span>
        ),
      )}
    </>
  );
}

/**
 * Pointer handler for the element holding `Sprinkle` text: the letter under
 * the pointer hides and a sticker pops up in its place, then the letter
 * comes back.
 */
export function useSprinkle() {
  const last = React.useRef(-1);
  return React.useCallback((event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    preload();
    const letter = (event.target as HTMLElement).closest<HTMLElement>('[data-ch]');
    if (!letter || letter.hasAttribute('data-pop')) return;
    let pick = Math.floor(Math.random() * STICKERS.length);
    if (pick === last.current) pick = (pick + 1) % STICKERS.length;
    last.current = pick;
    const sticker = document.createElement('img');
    sticker.className = 'sprinkle__sticker';
    sticker.alt = '';
    sticker.draggable = false;
    sticker.src = src(STICKERS[pick]);
    sticker.style.setProperty('--tilt', `${Math.round(Math.random() * 40 - 20)}deg`);
    letter.setAttribute('data-pop', '');
    letter.appendChild(sticker);
    sticker.addEventListener('animationend', () => {
      sticker.remove();
      letter.removeAttribute('data-pop');
    });
  }, []);
}
