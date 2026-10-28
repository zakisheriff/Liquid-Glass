import React from 'react';

export interface SymbolProps extends React.HTMLAttributes<HTMLSpanElement> {
  source: string;
  size?: number;
}

/** A monochrome symbol mask: inherits the control's colour in either theme. */
export function Symbol({ source, size = 24, className, style, ...props }: SymbolProps) {
  const mask = `url("${source}")`;
  return (
    <span
      aria-hidden="true"
      {...props}
      className={['lg-symbol', className].filter(Boolean).join(' ')}
      style={{ '--lg-symbol-size': `${size}px`, WebkitMaskImage: mask, maskImage: mask, ...style } as React.CSSProperties}
    />
  );
}
