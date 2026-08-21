/**
 * Headless render smoke test.
 *
 * Boots the real application inside jsdom, lets the animation loop run and
 * asserts that the canvas, KPI panel and controls are actually produced.
 * Run with:  npm run smoke
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/',
});

const view = dom.window as unknown as Window & typeof globalThis;
const globalAny = globalThis as unknown as Record<string, unknown>;

globalAny.window = view;
globalAny.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  get: () => dom.window.navigator,
});
globalAny.HTMLElement = dom.window.HTMLElement;
globalAny.SVGElement = dom.window.SVGElement;
globalAny.Element = dom.window.Element;
globalAny.Node = dom.window.Node;
globalAny.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalAny.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalAny.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
globalAny.IS_REACT_ACT_ENVIRONMENT = false;

class StubObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalAny.ResizeObserver = StubObserver;
globalAny.IntersectionObserver = StubObserver;
(dom.window as unknown as Record<string, unknown>).ResizeObserver = StubObserver;

// jsdom ships no canvas backend; lottie-web probes one when it loads.
dom.window.HTMLCanvasElement.prototype.getContext = (() => ({
  fillStyle: '',
  fillRect: () => {},
  clearRect: () => {},
  getImageData: () => ({ data: [] }),
  putImageData: () => {},
  createImageData: () => [],
  setTransform: () => {},
  drawImage: () => {},
  save: () => {},
  restore: () => {},
  beginPath: () => {},
  closePath: () => {},
  measureText: () => ({ width: 0 }),
})) as unknown as HTMLCanvasElement['getContext'];

const matchMedia = () => ({
  matches: false,
  media: '',
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});
globalAny.matchMedia = matchMedia;
(dom.window as unknown as Record<string, unknown>).matchMedia = matchMedia;

const { createElement } = await import('react');
const { createRoot } = await import('react-dom/client');
const { default: App } = await import('../src/App');
const { getScenario } = await import('../src/core/scenario');

const container = dom.window.document.getElementById('root')!;
const root = createRoot(container);
root.render(createElement(App));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const press = (label: string) => {
  const target = container.querySelector(`[aria-label="${label}"]`);
  target?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
};
const clock = () =>
  container.querySelector('[role="slider"][aria-label="Таймлайн симуляции"]')?.getAttribute('aria-valuenow') ??
  '';

await wait(400);
const failures: string[] = [];
const expect = (condition: boolean, message: string) => {
  if (!condition) failures.push(message);
};
const scenario = getScenario();

const idleClock = clock();
press('Пуск');
await wait(900);
const runningClock = clock();
expect(runningClock !== idleClock, 'the simulation clock did not advance after Play');
expect(Number(runningClock) > 0, `expected a positive clock, got "${runningClock}"`);

press('Показать ТОС');
await wait(200);
press('Показать APS');
await wait(200);
expect(container.textContent?.includes('Планировщик по мощности') === true, 'the APS overlay did not open');
press('Пауза');
await wait(120);

// Reference tabs: anatomy of the product and its bill of materials.
press('Анатомия');
await wait(300);
const anatomyText = container.textContent ?? '';
for (const part of scenario.construction) {
  expect(anatomyText.includes(part.name), `anatomy tab is missing "${part.name}"`);
}
for (const layer of scenario.assemblyLayers) {
  expect(anatomyText.includes(layer.name), `assembly sequence is missing "${layer.name}"`);
}
expect(anatomyText.includes('Химический состав'), 'the steel chemistry panel is missing');
expect(anatomyText.includes('Формоизменение заготовки'), 'the forming sequence panel is missing');
expect(
  container.querySelector('img[alt*="Разрез"]') !== null,
  'the anatomy tab is missing the photoreal cutaway',
);
press('Схема');
await wait(200);
expect(
  container.querySelector('[aria-label="Разрез бесшовной трубы"]') !== null,
  'the «Схема» toggle does not reveal the SVG section drawing',
);
press('Фото');
await wait(200);

press('Материалы');
await wait(300);
const materialsText = container.textContent ?? '';
for (const material of scenario.materials) {
  expect(materialsText.includes(material.name), `materials tab is missing "${material.name}"`);
}
expect(materialsText.includes('ПОТОК ИНФОРМАЦИИ'), 'the information flow legend is missing');
expect(materialsText.includes('ПОТОК МАТЕРИАЛОВ'), 'the material flow legend is missing');

press('Онлайн');
await wait(200);

const html = container.innerHTML;
const text = container.textContent ?? '';
const svgCount = container.querySelectorAll('svg').length;

expect(/запущено\s+[1-9]/i.test(text), 'no pipes were released into the line');

expect(html.length > 5000, `expected a rich DOM, got ${html.length} characters`);
expect(svgCount >= 2, `expected the production canvas and the chart, found ${svgCount} SVG roots`);
for (const node of scenario.nodes) {
  expect(text.includes(node.name), `station "${node.name}" is missing from the canvas`);
}
for (const label of ['Выработка', 'Время цикла', 'НЗП', 'Очередь', 'Загрузка', 'Узкое место', 'Готовые трубы']) {
  expect(text.includes(label), `KPI card "${label}" is missing`);
}
for (const label of ['Стадии трубы', 'Заготовка', 'Гильза', 'С резьбой']) {
  expect(text.includes(label), `appearance-stage legend is missing "${label}"`);
}
// Casing has no coupling params, so that slider group must not render at all.
expect(!text.includes('Премиум-соединение'), 'the empty «Премиум-соединение» group must not render for casing');
for (const control of ['Пуск', 'Шаг', 'Сброс', 'Показать ТОС', 'Показать APS']) {
  expect(
    container.querySelector(`[aria-label="${control}"]`) !== null,
    `control "${control}" is missing`,
  );
}
expect(
  container.querySelector('[role="slider"][aria-label="Таймлайн симуляции"]') !== null,
  'the timeline scrubber is missing',
);
expect(container.querySelectorAll('button').length === 0, 'native <button> elements must not be used');
expect(container.querySelectorAll('input').length === 0, 'native <input> elements must not be used');

// Switching to the premium variant reveals the coupling branch and its sliders.
const svgRootsCasing = container.querySelectorAll('svg').length;
press('Премиум');
await wait(250);
for (const label of ['Навинчивание муфт', 'Муфтонаверточные стенды', 'Пакетирование']) {
  expect(
    container.querySelector(`[aria-label="${label}"]`) !== null,
    `premium slider "${label}" is missing for the premium variant`,
  );
}
const premiumText = container.textContent ?? '';
for (const node of ['Навинчивание муфт', 'Контроль резьбы', 'Пакетирование', 'С муфтой']) {
  expect(premiumText.includes(node), `premium canvas/legend is missing "${node}"`);
}
expect(
  container.querySelectorAll('svg').length >= svgRootsCasing,
  'the premium canvas lost SVG roots after the variant switch',
);
// Process stations render as photos; the racks stay SVG so live stock fills them.
expect(
  container.querySelectorAll('svg image').length > 0,
  'the canvas is missing the photoreal machine renders',
);
expect(
  container.querySelectorAll('button').length === 0 && container.querySelectorAll('input').length === 0,
  'native <button>/<input> elements must not appear after switching variant',
);
press('Анатомия');
await wait(300);
const premiumAnatomy = container.textContent ?? '';
expect(premiumAnatomy.includes('Уплотнительный узел'), 'premium anatomy is missing the seal construction element');
expect(premiumAnatomy.includes('Клиновидная резьба'), 'the ThreadCallout is missing from premium anatomy');
expect(
  container.querySelector('[aria-label="Анатомия премиум-соединения"]') !== null,
  'premium anatomy is missing the made-up joint drawing',
);
press('Материалы');
await wait(300);
const premiumMaterials = container.textContent ?? '';
expect(premiumMaterials.includes('Муфты премиум-соединения'), 'premium materials table is missing the coupling row');
expect(premiumMaterials.includes('единственный материал'), 'premium materials is missing the post-constraint note');
press('Онлайн');
await wait(150);
press('Обсадная');
await wait(150);

// Mixed flow: the «Микс» switch reveals the plan/policy controls and its sliders.
press('Микс');
await wait(250);
const mixedText = container.textContent ?? '';
for (const label of ['Базовый портфель', 'Глубокие скважины', 'FIFO', 'Кампании']) {
  expect(mixedText.includes(label), `mixed-flow panel is missing the "${label}" control`);
}
for (const slider of ['Переналадка инструмента', 'Размер кампании']) {
  expect(container.querySelector(`[aria-label="${slider}"]`) !== null, `mixed-flow slider "${slider}" is missing`);
}
press('Глубокие скважины');
await wait(150);
expect((container.textContent ?? '').includes('10 / 40 / 50'), 'switching to the deep-well plan did not update the mix ratio');
press('Кампании');
await wait(150);
press('Обсадная');
await wait(150);

// Presentation script now travels in scenario data; the director must run it.
press('Презентация');
await wait(400);
expect(
  (container.textContent ?? '').includes('раскрывается в гильзу'),
  'the presentation did not open its first chapter from scenario data',
);
press('Онлайн');
await wait(150);

// Compare mode offers a pair selector; the variant pair mirrors two plants.
press('Сравнение');
await wait(300);
expect((container.textContent ?? '').includes('База vs Оптимизация'), 'the compare pair selector is missing');
press('Обсадная vs Премиум');
await wait(300);
expect(
  (container.textContent ?? '').includes('премиум-соединение'),
  'the variant compare pane did not switch to the premium line',
);
press('Онлайн');
await wait(150);

// Every process station on the line must have a render; buffer and warehouse
// deliberately do not, because their SVG racks visualise live stock.
const { MACHINE_IMAGES } = await import('../src/components/machines/machineImages');
for (const kind of [
  'billets', 'furnace', 'piercer', 'mill', 'reducer', 'coolbed', 'straightener',
  'inspection', 'cutting', 'threading', 'coupling', 'threadcheck', 'bundle',
]) {
  const href = (MACHINE_IMAGES as Record<string, string | undefined>)[kind];
  expect(typeof href === 'string' && href.length > 0, `MACHINE_IMAGES is missing a render for "${kind}"`);
}
for (const kind of ['buffer', 'warehouse']) {
  expect(
    (MACHINE_IMAGES as Record<string, string | undefined>)[kind] === undefined,
    `"${kind}" must keep its SVG rack, not a photo`,
  );
}

// Product token: cold billet -> heated -> shell -> pipe -> threaded -> coupled,
// with the edge tinted by the variant once the steel is no longer glowing.
const { PipeToken } = await import('../src/components/canvas/PipeToken');
const VARIANT_EDGE = '#2E86C1';
const tokenHosts = [0, 2, 4, 5].map((stage) => {
  const host = dom.window.document.createElement('div');
  createRoot(host).render(
    createElement(
      'svg',
      null,
      createElement(PipeToken, {
        x: 0,
        y: 0,
        stage,
        variantColor: VARIANT_EDGE,
        moving: false,
        highlighted: false,
        dimmed: false,
      }),
    ),
  );
  return host;
});
await wait(120);
const [billetToken, shellToken, threadedToken, coupledToken] = tokenHosts.map((host) => host.innerHTML);
const boreCount = (svg: string) => (svg.match(/<ellipse/g) ?? []).length;
const lineCount = (svg: string) => (svg.match(/<line/g) ?? []).length;
expect(boreCount(billetToken) === 0, 'a solid billet must not show a bore');
expect(boreCount(shellToken) === 2, `a pierced shell must show both bore ends, got ${boreCount(shellToken)}`);
expect(lineCount(threadedToken) > lineCount(shellToken), 'a threaded pipe must add thread crests');
expect(coupledToken.includes('#5D7A94'), 'a coupled pipe must draw the coupling collar');
expect(
  billetToken.includes(VARIANT_EDGE) && coupledToken.includes(VARIANT_EDGE),
  'token edge must use the variant colour once the steel is cold',
);

// --- M2: panels reachable on a phone-width viewport (§6.4.1) ---
press('Онлайн');
await wait(150);
Object.defineProperty(dom.window, 'innerWidth', { value: 390, configurable: true, writable: true });
Object.defineProperty(dom.window, 'innerHeight', { value: 844, configurable: true, writable: true });
dom.window.dispatchEvent(new dom.window.Event('resize'));
await wait(150);

expect(
  container.querySelector('[aria-label="Параметры"]') !== null,
  'mobile: the «Параметры» toolbar button is missing at 390px',
);
press('Параметры');
await wait(200);
const paramSheet = container.querySelector('[role="dialog"]');
expect(paramSheet !== null, 'mobile: the parameters sheet did not open as a role="dialog"');
expect(
  container.querySelector('[role="slider"][aria-label="Нагрев заготовки"]') !== null,
  'mobile: the parameters sheet does not contain a parameter slider',
);
expect(
  container.querySelectorAll('button').length === 0 && container.querySelectorAll('input').length === 0,
  'mobile: native <button>/<input> elements must not appear in the sheet layout',
);
press('Закрыть');
await wait(500);
expect(
  container.querySelector('[role="dialog"]') === null,
  'mobile: the parameters sheet did not close after pressing Закрыть',
);

root.unmount();

if (failures.length > 0) {
  console.error('SMOKE RENDER FAILED');
  failures.forEach((message) => console.error(`  - ${message}`));
  process.exit(1);
}
console.log(
  `SMOKE RENDER PASSED — ${html.length} characters of DOM, ${svgCount} SVG roots, clock at ${runningClock} min`,
);
process.exit(0);
