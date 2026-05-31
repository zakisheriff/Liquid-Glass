// @zakisheriff/liquid-glass — Liquid glass UI components for React
// Built by Zaki Sheriff

// Components
export { GlassButton } from './components/GlassButton';
export type { GlassButtonProps } from './components/GlassButton';

export { GlassCard } from './components/GlassCard';
export type { GlassCardProps } from './components/GlassCard';

export { GlassInput } from './components/GlassInput';
export type { GlassInputProps } from './components/GlassInput';

export { GlassSheet } from './components/GlassSheet';
export type { GlassSheetProps } from './components/GlassSheet';

export { GlassNav } from './components/GlassNav';
export type { GlassNavProps } from './components/GlassNav';

export { GlassSlider } from './components/GlassSlider';
export type { GlassSliderProps } from './components/GlassSlider';


// Filter provider (for advanced usage)
export { LiquidGlassFilter } from './filters/LiquidGlassFilter';
export type { LiquidGlassFilterProps } from './filters/LiquidGlassFilter';

// Hooks (for building custom glass components)
export { useGlassEffect } from './hooks/useGlassEffect';
export type { UseGlassEffectOptions } from './hooks/useGlassEffect';

export { useGlassAnimation } from './hooks/useGlassAnimation';
export type { GlassAnimationState } from './hooks/useGlassAnimation';

// Base styles (import separately: '@zakisheriff/liquid-glass/styles.css')
import './styles/base.css';
