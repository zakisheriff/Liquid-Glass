import { useCallback, useState } from 'react';

export interface GlassAnimationState {
  isHovered: boolean;
  isPressed: boolean;
  isFocused: boolean;
  handlers: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onPointerDown: () => void;
    onPointerUp: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

export function useGlassAnimation(): GlassAnimationState {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handlers = {
    onPointerEnter: useCallback(() => setIsHovered(true), []),
    onPointerLeave: useCallback(() => {
      setIsHovered(false);
      setIsPressed(false);
    }, []),
    onPointerDown: useCallback(() => setIsPressed(true), []),
    onPointerUp: useCallback(() => setIsPressed(false), []),
    onFocus: useCallback(() => setIsFocused(true), []),
    onBlur: useCallback(() => setIsFocused(false), []),
  };

  return { isHovered, isPressed, isFocused, handlers };
}
