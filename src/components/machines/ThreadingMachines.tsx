import { motion } from 'framer-motion';
import {
  ACCENT,
  TOKEN_COLD_BODY,
  TOKEN_COLD_EDGE,
  TOKEN_COUPLING,
  TOKEN_THREAD,
} from '@/core/constants';
import { serviceOffset } from '@/core/layout';
import {
  METAL,
  METAL_DARK,
  OUTLINE,
  Plinth,
  Rotor,
  SHELL_DEEP,
  SHELL_SHADE,
  Shell,
  WHITE,
  type MachineProps,
} from './parts';

/**
 * 11 — Threading line: one lathe module is drawn per available machine, so the
 * capacity slider physically adds machines to the shop floor.
 */
export function ThreadingMachine({ active, accent, slots }: MachineProps) {
  const machines = Array.from({ length: Math.max(1, slots) }, (_, index) =>
    serviceOffset(index, Math.max(1, slots)),
  );
  const minX = Math.min(...machines.map((machine) => machine.x));
  const maxX = Math.max(...machines.map((machine) => machine.x));
  const minY = Math.min(...machines.map((machine) => machine.y));
  const maxY = Math.max(...machines.map((machine) => machine.y));

  return (
    <g>
      <Plinth width={Math.max(120, maxX - minX + 76)} />
      <rect
        x={minX - 26}
        y={minY - 18}
        width={maxX - minX + 52}
        height={maxY - minY + 38}
        rx={10}
        fill={SHELL_SHADE}
        stroke={OUTLINE}
        strokeWidth={1.3}
      />
      {machines.map((offset, index) => (
        <g key={index} transform={`translate(${offset.x} ${offset.y})`}>
          {/* Pipe held in the chuck, thread being cut on the end. */}
          <rect
            x={-15}
            y={-3.5}
            width={22}
            height={7}
            rx={3.5}
            fill={TOKEN_COLD_BODY}
            stroke={TOKEN_COLD_EDGE}
            strokeWidth={0.9}
          />
          <motion.g
            initial={false}
            animate={active ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.3 }}
            transition={
              active
                ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: index * 0.14 }
                : { duration: 0.3 }
            }
          >
            {[0, 1, 2].map((tick) => (
              <line
                key={tick}
                x1={-13 + tick * 3}
                x2={-13 + tick * 3}
                y1={-3}
                y2={3}
                stroke={TOKEN_THREAD}
                strokeWidth={1}
                strokeLinecap="round"
              />
            ))}
          </motion.g>
          <Rotor cx={11} cy={0} radius={8} blades={2} active={active} duration={0.7} accent={accent} />
          {/* Tool slide feeding in along the thread taper. */}
          <motion.rect
            x={-14}
            y={-13}
            width={9}
            height={7}
            rx={2}
            fill={METAL}
            stroke={METAL_DARK}
            strokeWidth={0.9}
            initial={false}
            animate={active ? { x: [-14, -2, -14] } : { x: -14 }}
            transition={
              active
                ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.18 }
                : { duration: 0.3 }
            }
          />
        </g>
      ))}
    </g>
  );
}

/**
 * 13 — Coupling bucking stand: the coupling is screwed on while the torque and
 * turns are recorded, and that graph is what the joint is accepted on.
 */
export function CouplingMachine({ active, accent, slots }: MachineProps) {
  const stands = Array.from({ length: Math.max(1, slots) }, (_, index) =>
    serviceOffset(index, Math.max(1, slots)),
  );
  return (
    <g>
      <Plinth width={172} />
      <Shell x={-84} y={-46} width={168} height={60} radius={10} />
      {stands.map((offset, index) => (
        <g key={index} transform={`translate(${offset.x} ${offset.y})`}>
          <rect
            x={-26}
            y={-4}
            width={34}
            height={8}
            rx={4}
            fill={TOKEN_COLD_BODY}
            stroke={TOKEN_COLD_EDGE}
            strokeWidth={0.9}
          />
          <motion.rect
            x={8}
            y={-7}
            width={14}
            height={14}
            rx={3}
            fill={TOKEN_COUPLING}
            stroke={METAL_DARK}
            strokeWidth={1}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            initial={false}
            animate={active ? { rotate: 360 } : { rotate: 0 }}
            transition={
              active
                ? { duration: 1.4, ease: 'linear', repeat: Infinity, delay: index * 0.12 }
                : { duration: 0.3 }
            }
          />
          <Rotor cx={30} cy={0} radius={9} blades={4} active={active} duration={1.4} accent={accent} />
        </g>
      ))}
      {/* Torque trace written for every joint. */}
      <rect x={-76} y={-40} width={54} height={26} rx={4} fill={WHITE} stroke={OUTLINE} strokeWidth={1.2} />
      <motion.path
        d="M -72 -18 L -60 -20 L -50 -28 L -40 -34 L -28 -35"
        fill="none"
        stroke={accent}
        strokeWidth={1.8}
        strokeLinecap="round"
        initial={false}
        animate={active ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={active ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      />
    </g>
  );
}

/** 14 — Connection check: ring gauges and a thread profile trace. */
export function ThreadCheckMachine({ active, accent }: MachineProps) {
  return (
    <g>
      <Plinth width={168} />
      <Shell x={-80} y={-44} width={160} height={58} radius={10} />
      <rect
        x={-70}
        y={-24}
        width={104}
        height={8}
        rx={4}
        fill={TOKEN_COLD_BODY}
        stroke={TOKEN_COLD_EDGE}
        strokeWidth={0.9}
      />
      {/* Ring gauge run onto the thread. */}
      <motion.g
        initial={false}
        animate={active ? { x: [0, 24, 0] } : { x: 0 }}
        transition={active ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
      >
        <rect x={22} y={-30} width={13} height={20} rx={3} fill={SHELL_DEEP} stroke={METAL_DARK} strokeWidth={1.2} />
      </motion.g>
      <rect x={40} y={-40} width={38} height={30} rx={4} fill={WHITE} stroke={OUTLINE} strokeWidth={1.2} />
      <motion.path
        d="M 44 -20 L 50 -30 L 56 -20 L 62 -30 L 68 -20 L 74 -30"
        fill="none"
        stroke={accent}
        strokeWidth={1.6}
        strokeLinecap="round"
        initial={false}
        animate={active ? { opacity: [0.35, 1, 0.35] } : { opacity: 0.35 }}
        transition={active ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      />
      <circle cx={-52} cy={-30} r={8} fill={WHITE} stroke={OUTLINE} strokeWidth={1.2} />
      <motion.circle
        cx={-52}
        cy={-30}
        r={3.4}
        fill={ACCENT}
        initial={false}
        animate={active ? { opacity: [0.25, 1, 0.25] } : { opacity: 0.25 }}
        transition={active ? { duration: 1.2, repeat: Infinity } : { duration: 0.3 }}
      />
    </g>
  );
}

/** Hexagonal bundle rows, bottom-up, with the count of pipes below each row. */
const BUNDLE_ROWS = [
  { count: 4, before: 0 },
  { count: 5, before: 4 },
  { count: 4, before: 9 },
  { count: 3, before: 13 },
];

/** 15 — Bundling: pipes are strapped into a hexagonal bundle and marked. */
export function BundleMachine({ active, accent, stock }: MachineProps) {
  const held = Math.max(stock, 0);
  return (
    <g>
      <Plinth width={168} />
      {BUNDLE_ROWS.map(({ count, before }, row) => {
        const y = 2 - row * 15;
        return (
          <g key={row}>
            {Array.from({ length: count }).map((_, column) => (
              <circle
                key={column}
                cx={-((count - 1) / 2) * 17 + column * 17}
                cy={y}
                r={7.4}
                fill={TOKEN_COLD_BODY}
                stroke={TOKEN_COLD_EDGE}
                strokeWidth={1}
                opacity={before + column < held || held === 0 ? 0.95 : 0.22}
              />
            ))}
          </g>
        );
      })}
      {/* Straps drawn around the finished bundle. */}
      {[-30, 30].map((x) => (
        <motion.line
          key={x}
          x1={x}
          x2={x}
          y1={-52}
          y2={12}
          stroke={accent}
          strokeWidth={2.2}
          strokeLinecap="round"
          initial={false}
          animate={active ? { opacity: [0.35, 1, 0.35] } : { opacity: 0.5 }}
          transition={active ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        />
      ))}
      <rect x={-14} y={-66} width={28} height={11} rx={3} fill={METAL} stroke={METAL_DARK} strokeWidth={1} />
    </g>
  );
}
