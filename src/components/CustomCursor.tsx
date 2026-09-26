import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../utils/soundEngine';

export const CustomCursor: React.FC = () => {
  const [isTarget, setIsTarget] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [clickNotice, setClickNotice] = useState<string | null>(null);

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const coordTextRef = useRef<HTMLSpanElement | null>(null);
  const isTargetRef = useRef(false);
  const tooltipRef = useRef<string | null>(null);

  const clickTimesRef = useRef<number[]>([]);
  const burstStageRef = useRef<number>(0);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    if (mediaQuery.matches) {
      setIsTouch(true);
      return;
    }

    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (coordTextRef.current) {
        const xStr = String(Math.max(0, e.clientX)).padStart(3, '0');
        const yStr = String(Math.max(0, e.clientY)).padStart(3, '0');
        coordTextRef.current.textContent = `X:${xStr} / Y:${yStr}`;
      }

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactiveEl = target.closest(
        'button, a, [data-interactive="true"], [role="button"], input, label'
      ) as HTMLElement | null;
      const tooltipEl = target.closest('[data-tooltip]') as HTMLElement | null;

      const nextTarget = Boolean(interactiveEl);
      if (nextTarget !== isTargetRef.current) {
        isTargetRef.current = nextTarget;
        setIsTarget(nextTarget);
      }

      const nextTooltip = tooltipEl
        ? tooltipEl.getAttribute('data-tooltip')
        : null;
      if (nextTooltip !== tooltipRef.current) {
        tooltipRef.current = nextTooltip;
        setTooltip(nextTooltip);
      }
    };

    const handleMouseDown = () => {
      const now = Date.now();
      clickTimesRef.current = [
        ...clickTimesRef.current.filter((t) => now - t < 1100),
        now,
      ];

      if (clickTimesRef.current.length >= 3) {
        burstStageRef.current += 1;
        clickTimesRef.current = [];
        soundEngine.playGlitch(0.5);

        let msg = 'INPUT REGISTERED.';
        if (burstStageRef.current >= 3) {
          msg = 'WE HEARD YOU THE FIRST TIME.';
        }

        setClickNotice(msg);
        if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = window.setTimeout(() => {
          setClickNotice(null);
        }, 2200);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      {/* Main Reticle (Zero React re-renders on mousemove via direct ref transform) */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
        style={{
          transform: 'translate3d(-100px, -100px, 0)',
        }}
      >
        {/* Crosshair Center */}
        <div
          className={`relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-100 ${
            isTarget ? 'w-7 h-7' : 'w-4 h-4'
          }`}
        >
          {/* Outer corner brackets when targeting */}
          {isTarget && (
            <>
              <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#D6BA72]" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#D6BA72]" />
              <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#D6BA72]" />
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#D6BA72]" />
            </>
          )}

          {/* Horizontal & Vertical Hairlines */}
          <span
            className={`absolute h-[1px] transition-all duration-100 ${
              isTarget ? 'w-5 bg-[#D6BA72]' : 'w-3 bg-[#EDEDEA]/75'
            }`}
          />
          <span
            className={`absolute w-[1px] transition-all duration-100 ${
              isTarget ? 'h-5 bg-[#D6BA72]' : 'h-3 bg-[#EDEDEA]/75'
            }`}
          />

          {/* Center Pinpoint */}
          <span
            className={`w-1 h-1 ${
              isTarget ? 'bg-[#EA1D25]' : 'bg-[#EDEDEA]'
            }`}
          />
        </div>

        {/* Telemetry Readout next to Cursor */}
        <div className="ml-3.5 mt-2 flex flex-col gap-0.5 font-mono text-[9px] tracking-[0.16em] uppercase whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-[#EDEDEA]/65 bg-[#050505]/85 px-1 py-[1px] border border-[#EDEDEA]/15">
            <span
              className={
                isTarget ? 'text-[#D6BA72] font-bold' : 'text-[#EDEDEA]/50'
              }
            >
              {isTarget ? 'TARGET' : 'IDLE'}
            </span>
            <span className="text-[#EDEDEA]/30">//</span>
            <span ref={coordTextRef}>X:000 / Y:000</span>
          </div>

          {tooltip && (
            <div className="bg-[#050505] text-[#D6BA72] border border-[#B99A53]/60 px-1.5 py-0.5 text-[9px] tracking-[0.18em] animate-flicker">
              {tooltip}
            </div>
          )}
        </div>
      </div>

      {/* Rapid Click System Interjection Toast */}
      {clickNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none bg-[#050505] border border-[#EA1D25] px-4 py-2 font-mono text-xs tracking-[0.22em] text-[#EDEDEA] shadow-2xl flex items-center gap-3 animate-glitch-slice">
          <span className="w-2 h-2 bg-[#EA1D25] animate-pulse-alert" />
          <span>SYSTEM // {clickNotice}</span>
        </div>
      )}
    </>
  );
};
