import { motion } from 'framer-motion';
import {
  BRAND_50,
  CANVAS_SURFACE,
  INK_300,
  MOTION_BASE,
  MOTION_EASE,
  STEEL_BODY,
  STEEL_DEEP,
  TOKEN_BORE,
  TOKEN_HOT_BODY,
  TOKEN_WARM_BODY,
} from '@/core/constants';
import { FORMING_RADII, HOT_FORMING_STEPS } from '@/core/pipeProfile';

const VIEWBOX = '-56 -56 112 112';

export interface FormingTileProps {
  /** Forming step id: billet | heated | shell | rough | reduced | finished. */
  stepId: string;
  active?: boolean;
}

/**
 * Cross-section of the stock at one forming step.
 *
 * Unlike an assembled product, built up layer by layer, a pipe is a single piece of
 * steel being reshaped: the tile therefore replaces the section each step
 * rather than stacking rings on top of it.
 */
export function FormingTile({ stepId, active = false }: FormingTileProps) {
  const radii = FORMING_RADII[stepId] ?? FORMING_RADII.finished;
  const hot = HOT_FORMING_STEPS.has(stepId);
  const body = stepId === 'heated' ? TOKEN_HOT_BODY : hot ? TOKEN_WARM_BODY : STEEL_BODY;
  const solid = radii.inner <= 0;

  return (
    <svg viewBox={VIEWBOX} className="h-full w-full" aria-hidden>
      <circle r={48} fill={active ? BRAND_50 : 'transparent'} />
      {/* Reference outline of the incoming billet, so the reduction is readable. */}
      <circle
        r={FORMING_RADII.billet.outer}
        fill="none"
        stroke={INK_300}
        strokeWidth={1}
        strokeDasharray="3 4"
        opacity={0.7}
      />
      <motion.circle
        r={radii.outer}
        fill={body}
        stroke={STEEL_DEEP}
        strokeWidth={1.4}
        initial={false}
        animate={{ r: radii.outer }}
        transition={{ duration: MOTION_BASE, ease: MOTION_EASE }}
      />
      {solid ? null : (
        <motion.circle
          r={radii.inner}
          fill={TOKEN_BORE}
          initial={false}
          animate={{ r: radii.inner }}
          transition={{ duration: MOTION_BASE, ease: MOTION_EASE }}
        />
      )}
      {/* Specular arc: reads as a round bar rather than a flat disc. */}
      <path
        d={`M ${-radii.outer * 0.62} ${-radii.outer * 0.62} A ${radii.outer * 0.88} ${radii.outer * 0.88} 0 0 1 ${radii.outer * 0.2} ${-radii.outer * 0.86}`}
        fill="none"
        stroke={CANVAS_SURFACE}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.5}
      />
    </svg>
  );
}
