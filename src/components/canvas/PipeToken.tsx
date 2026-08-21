import { motion } from 'framer-motion';
import { memo } from 'react';
import {
  CANVAS_SURFACE,
  HOT_GLOW,
  MOTION_BASE,
  MOTION_EASE,
  TOKEN_BORE,
  TOKEN_COLD_BODY,
  TOKEN_COLD_EDGE,
  TOKEN_COUPLING,
  TOKEN_HOT_BODY,
  TOKEN_HOT_EDGE,
  TOKEN_LENGTH,
  TOKEN_THICKNESS,
  TOKEN_THREAD,
  TOKEN_WARM_BODY,
  TOKEN_WARM_EDGE,
} from '@/core/constants';

export interface PipeTokenProps {
  x: number;
  y: number;
  /**
   * Appearance stage, one per `transformsAppearance` node passed:
   * 0 cold billet → 1 heated billet → 2 hot shell → 3 cold pipe →
   * 4 threaded pipe → 5 pipe with a coupling.
   */
  stage: number;
  /** Variant token colour used to tint the edge; falls back to the steel edge. */
  variantColor?: string;
  moving: boolean;
  highlighted: boolean;
  dimmed: boolean;
}

const HALF_L = TOKEN_LENGTH / 2;
const HALF_T = TOKEN_THICKNESS / 2;

/** Thread crests machined on both ends of the pipe. */
const THREAD_TICKS = [0, 1, 2];

/**
 * One physical pipe, drawn lying on its side. Position is driven by the engine
 * while moving and by eased transitions while queueing, so pipes roll in
 * instead of teleporting. Appearance tracks the process: a cold billet leaves
 * the furnace glowing, the piercing mill opens the bore, the cooling bed turns
 * it back to steel grey, and the threading line cuts the connection.
 */
export const PipeToken = memo(function PipeToken({
  x,
  y,
  stage,
  variantColor,
  moving,
  highlighted,
  dimmed,
}: PipeTokenProps) {
  const hot = stage >= 1 && stage < 3;
  const hollow = stage >= 2;
  const threaded = stage >= 4;
  const coupled = stage >= 5;

  // 1 = billet straight out of the furnace, 2 = shell already rolled and cooling.
  const body = stage === 1 ? TOKEN_HOT_BODY : stage === 2 ? TOKEN_WARM_BODY : TOKEN_COLD_BODY;
  const edgeBase = stage === 1 ? TOKEN_HOT_EDGE : stage === 2 ? TOKEN_WARM_EDGE : TOKEN_COLD_EDGE;
  const edge = variantColor && !hot ? variantColor : edgeBase;

  return (
    <motion.g
      initial={{ x, y, scale: 0.3, opacity: 0 }}
      animate={{
        x,
        y,
        scale: highlighted ? 1.16 : 1,
        opacity: dimmed ? 0.35 : 1,
      }}
      transition={
        moving
          ? { x: { duration: 0 }, y: { duration: 0 }, scale: { duration: MOTION_BASE }, opacity: { duration: MOTION_BASE } }
          : { duration: MOTION_BASE, ease: MOTION_EASE }
      }
    >
      {/* Steel above 900 °C radiates — the halo is the only cue that reads at token size. */}
      {hot ? (
        <motion.rect
          x={-HALF_L - 3}
          y={-HALF_T - 3}
          width={TOKEN_LENGTH + 6}
          height={TOKEN_THICKNESS + 6}
          rx={HALF_T + 3}
          fill={HOT_GLOW}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.16, 0.4, 0.16] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}

      <rect
        x={-HALF_L}
        y={-HALF_T}
        width={TOKEN_LENGTH}
        height={TOKEN_THICKNESS}
        rx={3}
        fill={body}
        stroke={edge}
        strokeWidth={1.4}
      />
      {/* Specular line along the top: without it a flat rect never reads as a cylinder. */}
      <line
        x1={-HALF_L + 3}
        x2={HALF_L - 3}
        y1={-HALF_T + 2.4}
        y2={-HALF_T + 2.4}
        stroke={CANVAS_SURFACE}
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={hot ? 0.45 : 0.32}
      />

      {/* The bore only exists after the piercing mill. */}
      {hollow
        ? [-HALF_L + 1.2, HALF_L - 1.2].map((cx) => (
            <ellipse key={cx} cx={cx} cy={0} rx={1.5} ry={HALF_T - 1.6} fill={TOKEN_BORE} opacity={0.85} />
          ))
        : null}

      {/* Threads are cut on both ends before the coupling goes on. */}
      {threaded
        ? THREAD_TICKS.flatMap((index) =>
            [-1, 1].map((side) => (
              <line
                key={`${side}-${index}`}
                x1={side * (HALF_L - 2.4 - index * 2)}
                x2={side * (HALF_L - 2.4 - index * 2)}
                y1={-HALF_T + 1.4}
                y2={HALF_T - 1.4}
                stroke={TOKEN_THREAD}
                strokeWidth={1}
                strokeLinecap="round"
                opacity={0.9}
              />
            )),
          )
        : null}

      {/* One end carries the coupling screwed on at the bucking stand. */}
      {coupled ? (
        <rect
          x={HALF_L - 7}
          y={-HALF_T - 1.6}
          width={7}
          height={TOKEN_THICKNESS + 3.2}
          rx={2}
          fill={TOKEN_COUPLING}
          stroke={edge}
          strokeWidth={0.9}
        />
      ) : null}
    </motion.g>
  );
});
