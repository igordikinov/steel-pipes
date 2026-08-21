import {
  STATE_COLORS,
  TOKEN_BORE,
  TOKEN_COLD_BODY,
  TOKEN_COLD_EDGE,
  TOKEN_COUPLING,
  TOKEN_HOT_BODY,
  TOKEN_THREAD,
  TOKEN_WARM_BODY,
} from '@/core/constants';
import { useSimulationControls } from '@/state/SimulationContext';

const ENTRIES: Array<{ key: keyof typeof STATE_COLORS; label: string; hint: string }> = [
  { key: 'idle', label: 'Простой', hint: 'Ожидание работы' },
  { key: 'working', label: 'Работа', hint: 'Обработка изделий' },
  { key: 'blocked', label: 'Заблокирован', hint: 'Следующий этап заполнен' },
  { key: 'starved', label: 'Голодание', hint: 'Нет входных изделий' },
  { key: 'bottleneck', label: 'Узкое место', hint: 'Ограничение системы' },
];

const STAGES: Array<{ stage: number; label: string; hint: string }> = [
  { stage: 0, label: 'Заготовка', hint: 'Холодный металл со склада' },
  { stage: 1, label: 'Нагретая', hint: 'После кольцевой печи' },
  { stage: 2, label: 'Гильза', hint: 'После прошивного стана' },
  { stage: 3, label: 'Труба', hint: 'После холодильника' },
  { stage: 4, label: 'С резьбой', hint: 'После резьбонарезки' },
  { stage: 5, label: 'С муфтой', hint: 'После навинчивания' },
];

/** Small static pipe glyph mirroring the canvas token, tinted by the variant. */
function TokenGlyph({ stage, edge }: { stage: number; edge: string }) {
  const body = stage === 1 ? TOKEN_HOT_BODY : stage === 2 ? TOKEN_WARM_BODY : TOKEN_COLD_BODY;
  const hollow = stage >= 2;
  return (
    <svg width={22} height={12} viewBox="-11 -6 22 12" className="shrink-0" aria-hidden="true">
      <rect x={-10} y={-4.4} width={20} height={8.8} rx={2.6} fill={body} stroke={edge} strokeWidth={1.2} />
      {hollow
        ? [-8.8, 8.8].map((cx) => <ellipse key={cx} cx={cx} cy={0} rx={1.2} ry={2.8} fill={TOKEN_BORE} />)
        : null}
      {stage >= 4
        ? [-7, -5, 5, 7].map((x) => (
            <line key={x} x1={x} x2={x} y1={-3.2} y2={3.2} stroke={TOKEN_THREAD} strokeWidth={0.9} />
          ))
        : null}
      {stage >= 5 ? <rect x={4} y={-5.4} width={6} height={10.8} rx={1.6} fill={TOKEN_COUPLING} /> : null}
    </svg>
  );
}

export function StateLegend() {
  const { variantId, variants } = useSimulationControls();
  const edge = variants.find((variant) => variant.id === variantId)?.tokenColor ?? TOKEN_COLD_EDGE;
  // Only the premium connection reaches the coupling stage.
  const stages = variantId === 'premium' ? STAGES : STAGES.slice(0, 5);

  return (
    <div className="px-3 py-3">
      <ul className="grid grid-cols-1 gap-1.5">
        {ENTRIES.map((entry) => (
          <li key={entry.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: STATE_COLORS[entry.key] }} />
            <span className="text-[11px] font-semibold text-ink-700">{entry.label}</span>
            <span className="truncate text-[10px] text-ink-400">{entry.hint}</span>
          </li>
        ))}
      </ul>

      <p className="label-caps mt-3 border-t border-line pt-2.5">Стадии трубы</p>
      <ul className="mt-1.5 grid grid-cols-1 gap-1.5">
        {stages.map((stage) => (
          <li key={stage.stage} className="flex items-center gap-2">
            <TokenGlyph stage={stage.stage} edge={edge} />
            <span className="text-[11px] font-semibold text-ink-700">{stage.label}</span>
            <span className="truncate text-[10px] text-ink-400">{stage.hint}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
