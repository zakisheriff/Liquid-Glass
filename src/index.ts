// @zakisheriff/liquid-glass — Liquid glass UI components for React
// Built by Zaki Sheriff

import './styles/base.css';

// Components
export { GlassButton } from './components/GlassButton';
export type { GlassButtonProps } from './components/GlassButton';

export { GlassCard } from './components/GlassCard';
export type { GlassCardProps } from './components/GlassCard';

export { GlassInput } from './components/GlassInput';
export type { GlassInputProps } from './components/GlassInput';

export { GlassSheet } from './components/GlassSheet';
export type { GlassSheetProps } from './components/GlassSheet';

export { GlassMenu } from './components/GlassMenu';
export type { GlassMenuProps, GlassMenuItem } from './components/GlassMenu';

export { GlassNav } from './components/GlassNav';
export type { GlassNavProps, GlassNavItem } from './components/GlassNav';

export { GlassSegmented } from './components/GlassSegmented';
export type { GlassSegmentedProps, GlassSegmentedOption } from './components/GlassSegmented';

export { GlassSlider } from './components/GlassSlider';
export type { GlassSliderProps } from './components/GlassSlider';

export { GlassSwitch } from './components/GlassSwitch';
export type { GlassSwitchProps } from './components/GlassSwitch';

// Filter provider (kept for compatibility; components bake their own refraction now)
export { LiquidGlassFilter } from './filters/LiquidGlassFilter';
export type { LiquidGlassFilterProps } from './filters/LiquidGlassFilter';

// Engine (for building custom glass components)
export { useRefraction, canRefractBackdrop } from './engine/refraction';
export type { GlassShape, GlassKind } from './engine/refraction';
export { usePress } from './engine/press';
export type { PressOptions } from './engine/press';
export { createSpring, springFrom, SPRINGS } from './engine/spring';
export type { Spring, SpringConfig } from './engine/spring';
export { haptic } from './engine/haptics';

// Legacy hooks
export { useGlassEffect } from './hooks/useGlassEffect';
export type { UseGlassEffectOptions } from './hooks/useGlassEffect';

export { useGlassAnimation } from './hooks/useGlassAnimation';
export type { GlassAnimationState } from './hooks/useGlassAnimation';
