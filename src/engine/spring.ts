/**
 * Closed-form damped harmonic springs, stepped on a shared rAF loop.
 *
 * Each spring is solved analytically per frame (no Euler drift), so stiff
 * presses stay stable and soft releases wobble exactly as tuned.
 */

export interface SpringConfig {
  /** Spring constant k (mass is 1). */
  stiffness: number;
  /** Damping coefficient c. ζ = c / (2√k); below 1 it overshoots. */
  damping: number;
}

export interface Spring {
  readonly value: number;
  readonly velocity: number;
  readonly target: number;
  /** Animate toward `target`. `instant` jumps there. */
  set(target: number, instant?: boolean): void;
  /** Change the feel mid-flight without losing velocity. */
  tune(config: SpringConfig): void;
  /** Give the spring a kick (px/s or units/s). */
  impulse(velocity: number): void;
  stop(): void;
}

interface State {
  value: number;
  target: number;
  velocity: number;
  k: number;
  c: number;
  onUpdate: (value: number, velocity: number) => void;
}

const active = new Set<State>();
let frame = 0;
let last = 0;

function step(s: State, dt: number) {
  const x = s.value - s.target;
  const v = s.velocity;
  const half = s.c / 2;
  const disc = half * half - s.k;

  if (Math.abs(disc) < 1e-6) {
    // Critically damped
    const decay = Math.exp(-half * dt);
    const b = v + half * x;
    s.value = s.target + decay * (x + b * dt);
    s.velocity = decay * (v - half * b * dt);
  } else if (disc > 0) {
    // Overdamped
    const root = Math.sqrt(disc);
    const r1 = -half + root;
    const r2 = -half - root;
    const a = (v - r2 * x) / (r1 - r2);
    const b = x - a;
    const e1 = Math.exp(r1 * dt);
    const e2 = Math.exp(r2 * dt);
    s.value = s.target + a * e1 + b * e2;
    s.velocity = a * r1 * e1 + b * r2 * e2;
  } else {
    // Underdamped: the jiggle
    const w = Math.sqrt(-disc);
    const decay = Math.exp(-half * dt);
    const cos = Math.cos(w * dt);
    const sin = Math.sin(w * dt);
    s.value = s.target + decay * (x * cos + ((v + half * x) / w) * sin);
    s.velocity = decay * (v * cos - ((half * v + s.k * x) / w) * sin);
  }
}

function loop(time: number) {
  frame = 0;
  const dt = Math.min(0.064, Math.max(0, (time - last) / 1000));
  last = time;
  for (const s of active) {
    step(s, dt);
    if (Math.abs(s.value - s.target) < 1e-4 && Math.abs(s.velocity) < 1e-3) {
      s.value = s.target;
      s.velocity = 0;
      active.delete(s);
    }
    s.onUpdate(s.value, s.velocity);
  }
  if (active.size) frame = requestAnimationFrame(loop);
}

function wake() {
  if (frame) return;
  last = performance.now();
  frame = requestAnimationFrame(loop);
}

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function createSpring(
  initial: number,
  config: SpringConfig,
  onUpdate: (value: number, velocity: number) => void,
): Spring {
  const s: State = {
    value: initial,
    target: initial,
    velocity: 0,
    k: config.stiffness,
    c: config.damping,
    onUpdate,
  };

  return {
    get value() {
      return s.value;
    },
    get velocity() {
      return s.velocity;
    },
    get target() {
      return s.target;
    },
    set(target, instant = false) {
      s.target = target;
      if (instant || prefersReducedMotion() || (typeof document !== 'undefined' && document.hidden)) {
        s.value = target;
        s.velocity = 0;
        active.delete(s);
        onUpdate(s.value, 0);
        return;
      }
      active.add(s);
      wake();
    },
    tune(next) {
      s.k = next.stiffness;
      s.c = next.damping;
    },
    impulse(velocity) {
      s.velocity += velocity;
      active.add(s);
      wake();
    },
    stop() {
      active.delete(s);
    },
  };
}

/** Converts Apple-style (response, dampingFraction) into k/c. */
export function springFrom(response: number, dampingFraction: number): SpringConfig {
  const w = (2 * Math.PI) / response;
  return { stiffness: w * w, damping: 2 * dampingFraction * w };
}

/** Feel presets tuned against iOS 26 screen recordings. */
export const SPRINGS = {
  /** Finger down: quick, almost no overshoot. */
  press: springFrom(0.22, 0.86),
  /** Finger up: soft settle with the gentle jelly wobble. */
  release: springFrom(0.42, 0.5),
  /** Following the finger during a drag. */
  drag: springFrom(0.12, 0.92),
  /** Sliding into a new slot after release. */
  snap: springFrom(0.36, 0.72),
  /** Lens inflating out of a selection pill. */
  lift: springFrom(0.26, 0.78),
  /** Lens deflating back into a pill: visibly wobbly. */
  settle: springFrom(0.45, 0.46),
  /** Colour cross-fades. */
  fade: springFrom(0.3, 1),
} as const;

/** iOS-style rubber banding for overscroll. */
export function rubberband(offset: number, dimension: number, constant = 0.55): number {
  const sign = Math.sign(offset);
  const x = Math.abs(offset);
  return sign * (1 - 1 / ((x * constant) / dimension + 1)) * dimension;
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
