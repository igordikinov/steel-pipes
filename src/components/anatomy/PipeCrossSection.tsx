import { motion } from 'framer-motion';
import { useId } from 'react';
import {
  CANVAS_LINE,
  CANVAS_MUTED,
  CANVAS_SURFACE,
  INK_300,
  MOTION_BASE,
  MOTION_EASE,
  STEEL_BODY,
  STEEL_DEEP,
  STEEL_OUTER,
  TOKEN_BORE,
  TOKEN_COUPLING,
  TOKEN_THREAD,
} from '@/core/constants';
import {
  AXIS_Y,
  BODY_X1,
  BODY_X2,
  BORE_BOTTOM,
  BORE_TOP,
  CALLOUT_ANCHORS,
  CALLOUT_COLUMN_X,
  CALLOUT_ROWS,
  COUPLING_OVER,
  COUPLING_X1,
  COUPLING_X2,
  CROSS_SECTION_VIEWBOX,
  END_RX,
  OUTER_BOTTOM,
  OUTER_TOP,
  THREAD_TEETH,
  THREAD_X1,
  THREAD_X2,
  WALL_BOTTOM,
  WALL_TOP,
} from '@/core/pipeProfile';
import type { ConstructionPart } from '@/core/types';

export interface PipeCrossSectionProps {
  parts: ConstructionPart[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/** Thread crests, drawn along the pin end on both walls. */
const TEETH = Array.from({ length: THREAD_TEETH }, (_, index) => {
  const step = (THREAD_X2 - THREAD_X1) / THREAD_TEETH;
  return THREAD_X1 + step * index;
});

/** x of the wall dimension marks and of the outside-diameter dimension. */
const WALL_MARK_X = 168;
const OD_MARK_X = 44;

/**
 * Longitudinal cutaway of a seamless pipe, drawn the way a section is drawn:
 * hatched walls, a centre line, the bore left open.
 *
 * The two walls are deliberately unequal — that difference IS the eccentricity
 * a seamless pipe is judged by — and the right end carries the machined thread
 * with the coupling screwed over it.
 */
export function PipeCrossSection({ parts, selectedId }: PipeCrossSectionProps) {
  const hatchId = `hatch-${useId()}`;
  const isOn = (id: string) => selectedId === id;
  const colorOf = (id: string) => parts.find((part) => part.id === id)?.color ?? STEEL_DEEP;

  const wallStroke = isOn('wall') ? colorOf('wall') : STEEL_DEEP;
  const wallWidth = isOn('wall') ? 3 : 1.2;

  return (
    <div className="flex h-full w-full items-center justify-center p-1">
      <svg viewBox={CROSS_SECTION_VIEWBOX} className="h-full w-full" role="img" aria-label="Разрез бесшовной трубы">
        <defs>
          <pattern id={hatchId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill={STEEL_BODY} />
            <line x1="0" y1="0" x2="0" y2="8" stroke={STEEL_DEEP} strokeWidth="1.1" opacity="0.55" />
          </pattern>
        </defs>

        {/* Bore: the void the piercing mill opened. */}
        <rect
          x={BODY_X1}
          y={BORE_TOP}
          width={COUPLING_X2 - BODY_X1}
          height={BORE_BOTTOM - BORE_TOP}
          fill={TOKEN_BORE}
          opacity={isOn('bore') ? 0.5 : 0.3}
          stroke={isOn('bore') ? colorOf('bore') : 'none'}
          strokeWidth={isOn('bore') ? 3 : 0}
        />
        {/* Centre line — the axis the whole process is built around. */}
        <line
          x1={BODY_X1 - 30}
          x2={COUPLING_X2 + 24}
          y1={AXIS_Y}
          y2={AXIS_Y}
          stroke={INK_300}
          strokeWidth={1}
          strokeDasharray="14 4 3 4"
        />

        {/* Walls, hatched as a cut section. */}
        <rect
          x={BODY_X1}
          y={OUTER_TOP}
          width={BODY_X2 - BODY_X1}
          height={WALL_TOP}
          fill={`url(#${hatchId})`}
          stroke={wallStroke}
          strokeWidth={wallWidth}
        />
        <rect
          x={BODY_X1}
          y={OUTER_BOTTOM - WALL_BOTTOM}
          width={BODY_X2 - BODY_X1}
          height={WALL_BOTTOM}
          fill={`url(#${hatchId})`}
          stroke={wallStroke}
          strokeWidth={wallWidth}
        />

        {/* Outer skin: the surface UT and EMI actually inspect. */}
        {[OUTER_TOP, OUTER_BOTTOM].map((y) => (
          <line
            key={y}
            x1={BODY_X1}
            x2={COUPLING_X2}
            y1={y}
            y2={y}
            stroke={isOn('surface') ? colorOf('surface') : STEEL_OUTER}
            strokeWidth={isOn('surface') ? 5 : 2.4}
            strokeLinecap="round"
          />
        ))}

        {/* Cut face at the left end: the annulus, seen slightly turned. */}
        <ellipse cx={BODY_X1} cy={AXIS_Y} rx={END_RX} ry={(OUTER_BOTTOM - OUTER_TOP) / 2} fill={STEEL_OUTER} />
        <ellipse
          cx={BODY_X1}
          cy={AXIS_Y + (WALL_TOP - WALL_BOTTOM) / 2}
          rx={END_RX * 0.62}
          ry={(BORE_BOTTOM - BORE_TOP) / 2}
          fill={TOKEN_BORE}
          opacity={0.55}
        />

        {/* Outside diameter, the dimension the pipe is ordered by. */}
        <g opacity={0.85}>
          <line x1={OD_MARK_X} x2={OD_MARK_X} y1={OUTER_TOP} y2={OUTER_BOTTOM} stroke={CANVAS_MUTED} strokeWidth={1.2} />
          {[OUTER_TOP, OUTER_BOTTOM].map((y) => (
            <line key={y} x1={OD_MARK_X - 6} x2={OD_MARK_X + 6} y1={y} y2={y} stroke={CANVAS_MUTED} strokeWidth={1.4} />
          ))}
          <text
            x={OD_MARK_X - 10}
            y={AXIS_Y}
            fontSize={11}
            fontWeight={700}
            textAnchor="middle"
            fill={CANVAS_MUTED}
            transform={`rotate(-90 ${OD_MARK_X - 10} ${AXIS_Y})`}
            fontFamily="'Open Sans', sans-serif"
          >
            наружный диаметр
          </text>
        </g>

        {/* Wall marks: the top wall is the nominal, the bottom one carries the
            eccentricity — the pair is the whole point of the drawing. */}
        {(
          [
            { id: 'wall', y1: OUTER_TOP, y2: BORE_TOP, label: 'стенка' },
            { id: 'eccentricity', y1: BORE_BOTTOM, y2: OUTER_BOTTOM, label: 'разностенность' },
          ] as const
        ).map(({ id, y1, y2, label }) => {
          const active = isOn(id);
          const accent = active ? colorOf(id) : CANVAS_MUTED;
          return (
            <g key={id} opacity={active ? 1 : 0.75}>
              <line x1={WALL_MARK_X} x2={WALL_MARK_X} y1={y1} y2={y2} stroke={accent} strokeWidth={active ? 2.4 : 1.4} />
              {[y1, y2].map((y) => (
                <line key={y} x1={WALL_MARK_X - 6} x2={WALL_MARK_X + 6} y1={y} y2={y} stroke={accent} strokeWidth={1.4} />
              ))}
              <text
                x={WALL_MARK_X + 10}
                y={id === 'wall' ? y1 - 6 : y2 + 14}
                fontSize={11}
                fontWeight={700}
                fill={accent}
                fontFamily="'Open Sans', sans-serif"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Machined thread on the pin end. */}
        <g>
          {TEETH.map((x) => (
            <g key={x}>
              <path
                d={`M ${x} ${OUTER_TOP} l 5 7 l 5 -7`}
                fill="none"
                stroke={isOn('thread') ? colorOf('thread') : TOKEN_THREAD}
                strokeWidth={isOn('thread') ? 3 : 2}
                strokeLinecap="round"
              />
              <path
                d={`M ${x} ${OUTER_BOTTOM} l 5 -7 l 5 7`}
                fill="none"
                stroke={isOn('thread') ? colorOf('thread') : TOKEN_THREAD}
                strokeWidth={isOn('thread') ? 3 : 2}
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>

        {/* Coupling screwed over the pin; translucent so the thread stays visible. */}
        <rect
          x={COUPLING_X1}
          y={OUTER_TOP - COUPLING_OVER}
          width={COUPLING_X2 - COUPLING_X1}
          height={OUTER_BOTTOM - OUTER_TOP + COUPLING_OVER * 2}
          rx={6}
          fill={TOKEN_COUPLING}
          opacity={isOn('coupling') ? 0.55 : 0.28}
          stroke={isOn('coupling') ? colorOf('coupling') : STEEL_DEEP}
          strokeWidth={isOn('coupling') ? 3 : 1.2}
        />
        {/* Metal-to-metal seal shoulder inside the coupling. */}
        {parts.some((part) => part.id === 'seal') ? (
          <path
            d={`M ${COUPLING_X1 + 8} ${BORE_TOP} L ${COUPLING_X1 + 26} ${OUTER_TOP + 3}`}
            fill="none"
            stroke={isOn('seal') ? colorOf('seal') : CANVAS_SURFACE}
            strokeWidth={isOn('seal') ? 4 : 2.4}
            strokeLinecap="round"
          />
        ) : null}

        {/* Numbered callouts, one column on the right. */}
        {parts.map((part) => {
          const anchor = CALLOUT_ANCHORS[part.id];
          const row = CALLOUT_ROWS[part.id];
          if (!anchor || row === undefined) return null;
          const active = isOn(part.id);
          return (
            <g key={part.id} opacity={selectedId && !active ? 0.3 : 1}>
              <path
                d={`M ${anchor.x} ${anchor.y} L ${CALLOUT_COLUMN_X - 28} ${row}`}
                fill="none"
                stroke={active ? part.color : INK_300}
                strokeWidth={active ? 1.8 : 1}
                strokeDasharray={active ? '' : '4 4'}
              />
              <circle cx={anchor.x} cy={anchor.y} r={active ? 4.6 : 3} fill={active ? part.color : CANVAS_MUTED} />
              <motion.circle
                cx={CALLOUT_COLUMN_X - 14}
                cy={row}
                r={13}
                fill={active ? part.color : CANVAS_SURFACE}
                stroke={active ? part.color : CANVAS_LINE}
                strokeWidth={1.6}
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: MOTION_BASE, ease: MOTION_EASE }}
              />
              <text
                x={CALLOUT_COLUMN_X - 14}
                y={row + 4.5}
                fontSize={13}
                fontWeight={700}
                textAnchor="middle"
                fill={active ? CANVAS_SURFACE : CANVAS_MUTED}
                fontFamily="'Open Sans', sans-serif"
              >
                {part.index}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
