import { useState } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Pressable } from '@/components/ui/Pressable';
import { ECCENTRICITY_TOLERANCE_PERCENT, WALL_TOLERANCE_PERCENT } from '@/core/constants';
import { formatNumber } from '@/core/scenario';
import { useSimulationControls } from '@/state/SimulationContext';
import { FormingSequence } from './FormingSequence';
import { PipeCrossSection } from './PipeCrossSection';
import { ThreadCallout } from './ThreadCallout';

/** Anatomy tab: what a seamless pipe is, and how the steel gets that shape. */
export function AnatomyView() {
  const { scenario } = useSimulationControls();
  const [selected, setSelected] = useState<string | null>(null);
  const { construction, assemblyLayers, composition, spec, product } = scenario;
  // The metal-to-metal seal only exists on the premium connection.
  const isPremium = construction.some((part) => part.id === 'seal');

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex min-h-0 flex-[3] gap-3">
        <Panel
          eyebrow="Конструкция"
          title={product}
          className="min-w-0 flex-[3]"
          bodyClassName="min-h-0 p-2"
        >
          <PipeCrossSection parts={construction} selectedId={selected} onSelect={setSelected} />
        </Panel>

        <Panel
          eyebrow="Марка стали"
          title="Химический состав"
          className="min-w-0 flex-1"
          bodyClassName="scroll-thin min-h-0 overflow-y-auto p-3"
        >
          <table className="w-full border-collapse">
            <tbody>
              {composition.map((element) => (
                <tr key={element.symbol} className="border-b border-line last:border-b-0">
                  <td className="py-1.5 pr-2 align-middle">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-muted text-[11px] font-bold text-ink-900">
                      {element.symbol}
                    </span>
                  </td>
                  <td className="py-1.5 pr-2 align-middle text-[11px] text-ink-500">{element.name}</td>
                  <td className="numeric py-1.5 text-right align-middle text-[12px] font-bold text-ink-900">
                    {element.basis ? 'основа' : `${formatNumber(element.percent, element.percent < 0.1 ? 3 : 2)} %`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[10px] leading-snug text-ink-400">
            Химия задаёт группу прочности: тот же передел, другая марка — другая труба.
          </p>
        </Panel>

        <Panel
          eyebrow={`${construction.length} элементов конструкции`}
          title="Что определяет каждый элемент"
          className="min-w-0 flex-[3]"
          bodyClassName="scroll-thin min-h-0 overflow-y-auto p-3"
        >
          <ul className="flex flex-col gap-1.5">
            {construction.map((part) => {
              const active = selected === part.id;
              return (
                <li key={part.id}>
                  <Pressable
                    label={part.name}
                    pressed={active}
                    onPress={() => setSelected(active ? null : part.id)}
                    className={`w-full items-start gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                      active ? 'border-brand-400 bg-brand-50' : 'border-line bg-surface hover:border-line-strong'
                    }`}
                  >
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                      style={{ backgroundColor: part.color }}
                    >
                      {part.index}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[13px] font-bold text-ink-900">{part.name}</span>
                      <span className="text-[11px] font-medium text-ink-700">{part.role}</span>
                      <span className="mt-0.5 text-[10px] leading-snug text-ink-400">{part.detail}</span>
                    </span>
                  </Pressable>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              {
                label: 'Темп. нагрева',
                value: `${spec.temperatureC[0]}–${spec.temperatureC[1]}`,
                unit: '°C',
              },
              {
                label: 'Гидроиспытание',
                value: `${spec.pressureBar[0]}–${spec.pressureBar[1]}`,
                unit: 'бар',
              },
              {
                label: 'Цикл резьбы',
                value: formatNumber(scenario.params.threadingTime, 0),
                unit: 'мин',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-line bg-surface-muted px-3 py-2">
                <p className="label-caps">{item.label}</p>
                <p className="numeric mt-0.5 text-[16px] font-bold text-ink-900">
                  {item.value}
                  <span className="ml-1 text-[10px] font-medium text-ink-400">{item.unit}</span>
                </p>
              </div>
            ))}
          </div>

          {isPremium ? <ThreadCallout /> : null}

          <p className="mt-2 rounded-xl border border-line bg-surface-muted px-3 py-2 text-[10px] leading-snug text-ink-400">
            <span className="font-bold text-ink-700">Почему бесшовная:</span> полость раскрывается прошивкой
            горячей заготовки, а не сваркой полосы, — поэтому у трубы нет продольного шва, но появляется своя
            болезнь: разностенность (допуск ±{ECCENTRICITY_TOLERANCE_PERCENT} %) и минусовой допуск стенки
            до −{WALL_TOLERANCE_PERCENT} %.
          </p>
        </Panel>
      </div>

      <Panel
        eyebrow="Горячий передел"
        title="Формоизменение заготовки"
        className="min-h-0 flex-[2]"
        bodyClassName="min-h-0"
      >
        <FormingSequence layers={assemblyLayers} />
      </Panel>
    </div>
  );
}
