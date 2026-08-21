/**
 * Renders the production canvas — or the pipe cutaway — to a standalone SVG
 * file so the hand-drawn artwork can be reviewed without a compositing browser.
 *
 * Run with:  node scripts/run-render.mjs [variantId] [minutes|anatomy] [outfile]
 */
import { writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/',
});
const globalAny = globalThis as unknown as Record<string, unknown>;
globalAny.window = dom.window as unknown as Window & typeof globalThis;
globalAny.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { configurable: true, get: () => dom.window.navigator });
globalAny.HTMLElement = dom.window.HTMLElement;
globalAny.SVGElement = dom.window.SVGElement;
globalAny.Element = dom.window.Element;
globalAny.Node = dom.window.Node;
globalAny.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalAny.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalAny.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
globalAny.IS_REACT_ACT_ENVIRONMENT = false;

const { createElement } = await import('react');
const { createRoot } = await import('react-dom/client');
const { ProductionCanvas } = await import('../src/components/canvas/ProductionCanvas');
const { PipeCrossSection } = await import('../src/components/anatomy/PipeCrossSection');
const { FactoryEngine } = await import('../src/core/engine');
const { baselineParams, getScenario, resolveVariant } = await import('../src/core/scenario');
const { VARIANT_COLORS } = await import('../src/core/constants');
import type { VariantId } from '../src/core/types';

const variantId = (process.argv[2] ?? 'casing') as VariantId;
const minutes = Number.isFinite(Number(process.argv[3])) ? Number(process.argv[3]) : 200;
const outfile = process.argv[4] ?? 'canvas.svg';

const scenario = resolveVariant(getScenario(), variantId);
const engine = new FactoryEngine(scenario, baselineParams(scenario));
engine.advance(minutes);
const snapshot = engine.getSnapshot();

const anatomy = process.argv[3] === 'anatomy';
const host = dom.window.document.getElementById('root')!;
createRoot(host).render(
  anatomy
    ? createElement(PipeCrossSection, {
        parts: scenario.construction,
        selectedId: 'eccentricity',
        onSelect: () => {},
      })
    : createElement(ProductionCanvas, {
        scenario,
        snapshot,
        tocMode: false,
        zones: ['Горячий передел', 'Отделка, резьба и контроль', 'Муфты и пакетирование'],
        variantColor: VARIANT_COLORS[variantId],
      }),
);

await new Promise((resolve) => setTimeout(resolve, 600));

const svg = host.querySelector('svg');
if (!svg) {
  console.error('the canvas did not render');
  process.exit(1);
}
svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
const [, , boxWidth, boxHeight] = (svg.getAttribute('viewBox') ?? '0 0 100 100').split(' ').map(Number);
svg.setAttribute('width', String(boxWidth));
svg.setAttribute('height', String(boxHeight));
writeFileSync(outfile, `<?xml version="1.0" encoding="UTF-8"?>\n${svg.outerHTML}`, 'utf8');
console.log(`${outfile}: ${variantId} at ${minutes} min, ${snapshot.units.length} units in flight`);
process.exit(0);
