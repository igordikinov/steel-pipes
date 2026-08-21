import { motion } from 'framer-motion';
import { ACCENT, TOKEN_COLD_BODY, TOKEN_COLD_EDGE } from '@/core/constants';
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
  WHITE,
  type MachineProps,
} from './parts';

/** Shared rack render box, so buffer and warehouse line up with the row. */
const RACK_X = -84;
const RACK_Y = -62;
const RACK_W = 168;
const RACK_H = 108;
const RACK_ROWS = 5;

/** One stored pipe, seen from the end of the rack. */
function StoredPipe({ x, y, width }: { x: number; y: number; width: number }) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={8}
      rx={4}
      fill={TOKEN_COLD_BODY}
      stroke={TOKEN_COLD_EDGE}
      strokeWidth={0.9}
    />
  );
}

/** Frame plus the pipes actually held, filling bottom-up. */
function PipeRack({ held, columns, accent }: { held: number; columns: number; accent: string }) {
  const slots = Math.max(columns, 1);
  const width = (RACK_W - 16) / slots - 3;
  const rows = Array.from({ length: RACK_ROWS });
  return (
    <g>
      <rect
        x={RACK_X}
        y={RACK_Y}
        width={RACK_W}
        height={RACK_H}
        rx={8}
        fill={SHELL_SHADE}
        stroke={OUTLINE}
        strokeWidth={1.3}
      />
      {rows.map((_, row) => {
        const y = RACK_Y + RACK_H - 16 - row * 20;
        return (
          <g key={row}>
            <line
              x1={RACK_X + 6}
              x2={RACK_X + RACK_W - 6}
              y1={y + 10}
              y2={y + 10}
              stroke={OUTLINE}
              strokeWidth={1.4}
            />
            {Array.from({ length: slots }).map((__, column) => {
              const index = row * slots + column;
              if (index >= held) return null;
              return (
                <StoredPipe
                  key={column}
                  x={RACK_X + 8 + column * (width + 3)}
                  y={y}
                  width={width}
                />
              );
            })}
          </g>
        );
      })}
      <line
        x1={RACK_X + 6}
        x2={RACK_X + 6}
        y1={RACK_Y + 6}
        y2={RACK_Y + RACK_H - 6}
        stroke={held > 0 ? accent : OUTLINE}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={held > 0 ? 0.7 : 0.4}
      />
    </g>
  );
}

/**
 * 07 — Cross-roll straightening machine: skewed rolls bend the pipe past its
 * yield point in both directions until it comes out straight.
 */
export function StraightenerMachine({ active, accent }: MachineProps) {
  const rolls = [-52, -4, 44];
  return (
    <g>
      <Plinth width={176} />
      <Shell x={-84} y={-52} width={168} height={66} radius={10} />
      {rolls.map((x) => (
        <g key={x}>
          <g transform={`translate(${x} -38) rotate(-14)`}>
            <Rotor cx={0} cy={0} radius={12} blades={1} active={active} duration={1.1} accent={accent} />
          </g>
          <g transform={`translate(${x + 22} -6) rotate(14)`}>
            <Rotor cx={0} cy={0} radius={12} blades={1} active={active} duration={1.1} reverse accent={accent} />
          </g>
        </g>
      ))}
      <motion.rect
        x={-88}
        y={-26}
        width={176}
        height={8}
        rx={4}
        fill={TOKEN_COLD_BODY}
        stroke={TOKEN_COLD_EDGE}
        strokeWidth={1}
        initial={false}
        animate={active ? { x: [-88, -78] } : { x: -88 }}
        transition={active ? { duration: 1.4, ease: 'linear', repeat: Infinity } : { duration: 0.3 }}
      />
    </g>
  );
}

/**
 * 08 — Inspection line: ultrasonic and electromagnetic heads sweep the body,
 * then the pipe is capped and pressurised in the hydrotester.
 */
export function InspectionMachine({ active, accent }: MachineProps) {
  return (
    <g>
      <Plinth width={176} />
      <Shell x={-84} y={-62} width={18} height={76} radius={5} />
      <Shell x={66} y={-62} width={18} height={76} radius={5} />
      <rect x={-84} y={-68} width={168} height={12} rx={5} fill={SHELL_DEEP} stroke={OUTLINE} strokeWidth={1.2} />

      {/* Scanning head travelling along the pipe. */}
      <motion.g
        initial={false}
        animate={active ? { x: [-42, 42, -42] } : { x: 0 }}
        transition={active ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
      >
        <rect x={-16} y={-56} width={32} height={16} rx={4} fill={WHITE} stroke={OUTLINE} strokeWidth={1.3} />
        <rect x={-9} y={-51} width={18} height={6} rx={3} fill={accent} />
        <motion.path
          d="M -12 -40 L 12 -40 L 18 -30 L -18 -30 Z"
          fill={accent}
          initial={false}
          animate={active ? { opacity: [0.05, 0.28, 0.05] } : { opacity: 0 }}
          transition={active ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        />
      </motion.g>

      <rect
        x={-70}
        y={-28}
        width={140}
        height={9}
        rx={4.5}
        fill={TOKEN_COLD_BODY}
        stroke={TOKEN_COLD_EDGE}
        strokeWidth={1}
      />
      {/* Hydrotest heads clamp both ends; the gauge rises while the body is held. */}
      <rect x={-78} y={-32} width={12} height={17} rx={3} fill={METAL} stroke={METAL_DARK} strokeWidth={1} />
      <rect x={66} y={-32} width={12} height={17} rx={3} fill={METAL} stroke={METAL_DARK} strokeWidth={1} />
      <circle cx={0} cy={2} r={11} fill={WHITE} stroke={OUTLINE} strokeWidth={1.3} />
      <motion.line
        x1={0}
        y1={2}
        x2={0}
        y2={-6}
        stroke={ACCENT}
        strokeWidth={1.8}
        strokeLinecap="round"
        style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
        initial={false}
        animate={active ? { rotate: [-52, 58, -52] } : { rotate: -52 }}
        transition={active ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
      />
    </g>
  );
}

/** 09 — Cut-to-length saw and end facing: the blade drops, sparks, retracts. */
export function CuttingMachine({ active, accent }: MachineProps) {
  const sparks = [0, 1, 2];
  return (
    <g>
      <Plinth width={176} />
      <Shell x={-84} y={-30} width={168} height={44} radius={9} />
      <rect
        x={-78}
        y={-40}
        width={156}
        height={9}
        rx={4.5}
        fill={TOKEN_COLD_BODY}
        stroke={TOKEN_COLD_EDGE}
        strokeWidth={1}
      />
      <motion.g
        initial={false}
        animate={active ? { y: [0, 10, 0] } : { y: 0 }}
        transition={active ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
      >
        <Rotor cx={6} cy={-44} radius={18} blades={6} active={active} duration={0.5} accent={accent} />
        <rect x={-4} y={-82} width={20} height={26} rx={4} fill={WHITE} stroke={OUTLINE} strokeWidth={1.2} />
      </motion.g>
      {sparks.map((index) => (
        <motion.circle
          key={index}
          cx={6}
          cy={-34}
          r={1.8}
          fill={ACCENT}
          initial={{ opacity: 0 }}
          animate={
            active
              ? { opacity: [0, 1, 0], x: [0, 14 - index * 12], y: [0, 12 + index * 3] }
              : { opacity: 0 }
          }
          transition={
            active ? { duration: 0.9, repeat: Infinity, delay: index * 0.22, ease: 'easeOut' } : { duration: 0.2 }
          }
        />
      ))}
      <Belt x1={-78} x2={78} y={6} active={active} accent={accent} speed={1.4} />
    </g>
  );
}

/** 10 — Intermediate stock in front of the constraint, filling as it queues. */
export function BufferRack({ stock, columns, accent }: MachineProps) {
  return <PipeRack held={Math.max(stock, 0)} columns={columns} accent={accent} />;
}

/** 12 — Finished goods yard: fills as the shift delivers. */
export function WarehouseRack({ fill, columns, accent }: MachineProps) {
  const slots = Math.max(columns, 1) * RACK_ROWS;
  const held = Math.round(Math.min(Math.max(fill, 0), 1) * slots);
  return <PipeRack held={held} columns={columns} accent={accent} />;
}
