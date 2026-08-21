import { motion } from 'framer-motion';
import { MOTION_BASE, MOTION_EASE } from '@/core/constants';
import type { MachineKind } from '@/core/types';
import { MACHINE_IMAGES } from './machineImages';

/** Render box shared with the SVG machines, so every station lines up. */
const IMAGE_X = -84;
const IMAGE_Y = -70;
const IMAGE_W = 168;
const IMAGE_H = 116;

export interface MachineImageProps {
  kind: MachineKind;
  /** The station is processing a unit right now. */
  active: boolean;
  accent: string;
  /** TOC mode is on and this station is not the constraint. */
  greyed: boolean;
}

/**
 * Photoreal equipment render for one station.
 *
 * State is never carried by the artwork — the same render is used idle and
 * working — so a working machine only gets a soft accent glow under it, and
 * TOC mode drains the colour instead of swapping the picture.
 */
export function MachineImage({ kind, active, accent, greyed }: MachineImageProps) {
  const href = MACHINE_IMAGES[kind];
  if (!href) return null;

  return (
    <g>
      <motion.ellipse
        cx={0}
        cy={IMAGE_Y + IMAGE_H - 4}
        rx={IMAGE_W * 0.3}
        ry={9}
        fill={accent}
        initial={false}
        animate={{ opacity: active && !greyed ? 0.18 : 0 }}
        transition={{ duration: MOTION_BASE, ease: MOTION_EASE }}
      />
      <image
        href={href}
        x={IMAGE_X}
        y={IMAGE_Y}
        width={IMAGE_W}
        height={IMAGE_H}
        preserveAspectRatio="xMidYMax meet"
        style={{
          filter: greyed ? 'grayscale(1)' : 'none',
          opacity: greyed ? 0.75 : 1,
          transition: 'filter 0.3s ease, opacity 0.3s ease',
        }}
      />
    </g>
  );
}
