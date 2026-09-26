import React from 'react';

// Exact 1:1 pixel-space path traced from the official 768x1024 Vendex sigil
export const VENDEX_SVG_PATH =
  'M 384 382 L 354 342 L 354 226 L 296 186 L 296 320 L 211 320 L 222 382 L 314 382 L 343 421 L 314 460 L 234 460 L 245 522 L 296 522 L 365 838 L 379 838 L 355 514 L 384 475 L 413 514 L 389 838 L 403 838 L 472 522 L 523 522 L 534 460 L 454 460 L 425 421 L 454 382 L 546 382 L 557 320 L 472 320 L 472 186 L 414 226 L 414 342 Z';

interface VendexSymbolProps {
  size?: number;
  color?: string;
  className?: string;
  glitch?: boolean;
  abstractStage?: number; // 0 = tiny abstract core, 1 = partial, 2 = full Vendex symbol
}

export const VendexSymbol: React.FC<VendexSymbolProps> = ({
  size = 44,
  color = 'currentColor',
  className = '',
  glitch = false,
  abstractStage = 2,
}) => {
  const height = Math.round(size * 1.83);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${
        glitch ? 'animate-glitch-slice' : ''
      } ${className}`}
      style={{ width: size, height }}
      aria-label="VENDEX SIGIL"
    >
      <svg
        viewBox="200 175 368 675"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block overflow-visible"
      >
        {abstractStage === 0 && (
          /* Stage 0: Minimal abstract geometric seed in center */
          <g stroke={color} strokeWidth="10">
            <polygon
              points="384,360 435,421 384,482 333,421"
              fill={color}
            />
            <line
              x1="384"
              y1="240"
              x2="384"
              y2="660"
              strokeOpacity="0.45"
            />
            <line
              x1="250"
              y1="421"
              x2="518"
              y2="421"
              strokeOpacity="0.45"
            />
          </g>
        )}

        {abstractStage === 1 && (
          /* Stage 1: Partial structural emergence */
          <g stroke={color} strokeWidth="8" fill="none">
            <path d={VENDEX_SVG_PATH} strokeDasharray="24 14" />
          </g>
        )}

        {abstractStage >= 2 && (
          /* Stage 2: Exact Official Undistorted Vendex Sigil */
          <path d={VENDEX_SVG_PATH} fill={color} />
        )}
      </svg>
    </div>
  );
};
