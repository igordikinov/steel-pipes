import { motion } from 'framer-motion';
import { HOT_GLOW, TOKEN_COLD_BODY, TOKEN_HOT_BODY, TOKEN_WARM_BODY } from '@/core/constants';
import {
  Belt,
  METAL,
  METAL_DARK,
  OUTLINE,
  Plinth,
  Rotor,
  SHELL_DEEP,
  SHELL_SHADE,
  Shell,
  Steam,
  WHITE,
  type MachineProps,
} from './parts';

/** Stock lying on a rack: one short bar per billet. */
function BilletRow({ y, count, fill }: { y: number; count: number; fill: string }) {
  return (
    <g>
      {Array.from({ length: count }).map((_, index) => (
        <rect
          key={index}
          x={-50 + index * 21}
          y={y}
          width={18}
          height={9}
          rx={4.5}
          fill={fill}
          stroke={METAL_DARK}
          strokeWidth={1}
          opacity={0.9}
        />
      ))}
    </g>
  );
}

/** 01 — Billet yard: mill-length round billets stacked on the charging rack. */
export function BilletStock({ active, accent }: MachineProps) {
  return (
    <g>
      <Plinth width={150} />
      <BilletRow y={-8} count={5} fill={TOKEN_COLD_BODY} />
      <BilletRow y={-22} count={5} fill={TOKEN_COLD_BODY} />
      <BilletRow y={-36} count={4} fill={TOKEN_COLD_BODY} />
      <rect x={-56} y={4} width={112} height={7} rx={3} fill={SHELL_DEEP} stroke={OUTLINE} strokeWidth={1.1} />
      <motion.g
        initial={false}
        animate={active ? { opacity: [0.25, 1, 0.25] } : { opacity: 0.25 }}
        transition={active ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      >
        <path
          d="M 62 -24 L 78 -14 L 62 -4"
          fill="none"
          stroke={accent}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </g>
  );
}

/**
 * 02 — Rotary hearth furnace. The hearth really does rotate: billets are
 * charged on one side, ride the ring for the whole soak and are drawn out
 * white-hot on the other, so the ring is drawn turning.
 */
export function RingFurnace({ active, accent }: MachineProps) {
  const charge = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <g>
      <Plinth width={176} />
      <Shell x={-80} y={-58} width={160} height={72} radius={14}>
        <ellipse cx={0} cy={-22} rx={62} ry={26} fill={SHELL_SHADE} stroke={OUTLINE} strokeWidth={1.3} />
      </Shell>
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        initial={false}
        animate={{ rotate: active ? 360 : 0 }}
        transition={active ? { duration: 14, ease: 'linear', repeat: Infinity } : { duration: 0.4 }}
      >
        <g>
          <ellipse cx={0} cy={-22} rx={48} ry={19} fill="none" stroke={METAL} strokeWidth={1.2} opacity={0.6} />
          {charge.map((index) => {
            const angle = (index / charge.length) * Math.PI * 2;
            return (
              <circle
                key={index}
                cx={Math.cos(angle) * 48}
                cy={-22 + Math.sin(angle) * 19}
                r={4.2}
                fill={index % 3 === 0 ? TOKEN_HOT_BODY : TOKEN_WARM_BODY}
                opacity={active ? 0.95 : 0.5}
              />
            );
          })}
        </g>
      </motion.g>
      {/* Discharge door: the only place the 1250 °C hearth is visible from outside. */}
      <motion.rect
        x={58}
        y={-16}
        width={16}
        height={22}
        rx={3}
        fill={HOT_GLOW}
        initial={false}
        animate={active ? { opacity: [0.35, 1, 0.35] } : { opacity: 0.25 }}
        transition={active ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      />
      <rect x={-74} y={-14} width={14} height={20} rx={3} fill={SHELL_DEEP} stroke={OUTLINE} strokeWidth={1.1} />
      <Steam x={-30} y={-58} active={active} accent={accent} />
      <Steam x={22} y={-58} active={active} delay={0.6} accent={accent} />
    </g>
  );
}

/**
 * 03 — Mannesmann piercing mill: two barrel rolls set at an angle drive the
 * billet onto the mandrel point, which opens the bore.
 */
export function PiercingMill({ active, accent }: MachineProps) {
  return (
    <g>
      <Plinth width={176} />
      <Shell x={-84} y={-64} width={30} height={78} radius={7} />
      <Shell x={54} y={-64} width={30} height={78} radius={7} />
      <Rotor cx={-8} cy={-46} radius={20} blades={1} active={active} duration={0.9} accent={accent} />
      <Rotor cx={-8} cy={-2} radius={20} blades={1} active={active} duration={0.9} reverse accent={accent} />

      {/* Billet on the entry side, hollow shell leaving on the exit side. */}
      <motion.rect
        x={-56}
        y={-28}
        width={40}
        height={9}
        rx={4.5}
        fill={TOKEN_HOT_BODY}
        initial={false}
        animate={active ? { x: [-56, -40] } : { x: -56 }}
        transition={active ? { duration: 1.5, ease: 'linear', repeat: Infinity } : { duration: 0.3 }}
      />
      <motion.g
        initial={false}
        animate={active ? { x: [0, 18] } : { x: 0 }}
        transition={active ? { duration: 1.5, ease: 'linear', repeat: Infinity } : { duration: 0.3 }}
      >
        <rect x={12} y={-28} width={40} height={9} rx={4.5} fill={TOKEN_WARM_BODY} />
        <ellipse cx={50} cy={-23.5} rx={2} ry={3} fill={METAL_DARK} />
      </motion.g>
      {/* Mandrel bar: held from the exit side, it is what makes the bore. */}
      <line x1={16} x2={78} y1={-23.5} y2={-23.5} stroke={METAL_DARK} strokeWidth={3} strokeLinecap="round" />
      <circle cx={16} cy={-23.5} r={4} fill={METAL} stroke={METAL_DARK} strokeWidth={1.2} />
    </g>
  );
}

/** One roll stand of a continuous mill: a frame with a pair of rolls. */
function RollStand({
  x,
  active,
  accent,
  radius,
  delay,
}: {
  x: number;
  active: boolean;
  accent: string;
  radius: number;
  delay: number;
}) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-13} y={-58} width={26} height={72} rx={5} fill={WHITE} stroke={OUTLINE} strokeWidth={1.3} />
      <Rotor cx={0} cy={-38} radius={radius} blades={1} active={active} duration={0.8 + delay} accent={accent} />
      <Rotor cx={0} cy={-10} radius={radius} blades={1} active={active} duration={0.8 + delay} reverse accent={accent} />
    </g>
  );
}

/**
 * 04 — Continuous mandrel mill (PQF): the shell is rolled over a floating
 * mandrel through a train of stands, each one thinning the wall a little.
 */
export function ContinuousMill({ active, accent }: MachineProps) {
  const stands = [-66, -22, 22, 66];
  return (
    <g>
      <Plinth width={180} />
      {stands.map((x, index) => (
        <RollStand key={x} x={x} active={active} accent={accent} radius={11} delay={index * 0.06} />
      ))}
      <motion.rect
        x={-86}
        y={-28}
        width={172}
        height={8}
        rx={4}
        fill={TOKEN_WARM_BODY}
        initial={false}
        animate={active ? { opacity: [0.75, 1, 0.75] } : { opacity: 0.55 }}
        transition={active ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      />
      <line x1={-86} x2={86} y1={-24} y2={-24} stroke={METAL_DARK} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      <Belt x1={-80} x2={80} y={6} active={active} accent={accent} />
    </g>
  );
}

/**
 * 05 — Stretch-reducing mill: many small stands, no mandrel. Speed rises from
 * stand to stand, so the tube is pulled down to the ordered diameter.
 */
export function ReducingMill({ active, accent }: MachineProps) {
  const stands = [-72, -40, -8, 24, 56];
  return (
    <g>
      <Plinth width={182} />
      {stands.map((x, index) => (
        <RollStand key={x} x={x} active={active} accent={accent} radius={9 - index * 0.6} delay={index * 0.05} />
      ))}
      {/* The tube leaves smaller than it entered — the taper is the whole point. */}
      <motion.path
        d="M -90 -31 L 84 -26 L 84 -20 L -90 -21 Z"
        fill={TOKEN_WARM_BODY}
        initial={false}
        animate={active ? { opacity: [0.7, 1, 0.7] } : { opacity: 0.5 }}
        transition={active ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      />
      <Belt x1={-80} x2={80} y={6} active={active} accent={accent} speed={0.8} />
    </g>
  );
}

/**
 * 06 — Walking-beam cooling bed: pipes are stepped sideways across the rakes
 * and cool from orange to steel grey on the way.
 */
export function CoolingBed({ active, accent, stock }: MachineProps) {
  const lanes = [0, 1, 2, 3, 4, 5, 6, 7];
  const held = Math.max(stock, 0);
  return (
    <g>
      <Plinth width={182} />
      {/* Bed frame: the rakes the pipes are stepped across. */}
      <path
        d="M -88 6 L 88 6 L 88 12 L -88 12 Z"
        fill={SHELL_DEEP}
        stroke={OUTLINE}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {[-72, -36, 0, 36, 72].map((x) => (
        <line key={x} x1={x} x2={x} y1={-18} y2={8} stroke={OUTLINE} strokeWidth={1.4} opacity={0.8} />
      ))}
      <line x1={-88} x2={88} y1={-18} y2={-18} stroke={OUTLINE} strokeWidth={1.2} opacity={0.7} />
      {lanes.map((lane) => {
        const x = -84 + lane * 22;
        // The left of the bed is freshly rolled; the right end is ready to leave.
        const heat = 1 - lane / (lanes.length - 1);
        const fill = heat > 0.6 ? TOKEN_HOT_BODY : heat > 0.25 ? TOKEN_WARM_BODY : TOKEN_COLD_BODY;
        return (
          <motion.rect
            key={lane}
            x={x}
            y={-26}
            width={18}
            height={8}
            rx={4}
            fill={fill}
            stroke={METAL_DARK}
            strokeWidth={0.8}
            opacity={lane < Math.max(held, 3) ? 0.95 : 0.16}
            initial={false}
            animate={active ? { y: [-26, -30, -26] } : { y: -26 }}
            transition={
              active
                ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: lane * 0.12 }
                : { duration: 0.3 }
            }
          />
        );
      })}
      <Steam x={-62} y={-34} active={active} accent={accent} />
      <Steam x={-18} y={-38} active={active} delay={0.8} accent={accent} />
    </g>
  );
}
