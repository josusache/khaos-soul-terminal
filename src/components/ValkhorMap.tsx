import React, { useEffect, useRef, useState } from 'react';
import { WORLD_PROFILES } from '../data/valkhorData';
import { ResonanceWorld, SoulState } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';

interface ValkhorMapProps {
  soulState: SoulState;
}

type MapNodeId = ResonanceWorld | 'SINGULARITY' | 'KHAOS_DIMENSION';

interface PlanetNodeInfo {
  id: MapNodeId;
  label: string;
  orbitRadius: number;
  baseAngle: number;
  speed: number;
  distance: string;
  population: string;
  signal: string;
  status: string;
  notes: string;
}

const PLANET_NODES: PlanetNodeInfo[] = [
  {
    id: 'IGNHUM',
    label: 'IGNHUM',
    orbitRadius: 105,
    baseAngle: 0.4,
    speed: 0.00055,
    distance: 'N/A // THERMAL VECTOR',
    population: 'UNKNOWN',
    signal: 'ACTIVE // 154.8 HZ',
    status: 'VOLATILE',
    notes: 'CIVILIZATION OF PASSION, FIRE, AND INSTINCTUAL TRANSFORMATION.',
  },
  {
    id: 'DESERT',
    label: 'DESERT',
    orbitRadius: 150,
    baseAngle: 2.1,
    speed: 0.00038,
    distance: 'N/A // ZERO HORIZON',
    population: 'UNKNOWN',
    signal: 'ACTIVE // 43.2 HZ',
    status: 'SILENT',
    notes: 'DOMAIN OF INTROSPECTION, VOID PERCEPTION, AND INNER CONSCIOUSNESS.',
  },
  {
    id: 'ICE',
    label: 'ICE',
    orbitRadius: 195,
    baseAngle: 3.8,
    speed: 0.00027,
    distance: 'N/A // CRYOGENIC PLANE',
    population: 'UNKNOWN',
    signal: 'ACTIVE // 88.0 HZ',
    status: 'STABLE',
    notes: 'FORTRESS OF ENDURANCE, DISCIPLINE, AND EMOTIONAL CONTROL.',
  },
  {
    id: 'MECHANICAL',
    label: 'MECHANICAL',
    orbitRadius: 240,
    baseAngle: 5.2,
    speed: 0.0002,
    distance: 'N/A // SYNTHETIC GRID',
    population: 'UNKNOWN',
    signal: 'ACTIVE // 212.4 HZ',
    status: 'EVOLVING',
    notes: 'NEXUS OF KNOWLEDGE, CURIOUS INTELLECT, AND TECHNICAL EVOLUTION.',
  },
];

export const ValkhorMap: React.FC<ValkhorMapProps> = ({ soulState }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotationOffset, setRotationOffset] = useState<number>(0);
  const [selectedNode, setSelectedNode] = useState<MapNodeId>(
    soulState.resonance || 'IGNHUM'
  );
  const [hoveredNode, setHoveredNode] = useState<MapNodeId | null>(null);
  const [leavingStage, setLeavingStage] = useState<0 | 1 | 2>(0);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const nodeScreenPositionsRef = useRef<
    { id: MapNodeId; x: number; y: number; r: number }[]
  >([]);

  const isSingularityBreach = zoom >= 2.1 || selectedNode === 'SINGULARITY';

  // Trigger two-step message when approaching the White Hole Singularity (Section 24)
  useEffect(() => {
    if (!isSingularityBreach) {
      setLeavingStage(0);
      return;
    }

    soundEngine.playGlitch(0.9);
    setLeavingStage(1);
    const t = window.setTimeout(() => {
      soundEngine.playVendexPulse();
      setLeavingStage(2);
    }, 1100);

    return () => clearTimeout(t);
  }, [isSingularityBreach]);

  // Render Dimensional Astrometric Map on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const renderMap = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const w = canvas.width;
      const h = canvas.height;

      // Apply slight jitter when breaching the singularity
      const breachJitterX = isSingularityBreach ? (Math.random() - 0.5) * 6 : 0;
      const breachJitterY = isSingularityBreach ? (Math.random() - 0.5) * 6 : 0;

      const cx = w / 2 + pan.x + breachJitterX;
      const cy = h / 2 + pan.y + breachJitterY;

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);

      // Astrometric coordinate crosshairs
      ctx.strokeStyle = isSingularityBreach
        ? 'rgba(234, 29, 37, 0.16)'
        : 'rgba(237, 237, 234, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();

      // Outer Plane: KHAOS DIMENSION (UNMAPPED)
      const khaosRadius = 295 * zoom;
      ctx.save();
      ctx.strokeStyle =
        selectedNode === 'KHAOS_DIMENSION'
          ? '#D6BA72'
          : 'rgba(185, 154, 83, 0.32)';
      ctx.lineWidth = selectedNode === 'KHAOS_DIMENSION' ? 1.8 : 1;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, khaosRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Outer KHAOS DIMENSION label on ring
      ctx.fillStyle = '#D6BA72';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(
        'OUTER PLANE // KHAOS DIMENSION [STATUS: UNMAPPED]',
        cx - 145,
        cy - khaosRadius - 10
      );
      ctx.restore();

      const currentPositions: {
        id: MapNodeId;
        x: number;
        y: number;
        r: number;
      }[] = [];

      // Center WHITE HOLE SINGULARITY
      const coreRadius = 28 * zoom;
      const coreGrad = ctx.createRadialGradient(
        cx,
        cy,
        2,
        cx,
        cy,
        coreRadius * 3.2
      );
      coreGrad.addColorStop(0, '#F5F5F0');
      coreGrad.addColorStop(0.28, 'rgba(245, 245, 240, 0.85)');
      coreGrad.addColorStop(
        0.55,
        isSingularityBreach
          ? 'rgba(234, 29, 37, 0.35)'
          : 'rgba(214, 186, 114, 0.22)'
      );
      coreGrad.addColorStop(1, 'rgba(5, 5, 5, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Accretion Horizon Ring
      ctx.strokeStyle = '#F5F5F0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      currentPositions.push({
        id: 'SINGULARITY',
        x: cx,
        y: cy,
        r: Math.max(24, coreRadius),
      });

      // Orbiting 4 Worlds
      PLANET_NODES.forEach((planet) => {
        const r = planet.orbitRadius * zoom;
        const angle =
          planet.baseAngle + time * planet.speed + rotationOffset;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;

        const isSelected = selectedNode === planet.id;
        const isHovered = hoveredNode === planet.id;

        // Orbit Ring
        ctx.strokeStyle = isSelected
          ? 'rgba(214, 186, 114, 0.4)'
          : 'rgba(237, 237, 234, 0.12)';
        ctx.lineWidth = isSelected ? 1.2 : 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Vector tether to Singularity when selected
        if (isSelected || isHovered) {
          ctx.strokeStyle = 'rgba(214, 186, 114, 0.35)';
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(px, py);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Planet Node Body
        const nodeRad = (isSelected ? 9 : 6.5) * Math.min(1.6, Math.max(0.85, zoom));
        ctx.fillStyle =
          planet.id === 'IGNHUM'
            ? '#EA1D25'
            : planet.id === 'DESERT' || planet.id === 'MECHANICAL'
            ? '#D6BA72'
            : '#F5F5F0';
        ctx.beginPath();
        ctx.arc(px, py, nodeRad, 0, Math.PI * 2);
        ctx.fill();

        // Selection Reticle Brackets
        if (isSelected || isHovered) {
          ctx.strokeStyle = '#D6BA72';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(
            px - nodeRad - 6,
            py - nodeRad - 6,
            (nodeRad + 6) * 2,
            (nodeRad + 6) * 2
          );
        }

        // Label
        ctx.fillStyle = isSelected ? '#D6BA72' : '#EDEDEA';
        ctx.font = `${isSelected ? 'bold ' : ''}11px "JetBrains Mono", monospace`;
        ctx.fillText(planet.label, px + nodeRad + 10, py + 4);

        currentPositions.push({
          id: planet.id,
          x: px,
          y: py,
          r: Math.max(20, nodeRad + 10),
        });
      });

      nodeScreenPositionsRef.current = currentPositions;
      animId = requestAnimationFrame(renderMap);
    };

    animId = requestAnimationFrame(renderMap);
    return () => cancelAnimationFrame(animId);
  }, [zoom, pan, rotationOffset, selectedNode, hoveredNode, isSingularityBreach]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Check if user clicked on a node
    for (const node of nodeScreenPositionsRef.current) {
      if (Math.hypot(mx - node.x, my - node.y) <= node.r) {
        soundEngine.playClick(1300);
        setSelectedNode(node.id);
        return;
      }
    }

    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isDraggingRef.current) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
      return;
    }

    let foundHover: MapNodeId | null = null;
    for (const node of nodeScreenPositionsRef.current) {
      if (Math.hypot(mx - node.x, my - node.y) <= node.r) {
        foundHover = node.id;
        break;
      }
    }
    setHoveredNode(foundHover);
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.18 : -0.18;
    setZoom((prev) => Number(Math.min(3.0, Math.max(0.55, prev + delta)).toFixed(2)));
  };

  const activePlanet = PLANET_NODES.find((p) => p.id === selectedNode);

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.26em] text-[#8E7443]">
            NODE 03 // ASTROMETRIC TOPOLOGY
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
            VALKHOR DIMENSION MAP
          </h1>
        </div>

        {/* Interactive Map Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.2em]">
          <button
            onClick={() => {
              soundEngine.playClick();
              setZoom((z) => Math.min(3.0, Number((z + 0.35).toFixed(2))));
            }}
            className="px-3 py-2 border border-[#EDEDEA]/25 hover:border-[#D6BA72] text-[#EDEDEA]"
          >
            ZOOM +
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setZoom((z) => Math.max(0.6, Number((z - 0.35).toFixed(2))));
            }}
            className="px-3 py-2 border border-[#EDEDEA]/25 hover:border-[#D6BA72] text-[#EDEDEA]"
          >
            ZOOM -
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setRotationOffset((r) => r + 0.65);
            }}
            className="px-3 py-2 border border-[#EDEDEA]/25 hover:border-[#D6BA72] text-[#EDEDEA]"
          >
            ROTATE ORBIT
          </button>
          <button
            onClick={() => {
              soundEngine.playAlarm();
              setSelectedNode('SINGULARITY');
              setZoom(2.45);
              setPan({ x: 0, y: 0 });
            }}
            className="px-3 py-2 border border-[#EA1D25]/60 bg-[#B5161B]/15 hover:bg-[#B5161B]/30 text-[#EA1D25] font-bold"
          >
            ENTER SINGULARITY
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setZoom(1);
              setPan({ x: 0, y: 0 });
              setSelectedNode(soulState.resonance || 'IGNHUM');
            }}
            className="px-3 py-2 border border-[#EDEDEA]/20 text-[#EDEDEA]/60 hover:text-[#EDEDEA]"
          >
            RESET OPTICS
          </button>
        </div>
      </div>

      {/* Main Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive Canvas Map */}
        <div
          className={`lg:col-span-8 border bg-[#050505] relative min-h-[480px] flex flex-col justify-between overflow-hidden ${
            isSingularityBreach
              ? 'border-[#EA1D25] animate-glitch-slice'
              : 'border-[#EDEDEA]/15'
          }`}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onWheel={handleWheel}
            className="w-full h-[480px] block"
          />

          {/* Top-left Live Coordinate Telemetry (Breaks when too close to center!) */}
          <div className="absolute top-4 left-4 pointer-events-none bg-[#050505]/90 border border-[#EDEDEA]/20 p-3 font-mono text-[10px] tracking-[0.2em] space-y-1">
            <div className="text-[#8E7443] mb-1">DIMENSIONAL TELEMETRY //</div>
            <div className={isSingularityBreach ? 'text-[#EA1D25] font-bold' : 'text-[#EDEDEA]/80'}>
              X // {isSingularityBreach ? 'N/A' : `${(pan.x * 0.42).toFixed(2)} AU`}
            </div>
            <div className={isSingularityBreach ? 'text-[#EA1D25] font-bold' : 'text-[#EDEDEA]/80'}>
              Y // {isSingularityBreach ? 'N/A' : `${(pan.y * 0.42).toFixed(2)} AU`}
            </div>
            <div className={isSingularityBreach ? 'text-[#EA1D25] font-bold' : 'text-[#EDEDEA]/80'}>
              Z // {isSingularityBreach ? 'N/A' : `${(zoom * 14.08).toFixed(2)} KD`}
            </div>
            <div className={isSingularityBreach ? 'text-[#EA1D25] font-bold' : 'text-[#D6BA72]'}>
              TIME // {isSingularityBreach ? 'N/A' : 'NON-LINEAR'}
            </div>
          </div>

          {/* Singularity Proximity Breakdown Warning Overlay (Section 24) */}
          {isSingularityBreach && (
            <div className="absolute bottom-14 inset-x-4 sm:inset-x-12 pointer-events-none bg-[#050505]/95 border-2 border-[#EA1D25] p-5 text-center space-y-2 z-20">
              <div className="font-mono text-xs tracking-[0.32em] text-[#EA1D25] animate-pulse-alert">
                CRITICAL PROXIMITY // WHITE HOLE CORE
              </div>
              <div className="font-display text-2xl sm:text-3xl font-bold tracking-[0.26em] text-[#EDEDEA]">
                PHYSICAL COORDINATES INVALID.
              </div>
              {leavingStage >= 2 && (
                <div className="font-mono text-xs sm:text-sm tracking-[0.26em] text-[#D6BA72] font-bold pt-1 gold-phosphor">
                  YOU ARE LEAVING THE SENSIBLE WORLD.
                </div>
              )}
            </div>
          )}

          {/* Bottom Node Selector Strip */}
          <div className="border-t border-[#EDEDEA]/15 bg-[#080808] p-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[0.18em]">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  'IGNHUM',
                  'DESERT',
                  'ICE',
                  'MECHANICAL',
                  'SINGULARITY',
                  'KHAOS_DIMENSION',
                ] as MapNodeId[]
              ).map((nId) => (
                <button
                  key={nId}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedNode(nId);
                    if (nId === 'SINGULARITY') setZoom(2.35);
                    else if (zoom >= 2.1) setZoom(1.1);
                  }}
                  className={`px-2.5 py-1 border transition-colors ${
                    selectedNode === nId
                      ? 'border-[#D6BA72] bg-[#B99A53]/20 text-[#D6BA72]'
                      : 'border-[#EDEDEA]/15 text-[#EDEDEA]/60 hover:text-[#EDEDEA]'
                  }`}
                >
                  {nId === 'KHAOS_DIMENSION' ? 'KHAOS PLANE' : nId}
                </button>
              ))}
            </div>
            <span className="text-[#EDEDEA]/35 hidden sm:inline">
              DRAG TO PAN // SCROLL TO ZOOM
            </span>
          </div>
        </div>

        {/* Right 4 Cols: Selected Node Dossier */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 space-y-4">
            <div className="font-mono text-[10px] tracking-[0.24em] text-[#D6BA72] border-b border-[#EDEDEA]/15 pb-2.5 flex justify-between">
              <span>SECTOR TELEMETRY</span>
              <span>OPTIC LOCK</span>
            </div>

            {activePlanet ? (
              <>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.2em] text-[#EDEDEA]/45">
                    DESIGNATION //
                  </div>
                  <h2 className="font-display text-4xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
                    {activePlanet.label}
                  </h2>
                </div>

                <div className="space-y-2.5 font-mono text-xs tracking-[0.18em]">
                  <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3 flex justify-between">
                    <span className="text-[#EDEDEA]/50">DISTANCE //</span>
                    <span className="text-[#EDEDEA] font-bold">N/A</span>
                  </div>
                  <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3 flex justify-between">
                    <span className="text-[#EDEDEA]/50">POPULATION //</span>
                    <span className="text-[#EDEDEA] font-bold">
                      {activePlanet.population}
                    </span>
                  </div>
                  <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3 flex justify-between">
                    <span className="text-[#EDEDEA]/50">SIGNAL //</span>
                    <span className="text-[#D6BA72] font-bold">ACTIVE</span>
                  </div>
                  <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3 flex justify-between">
                    <span className="text-[#EDEDEA]/50">PRIMARY FORCE //</span>
                    <span className="text-[#D6BA72] font-bold">
                      {WORLD_PROFILES[activePlanet.id as ResonanceWorld].primaryForce}
                    </span>
                  </div>
                </div>

                <p className="font-mono text-xs tracking-[0.15em] text-[#EDEDEA]/75 leading-relaxed pt-2 border-t border-[#EDEDEA]/10">
                  {activePlanet.notes}
                </p>
              </>
            ) : selectedNode === 'SINGULARITY' ? (
              <div className="space-y-4">
                <h2 className="font-display text-3xl font-bold tracking-[0.24em] text-[#EA1D25]">
                  WHITE HOLE SINGULARITY
                </h2>
                <div className="space-y-2 font-mono text-xs tracking-[0.18em]">
                  <div className="border border-[#EA1D25]/40 bg-[#050505] p-3 flex justify-between">
                    <span className="text-[#EDEDEA]/50">COORDINATES //</span>
                    <span className="text-[#EA1D25] font-bold">INVALID</span>
                  </div>
                  <div className="border border-[#EA1D25]/40 bg-[#050505] p-3 flex justify-between">
                    <span className="text-[#EDEDEA]/50">GRAVITY //</span>
                    <span className="text-[#D6BA72] font-bold">INVERTED</span>
                  </div>
                </div>
                <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/80 leading-relaxed">
                  THE CENTRAL NEXUS OF VALKHOR. ALL PHYSICAL MEASUREMENTS COLLAPSE AT THE EVENT HORIZON.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="font-display text-3xl font-bold tracking-[0.24em] text-[#D6BA72]">
                  KHAOS DIMENSION
                </h2>
                <div className="space-y-2 font-mono text-xs tracking-[0.18em]">
                  <div className="border border-[#B99A53]/40 bg-[#050505] p-3 flex justify-between">
                    <span className="text-[#EDEDEA]/50">STATUS //</span>
                    <span className="text-[#EA1D25] font-bold">UNMAPPED</span>
                  </div>
                  <div className="border border-[#B99A53]/40 bg-[#050505] p-3 flex justify-between">
                    <span className="text-[#EDEDEA]/50">ENTITIES //</span>
                    <span className="text-[#D6BA72] font-bold">GODS OF KHAOS</span>
                  </div>
                </div>
                <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/80 leading-relaxed">
                  BEYOND THE FOUR ORBITS LIES THE INCORPOREAL REALM. HUMAN INSTRUMENTS CANNOT RENDER ITS GEOMETRY.
                </p>
              </div>
            )}
          </div>

          <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4 font-mono text-[11px] tracking-[0.16em] text-[#EDEDEA]/65">
            <div className="text-[#D6BA72] text-[10px] mb-1">
              VENDEX // OBSERVATION
            </div>
            EARTH IS MERELY A FRAGMENT DRIFTING IN THE DARK. YOUR ORIGIN LIES BEYOND THIS HORIZON.
          </div>
        </div>
      </div>
    </div>
  );
};
