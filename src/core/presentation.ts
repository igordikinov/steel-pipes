import type { PresentationChapter, ScenarioDef } from './types';

export type { PresentationChapter } from './types';

/**
 * Built-in fallback script of the unattended demonstration. The scenario data
 * now owns the script (scenario.presentation); this stays as the default so a
 * scenario without a presentation field still runs the base eight chapters.
 */
export const PRESENTATION_SCRIPT: PresentationChapter[] = [
  {
    title: 'Нагрев и прошивка',
    narration: 'Заготовка прогревается до 1250 °C и на прошивном стане раскрывается в гильзу.',
    toc: false,
    aps: false,
    params: { threadingCount: 4, threadingTime: 14, bufferCapacity: 40, batchSize: 1 },
  },
  {
    title: 'Прокатка',
    narration: 'Непрерывный стан и редукционно-растяжной стан выводят трубу на размер за считаные минуты.',
    toc: false,
    aps: false,
  },
  {
    title: 'Ограничение',
    narration: 'Нарезка резьбы занимает 14 минут на трубу — самая медленная операция агрегата.',
    toc: true,
    aps: false,
  },
  {
    title: 'Незавершённое производство',
    narration: 'Трубы копятся в кармане перед резьбонарезным участком, пока горячий передел работает вхолостую.',
    toc: true,
    aps: false,
  },
  {
    title: 'Расширить ограничение',
    narration: 'Теория ограничений: добавляем мощность там, где это важно. Резьбонарезных станков становится с 4 до 8.',
    toc: true,
    aps: false,
    params: { threadingCount: 8, threadingTime: 10, bufferCapacity: 24 },
  },
  {
    title: 'Поток восстановлен',
    narration: 'Карман рассасывается, время цикла падает, выработка выходит на план.',
    toc: false,
    aps: false,
  },
  {
    title: 'Планирование по мощности',
    narration: 'Движок APS планирует каждый заказ с учётом ограниченной мощности по всему маршруту.',
    toc: false,
    aps: true,
  },
  {
    title: 'Планирование поставок',
    narration: 'Стабильный выпуск делает планирование отгрузок и распределение предсказуемым.',
    toc: false,
    aps: false,
  },
];

/** Resolved presentation script for a scenario, or the built-in fallback. */
export function presentationFor(scenario: ScenarioDef): PresentationChapter[] {
  return scenario.presentation && scenario.presentation.length > 0
    ? scenario.presentation
    : PRESENTATION_SCRIPT;
}
