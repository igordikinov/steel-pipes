import {
  CANVAS_LINE,
  CANVAS_MUTED,
  CANVAS_SURFACE,
  STEEL_BODY,
  STEEL_DEEP,
  THREAD_CALLOUT_HEIGHT,
  THREAD_CALLOUT_WIDTH,
  TOKEN_BORE,
  TOKEN_COUPLING,
  TOKEN_THREAD,
} from '@/core/constants';

const PIN_TEETH = [0, 1, 2, 3, 4, 5];

/**
 * Zoom on the made-up premium joint: the thread carries the load, but the seal
 * is the cone-on-cone contact ahead of it and the torque shoulder behind it.
 * That trio is what separates a premium connection from an API thread.
 */
export function ThreadCallout() {
  return (
    <figure className="mt-3 rounded-xl border border-line bg-surface p-2">
      <svg
        viewBox={`0 0 ${THREAD_CALLOUT_WIDTH} ${THREAD_CALLOUT_HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Анатомия премиум-соединения"
      >
        <rect width={THREAD_CALLOUT_WIDTH} height={THREAD_CALLOUT_HEIGHT} fill={CANVAS_SURFACE} />

        {/* Coupling body. */}
        <rect x={96} y={40} width={128} height={120} rx={6} fill={TOKEN_COUPLING} opacity={0.5} />
        {/* Pin end of the pipe running into it. */}
        <rect x={10} y={62} width={150} height={34} fill={STEEL_BODY} stroke={STEEL_DEEP} strokeWidth={1.2} />
        <rect x={10} y={104} width={150} height={34} fill={STEEL_BODY} stroke={STEEL_DEEP} strokeWidth={1.2} />
        <rect x={10} y={96} width={112} height={8} fill={TOKEN_BORE} opacity={0.85} />

        {/* Wedge thread profile, engaged on both walls. */}
        {PIN_TEETH.map((index) => {
          const x = 62 + index * 15;
          return (
            <g key={index}>
              <path d={`M ${x} 62 l 7 8 l 7 -8`} fill="none" stroke={TOKEN_THREAD} strokeWidth={2.4} strokeLinecap="round" />
              <path d={`M ${x} 138 l 7 -8 l 7 8`} fill="none" stroke={TOKEN_THREAD} strokeWidth={2.4} strokeLinecap="round" />
            </g>
          );
        })}

        {/* Metal-to-metal seal cone ahead of the thread. */}
        <path d="M 158 62 L 176 74 L 176 126 L 158 138" fill="none" stroke="#4F9A5E" strokeWidth={3} strokeLinejoin="round" />
        {/* Torque shoulder that stops the make-up. */}
        <line x1={186} y1={70} x2={186} y2={130} stroke="#EE4444" strokeWidth={3} strokeLinecap="round" />

        {[
          { x: 90, y: 32, text: 'Клиновидная резьба' },
          { x: 150, y: 176, text: 'Уплотнение металл–металл' },
          { x: 186, y: 32, text: 'Упорный торец' },
        ].map((label) => (
          <text
            key={label.text}
            x={label.x}
            y={label.y}
            fontSize={10}
            fontWeight={700}
            textAnchor="middle"
            fill={CANVAS_MUTED}
            fontFamily="'Open Sans', sans-serif"
          >
            {label.text}
          </text>
        ))}
        <line x1={150} y1={166} x2={168} y2={132} stroke={CANVAS_LINE} strokeWidth={1.2} />
      </svg>
      <figcaption className="mt-1 text-center text-[10px] text-ink-400">
        Резьба держит нагрузку, конус уплотняет, торец задаёт момент свинчивания
      </figcaption>
    </figure>
  );
}
