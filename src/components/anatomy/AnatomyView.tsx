import { useState } from 'react';
import exploded from '@/assets/img/anatomy/exploded.png';
import threadMacro from '@/assets/img/anatomy/thread-macro.png';
import wallEccentricity from '@/assets/img/anatomy/wall-eccentricity.png';
import pipeCoupled from '@/assets/img/pipe/pipe-coupled.png';
import { Panel } from '@/components/ui/Panel';
import { Pressable } from '@/components/ui/Pressable';
import { Segmented } from '@/components/ui/Segmented';
import { ECCENTRICITY_TOLERANCE_PERCENT, WALL_TOLERANCE_PERCENT } from '@/core/constants';
import { formatNumber } from '@/core/scenario';
import { useSimulationControls } from '@/state/SimulationContext';
import { FormingSequence } from './FormingSequence';
import { PipeCrossSection } from './PipeCrossSection';
import { PipeCutaway } from './PipeCutaway';
import { ThreadCallout } from './ThreadCallout';

type CutawayView = 'photo' | 'scheme';

const VIEW_OPTIONS: Array<{ value: CutawayView; label: string }> = [
  { value: 'photo', label: 'Фото' },
  { value: 'scheme', label: 'Схема' },
];

/** Anatomy tab: what a seamless pipe is, and how the steel gets that shape. */
export function AnatomyView() {
  const { scenario } = useSimulationControls();
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<CutawayView>('photo');
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
          action={
            <Segmented
              ariaLabel="Вид разреза"
              options={VIEW_OPTIONS}
              value={view}
              onChange={setView}
              compact
            />
          }
        >
          {view === 'photo' ? (
            <PipeCutaway parts={construction} selectedId={selected} premium={isPremium} />
          ) : (
            <PipeCrossSection parts={construction} selectedId={selected} onSelect={setSelected} />
          )}
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
          <figure className="mt-3 rounded-xl border border-line bg-surface p-2">
            <img src={exploded} alt="Разнесённая схема резьбового соединения" className="w-full object-contain" />
            <figcaption className="mt-1 text-center text-[10px] text-ink-400">
              Соединение в разборе: ниппель — муфта — ниппель
            </figcaption>
          </figure>
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

          <div className="mt-3 grid grid-cols-2 gap-2">
            <figure className="rounded-xl border border-line bg-surface p-2">
              <img
                src={wallEccentricity}
                alt="Сечение трубы с разностенностью"
                className="mx-auto h-24 w-auto object-contain"
              />
              <figcaption className="mt-1 text-center text-[10px] text-ink-400">
                Сечение: стенка неравномерна по окружности
              </figcaption>
            </figure>
            <figure className="rounded-xl border border-line bg-surface p-2">
              <img
                src={isPremium ? pipeCoupled : threadMacro}
                alt={isPremium ? 'Труба с навинченной муфтой' : 'Резьба на конце трубы крупным планом'}
                className="mx-auto h-24 w-auto object-contain"
              />
              <figcaption className="mt-1 text-center text-[10px] text-ink-400">
                {isPremium ? 'Труба с навинченной муфтой' : 'Трапецеидальная резьба BTC'}
              </figcaption>
            </figure>
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
        <FormingSequence layers={assemblyLayers} premium={isPremium} />
      </Panel>
    </div>
  );
}
