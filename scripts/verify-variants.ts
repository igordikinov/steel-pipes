/**
 * Headless checks for the product-variant data layer.
 *
 * `resolveVariant(scenario, variantId)` must fold a variant patch into the base
 * scenario and hand back a *plain* ScenarioDef — the engine, canvas and KPIs
 * never learn that variants exist. These asserts pin that contract with a small
 * inline fixture, independent of the real seamless-pipe-mill.json data.
 *
 * Exposed as checkVariants() so run-verify bundles a single entrypoint.
 */
import {
  DEFAULT_BUNDLING_MINUTES,
  DEFAULT_COUPLING_COUNT,
  DEFAULT_COUPLING_TIME,
  ECCENTRICITY_TOLERANCE_PERCENT,
  THREAD_CALLOUT_HEIGHT,
  THREAD_CALLOUT_WIDTH,
  VARIANT_COLORS,
  WALL_TOLERANCE_PERCENT,
} from '../src/core/constants';
import { HORIZON_MINUTES } from '../src/core/constants';
import { FactoryEngine } from '../src/core/engine';
import { RELEASE_PLANS } from '../src/core/releasePlans';
import { baselineParams, DEFAULT_VARIANT_ID, listVariants, resolveMixed, resolveVariant } from '../src/core/scenario';
import type { ParamDef, ReleaseOrder, ScenarioDef, VariantId } from '../src/core/types';
import scenarioJson from '../src/scenarios/seamless-pipe-mill.json';

const REAL = scenarioJson as unknown as ScenarioDef;

const PARAM_DEF: ParamDef = {
  key: 'threadingTime',
  label: 'Нарезка резьбы',
  unit: 'мин',
  min: 4,
  max: 24,
  step: 0.5,
  group: 'time',
  hint: '',
};

function makeBase(): ScenarioDef {
  return {
    id: 'fixture',
    name: 'Base',
    product: 'Base product',
    unitLabel: 'труба',
    releaseIntervalMinutes: 5,
    canvas: { width: 100, height: 100 },
    nodes: [
      { id: 'src', index: 1, name: 'Src', subtitle: '', kind: 'source', machine: 'billets', processMinutes: 0, capacity: 1, queueCapacity: 0, transportMinutes: 0, next: 'insp', x: 0, y: 0, dir: 1 },
      { id: 'insp', index: 2, name: 'Insp', subtitle: '', kind: 'process', machine: 'inspection', processMinutes: 1, capacity: 1, queueCapacity: 2, transportMinutes: 0, next: 'sink', x: 10, y: 0, dir: 1 },
      { id: 'sink', index: 3, name: 'W', subtitle: '', kind: 'sink', machine: 'warehouse', processMinutes: 0, capacity: 0, queueCapacity: 0, transportMinutes: 0, next: null, x: 20, y: 0, dir: 1 },
    ],
    params: { furnaceTime: 6, piercerTime: 1.6, millTime: 1.5, threadingTime: 14, inspectionTime: 2, threadingCount: 4, batchSize: 1, bufferCapacity: 40, couplingTime: 3, couplingCount: 1, bundlingMinutes: 10, changeoverMinutes: 60, campaignSize: 6 },
    paramDefs: [PARAM_DEF],
    optimisedParams: { threadingCount: 8 },
    construction: [],
    assemblyLayers: [],
    materials: [],
    composition: [],
    spec: { temperatureC: [1230, 1280], pressureBar: [190, 250] },
    variants: [
      { id: 'casing', name: 'Обсадная', product: 'Обсадная 168,3 × 8,94', badge: 'API 5CT', tokenColor: '#111' },
      {
        id: 'premium',
        name: 'Премиум-соединение',
        product: 'Обсадная 244,5 × 11,99 P110',
        badge: 'Премиум',
        tokenColor: '#2244ff',
        params: { threadingTime: 16 },
        optimisedParams: { couplingTime: 3 },
        extraParamDefs: [
          { key: 'couplingTime', label: 'Навинчивание муфт', unit: 'мин', min: 1, max: 8, step: 0.5, group: 'premium', hint: '' },
        ],
        canvas: { width: 200, height: 300 },
        nodesPatch: { insp: { next: 'coupling' }, sink: { x: 30 } },
        nodesAdd: [
          { id: 'coupling', index: 4, name: 'Навинчивание муфт', subtitle: '', kind: 'process', machine: 'coupling', processMinutes: 3, capacity: 1, queueCapacity: 6, transportMinutes: 0, next: 'threadCheck', x: 10, y: 100, dir: 1, transformsAppearance: true },
          { id: 'threadCheck', index: 5, name: 'Контроль соединения', subtitle: '', kind: 'process', machine: 'threadcheck', processMinutes: 1.2, capacity: 1, queueCapacity: 6, transportMinutes: 0, next: 'sink', x: 20, y: 100, dir: 1 },
        ],
      },
    ],
  };
}

export function checkVariants(): string[] {
  const failures: string[] = [];
  const expect = (cond: boolean, message: string) => {
    if (!cond) failures.push(message);
  };

  // Default variant id is the casing line.
  expect(DEFAULT_VARIANT_ID === 'casing', `expected default variant "casing", got "${DEFAULT_VARIANT_ID}"`);

  // Casing: product overridden, mill name preserved, no structural change.
  const base = makeBase();
  const casing = resolveVariant(base, 'casing');
  expect(casing.name === 'Base', `mill name must be preserved, got "${casing.name}"`);
  expect(casing.product === 'Обсадная 168,3 × 8,94', `casing product not applied: "${casing.product}"`);
  expect(casing.params.threadingTime === 14, `casing must keep base threadingTime 14, got ${casing.params.threadingTime}`);
  expect(casing.nodes.length === 3, `casing must keep 3 nodes, got ${casing.nodes.length}`);
  expect((casing as { variants?: unknown }).variants === undefined, 'resolved scenario must not carry the variants array');

  // Premium: params, optimised, paramDefs, canvas and node chain all folded in.
  const premium = resolveVariant(base, 'premium');
  expect(premium.name === 'Base', `mill name must be preserved for premium, got "${premium.name}"`);
  expect(premium.product === 'Обсадная 244,5 × 11,99 P110', `premium product not applied: "${premium.product}"`);
  expect(premium.params.threadingTime === 16, `premium threadingTime override failed: ${premium.params.threadingTime}`);
  expect(premium.params.couplingTime === 3, `premium must keep base couplingTime 3, got ${premium.params.couplingTime}`);
  expect(premium.optimisedParams.threadingCount === 8, `premium must keep base optimised threadingCount 8, got ${String(premium.optimisedParams.threadingCount)}`);
  expect(premium.optimisedParams.couplingTime === 3, `premium optimised couplingTime not merged: ${String(premium.optimisedParams.couplingTime)}`);
  expect(premium.paramDefs.length === 2, `premium must append extraParamDefs (expected 2), got ${premium.paramDefs.length}`);
  expect(premium.canvas.width === 200 && premium.canvas.height === 300, `premium canvas override failed: ${JSON.stringify(premium.canvas)}`);
  expect(premium.nodes.length === 5, `premium must have 3 base + 2 added nodes, got ${premium.nodes.length}`);
  const insp = premium.nodes.find((n) => n.id === 'insp');
  expect(insp?.next === 'coupling', `premium predecessor rewire failed: insp.next="${String(insp?.next)}"`);
  const sink = premium.nodes.find((n) => n.id === 'sink');
  expect(sink?.x === 30, `premium nodesPatch on sink failed: sink.x=${String(sink?.x)}`);
  const couplingNode = premium.nodes.find((n) => n.id === 'coupling');
  expect(couplingNode?.machine === 'coupling', `coupling node missing or wrong machine: ${String(couplingNode?.machine)}`);
  expect(couplingNode?.transformsAppearance === true, 'coupling node must set transformsAppearance');

  // Purity: the base scenario is never mutated.
  expect(base.nodes.find((n) => n.id === 'insp')?.next === 'sink', 'resolveVariant mutated base node chain');
  expect(base.params.threadingTime === 14, 'resolveVariant mutated base params');
  expect(base.paramDefs.length === 1, 'resolveVariant mutated base paramDefs');

  // A scenario without a variants block resolves to itself, no crash.
  const plain = makeBase();
  delete (plain as { variants?: unknown }).variants;
  const fallback = resolveVariant(plain, 'premium');
  expect(fallback.nodes.length === 3, `variant-less scenario must pass through unchanged, got ${fallback.nodes.length} nodes`);

  return failures;
}

/** The real seamless-pipe-mill.json variants block resolves to the expected lines. */
export function checkScenarioVariants(): string[] {
  const failures: string[] = [];
  const expect = (cond: boolean, message: string) => {
    if (!cond) failures.push(message);
  };

  const ids = listVariants(REAL).map((v) => v.id);
  expect(
    ids.length === 3 && ['casing', 'tubing', 'premium'].every((i) => ids.includes(i as VariantId)),
    `scenario must declare casing/tubing/premium, got ${JSON.stringify(ids)}`,
  );

  // Base params must be a complete dictionary including the premium keys.
  expect(REAL.params.couplingTime === 3 && REAL.params.couplingCount === 1 && REAL.params.bundlingMinutes === 10,
    'base params must default the premium keys (3/1/10)');

  // Casing = current defaults, 12 nodes, mill name preserved.
  const casing = resolveVariant(REAL, 'casing');
  expect(casing.nodes.length === 12, `casing must keep 12 nodes, got ${casing.nodes.length}`);
  expect(casing.name === REAL.name, 'casing must preserve the mill name');
  expect(casing.params.furnaceTime === 6 && casing.params.threadingTime === 14, 'casing params must match base defaults');
  expect(casing.product.includes('Обсадная'), `casing product should read "Обсадная…", got "${casing.product}"`);

  // Tubing: smaller pipe rolls and threads faster, same 12 nodes.
  const tubing = resolveVariant(REAL, 'tubing');
  expect(tubing.params.piercerTime === 1.2 && tubing.params.threadingTime === 11, 'tubing params must be piercer 1.2 / threading 11');
  expect(tubing.optimisedParams.threadingTime === 8, `tubing optimised threadingTime must be 8, got ${String(tubing.optimisedParams.threadingTime)}`);
  expect(tubing.nodes.length === 12, `tubing must keep 12 nodes, got ${tubing.nodes.length}`);

  // Premium: three extra nodes, taller canvas, three extra sliders.
  const premium = resolveVariant(REAL, 'premium');
  expect(premium.nodes.length === 15, `premium must have 15 nodes, got ${premium.nodes.length}`);
  expect(premium.canvas.height === 1240 && premium.canvas.width === 1850, `premium canvas must be 1850×1240, got ${JSON.stringify(premium.canvas)}`);
  expect(premium.paramDefs.length === 11, `premium must expose 11 sliders (8+3), got ${premium.paramDefs.length}`);
  expect(premium.params.couplingTime === 3 && premium.params.couplingCount === 1 && premium.params.bundlingMinutes === 10, 'premium coupling params must default 3/1/10');
  expect(premium.optimisedParams.couplingTime === 3, `premium optimised must add couplingTime 3, got ${String(premium.optimisedParams.couplingTime)}`);

  const by = Object.fromEntries(premium.nodes.map((n) => [n.id, n]));
  expect(by.threading?.next === 'coupling', `threading must route into the coupling stand, got "${String(by.threading?.next)}"`);
  expect(by.coupling?.machine === 'coupling' && by.coupling?.transformsAppearance === true, 'coupling node must use the coupling machine and transform appearance');
  expect(by.coupling?.timeParam === 'couplingTime' && by.coupling?.capacityParam === 'couplingCount', 'coupling node must bind couplingTime/couplingCount');
  expect(by.bundling?.kind === 'process' && by.bundling?.capacity === 12 && by.bundling?.timeParam === 'bundlingMinutes', 'bundling must be a process node with capacity 12 driven by bundlingMinutes');
  expect(by.bundling?.machine === 'bundle', `bundling must use the bundle art, got machine "${String(by.bundling?.machine)}"`);
  expect(
    by.coupling?.next === 'threadCheck' && by.threadCheck?.next === 'bundling' && by.bundling?.next === 'warehouse' && by.warehouse?.next === null,
    'premium chain must be threading→coupling→threadCheck→bundling→warehouse→∅',
  );
  // Serpentine third row lives below the base two rows.
  expect(by.threadCheck?.y === 1040 && by.bundling?.y === 1040 && by.warehouse?.y === 1040, 'third row nodes must sit at y=1040');

  // Cost structure: each variant's shares sum to 100%, couplings only on premium.
  for (const id of ['casing', 'tubing', 'premium'] as VariantId[]) {
    const materials = resolveVariant(REAL, id).materials;
    const sum = materials.reduce((total, material) => total + material.share, 0);
    expect(sum === 100, `${id} material shares must sum to 100, got ${sum}`);
    const hasCouplingStage = materials.some((material) => material.stage === 'coupling');
    expect(hasCouplingStage === (id === 'premium'), `${id} coupling-stage material presence is wrong (${hasCouplingStage})`);
  }

  // Steel grade: every variant declares a chemistry with iron as the basis.
  for (const id of ['casing', 'tubing', 'premium'] as VariantId[]) {
    const composition = resolveVariant(REAL, id).composition;
    expect(composition.length >= 6, `${id} must declare a steel chemistry, got ${composition.length} entries`);
    expect(composition.filter((element) => element.basis).length === 1, `${id} must mark exactly one element as the basis`);
  }

  // Presentation: base 8 chapters, tubing +1, premium +2 (last = constraint migration).
  expect(resolveVariant(REAL, 'casing').presentation?.length === 8, `casing must keep 8 chapters, got ${resolveVariant(REAL, 'casing').presentation?.length}`);
  expect(resolveVariant(REAL, 'tubing').presentation?.length === 9, `tubing must have 9 chapters, got ${resolveVariant(REAL, 'tubing').presentation?.length}`);
  const premiumScript = resolveVariant(REAL, 'premium').presentation;
  expect(premiumScript?.length === 10, `premium must have 10 chapters, got ${premiumScript?.length}`);
  expect(
    premiumScript?.[9]?.title === 'Миграция ограничения' && premiumScript?.[9]?.params?.threadingCount === 8 && premiumScript?.[9]?.params?.couplingTime === 4,
    'premium final chapter must be the constraint migration with threadingCount 8 / couplingTime 4',
  );

  return failures;
}

/**
 * Every resolved variant must run in a freshly-created engine and stay
 * deterministic: a jittery live run and a single seek() must land bit-identical.
 */
export function checkVariantDeterminism(): string[] {
  const failures: string[] = [];
  const ids: VariantId[] = ['casing', 'tubing', 'premium'];

  for (const id of ids) {
    const sc = resolveVariant(REAL, id);
    const params = baselineParams(sc);

    const live = new FactoryEngine(sc, { ...params });
    let elapsed = 0;
    let seed = 7;
    while (elapsed < HORIZON_MINUTES) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      const frame = Math.min(0.02 + (seed / 2147483648) * 0.12, HORIZON_MINUTES - elapsed);
      live.advance(frame);
      elapsed += frame;
    }
    const replay = new FactoryEngine(sc, { ...params });
    replay.seek(HORIZON_MINUTES);

    const a = live.getSnapshot();
    const b = replay.getSnapshot();
    if (a.kpi.completed !== b.kpi.completed || a.kpi.wip !== b.kpi.wip) {
      failures.push(
        `variant "${id}" diverges live vs seek(): completed ${a.kpi.completed}/${b.kpi.completed}, wip ${a.kpi.wip}/${b.kpi.wip}`,
      );
    }
    if (a.kpi.completed <= 0) {
      failures.push(`variant "${id}" produced nothing over a full shift — chain likely broken`);
    }
  }

  return failures;
}

/**
 * Units carry an appearance stage = number of transformsAppearance nodes exited
 * (0 billet → 1 heated → 2 shell → 3 pipe → 4 threaded → 5 coupled). Casing has
 * four such nodes, premium adds the coupling stand.
 */
export function checkAppearanceStage(): string[] {
  const failures: string[] = [];

  const scan = (id: VariantId): { min: number; max: number } => {
    const sc = resolveVariant(REAL, id);
    const engine = new FactoryEngine(sc, baselineParams(sc));
    let min = 9;
    let max = -1;
    for (let t = 0; t < HORIZON_MINUTES; t += 1) {
      engine.advance(1);
      for (const unit of engine.getSnapshot().units) {
        const stage = unit.appearanceStage ?? -1;
        if (stage < min) min = stage;
        if (stage > max) max = stage;
      }
    }
    return { min, max };
  };

  const casing = scan('casing');
  if (casing.min !== 0) failures.push(`casing must show cold billets (stage 0), got min ${casing.min}`);
  if (casing.max !== 4) failures.push(`casing max appearance stage must be 4 (threaded), got ${casing.max}`);

  const premium = scan('premium');
  if (premium.min !== 0) failures.push(`premium must show cold billets (stage 0), got min ${premium.min}`);
  if (premium.max !== 5) failures.push(`premium max appearance stage must be 5 (coupled), got ${premium.max}`);

  return failures;
}

/**
 * The premium constraint story: at defaults the threading line is the
 * bottleneck and the coupling stand has spare capacity; widening threading to 8
 * machines and slowing the coupling stand to 4 min migrates the constraint onto
 * the coupling stand. The premium lead time is also strictly longer than casing's.
 */
export function checkBottleneckMigration(): string[] {
  const failures: string[] = [];
  const HORIZON = 300;

  const premium = resolveVariant(REAL, 'premium');
  const casing = resolveVariant(REAL, 'casing');

  const atDefault = new FactoryEngine(premium, baselineParams(premium));
  atDefault.advance(HORIZON);
  const def = atDefault.getSnapshot();
  if (def.kpi.bottleneckId !== 'threading') {
    failures.push(`premium default bottleneck must be the threading line, got "${def.kpi.bottleneckId}"`);
  }
  if (!(def.kpi.throughput > 12 && def.kpi.throughput < 18)) {
    failures.push(`premium default throughput should sit near 15/h, got ${def.kpi.throughput.toFixed(1)}`);
  }

  const migrated = new FactoryEngine(premium, { ...baselineParams(premium), threadingCount: 8, couplingTime: 4 });
  migrated.advance(HORIZON);
  const mig = migrated.getSnapshot();
  if (mig.kpi.bottleneckId !== 'coupling') {
    failures.push(`with 8 threading machines and couplingTime 4 the constraint must move to the coupling stand, got "${mig.kpi.bottleneckId}"`);
  }

  const casingRun = new FactoryEngine(casing, baselineParams(casing));
  casingRun.advance(HORIZON);
  const casingCycle = casingRun.getSnapshot().kpi.cycleTimeMinutes;
  if (!(def.kpi.cycleTimeMinutes > casingCycle)) {
    failures.push(`premium lead time (${def.kpi.cycleTimeMinutes.toFixed(0)}) must exceed casing (${casingCycle.toFixed(0)})`);
  }

  return failures;
}

/**
 * Every unit carries the product type it belongs to. With a single resolved
 * variant, every in-flight unit reports that variant's id — the basis for
 * per-type colouring, routing and changeovers in the mixed flow.
 */
export function checkUnitProductId(): string[] {
  const failures: string[] = [];
  for (const id of ['casing', 'premium'] as VariantId[]) {
    const sc = resolveVariant(REAL, id);
    if (sc.productId !== id) failures.push(`resolveVariant must tag scenario.productId="${id}", got "${String(sc.productId)}"`);
    const engine = new FactoryEngine(sc, baselineParams(sc));
    engine.advance(90);
    const units = engine.getSnapshot().units;
    if (units.length === 0) {
      failures.push(`variant "${id}" had no in-flight units to check productId`);
      continue;
    }
    const mismatched = units.filter((unit) => unit.productId !== id).length;
    if (mismatched > 0) failures.push(`variant "${id}": ${mismatched}/${units.length} units have the wrong productId`);
  }
  return failures;
}

/**
 * A releasePlan drives a deterministic, RNG-free product mix: the n-th released
 * unit's type follows the cyclic plan pattern, and two runs of the same plan
 * release the same sequence.
 */
export function checkReleasePlan(): string[] {
  const failures: string[] = [];
  const plan = RELEASE_PLANS.standard.plan; // casing×5, tubing×3, premium×2
  const pattern = plan.flatMap((order) => Array<VariantId>(order.qty).fill(order.variantId));
  const scenario: ScenarioDef = { ...resolveVariant(REAL, 'premium'), releasePlan: plan };

  const run = (): Map<number, VariantId | undefined> => {
    const engine = new FactoryEngine(scenario, baselineParams(scenario));
    const seen = new Map<number, VariantId | undefined>();
    for (let t = 0; t < 120; t += 1) {
      engine.advance(1);
      for (const unit of engine.getSnapshot().units) if (!seen.has(unit.id)) seen.set(unit.id, unit.productId);
    }
    return seen;
  };

  const seen = run();
  if (seen.size < 12) failures.push(`releasePlan should release many units, saw ${seen.size}`);
  let offPattern = 0;
  for (const [id, productId] of seen) {
    const expected = pattern[(id - 1) % pattern.length];
    if (productId !== expected) offPattern += 1;
  }
  if (offPattern > 0) failures.push(`releasePlan: ${offPattern}/${seen.size} units do not follow the plan pattern`);

  const seen2 = run();
  if (seen2.size !== seen.size || [...seen].some(([id, pid]) => seen2.get(id) !== pid)) {
    failures.push('releasePlan is not deterministic across runs');
  }
  return failures;
}

/**
 * In the mixed flow, «Нарезка резьбы» routes by product type: only premium
 * units enter the coupling branch; casing and tubing go straight to the
 * warehouse. Premium units must still reach the branch, and no other type may.
 */
export function checkRouting(): string[] {
  const failures: string[] = [];
  const scenario = resolveMixed(REAL, RELEASE_PLANS.standard.plan);
  const engine = new FactoryEngine(scenario, baselineParams(scenario));
  const branch = new Set(['coupling', 'threadCheck', 'bundling']);
  const premiumInBranch = new Set<number>();
  const trespassers = new Set<VariantId>();

  for (let t = 0; t < 300; t += 1) {
    engine.advance(1);
    for (const unit of engine.getSnapshot().units) {
      if (!branch.has(unit.nodeId)) continue;
      if (unit.productId === 'premium') premiumInBranch.add(unit.id);
      else if (unit.productId) trespassers.add(unit.productId);
    }
  }

  if (trespassers.size > 0) {
    failures.push(`non-premium types entered the coupling branch: ${[...trespassers].join(', ')}`);
  }
  if (premiumInBranch.size === 0) {
    failures.push('premium units never reached the coupling branch — routing not applied');
  }

  // Mixed flow stays deterministic: a jittery live run equals a seek() replay.
  const live = new FactoryEngine(scenario, baselineParams(scenario));
  let elapsed = 0;
  let seed = 11;
  while (elapsed < HORIZON_MINUTES) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const frame = Math.min(0.02 + (seed / 2147483648) * 0.12, HORIZON_MINUTES - elapsed);
    live.advance(frame);
    elapsed += frame;
  }
  const replay = new FactoryEngine(scenario, baselineParams(scenario));
  replay.seek(HORIZON_MINUTES);
  const a = live.getSnapshot().kpi;
  const b = replay.getSnapshot().kpi;
  if (a.completed !== b.completed || a.wip !== b.wip) {
    failures.push(`mixed flow diverges live vs seek(): completed ${a.completed}/${b.completed}, wip ${a.wip}/${b.wip}`);
  }
  return failures;
}

/**
 * Threading machines are re-set when the next unit needs different tooling: a
 * mixed plan must drive the threading line into the 'changeover' state, while a
 * single-type plan never does — no type switch, no changeover.
 */
export function checkChangeover(): string[] {
  const failures: string[] = [];

  const sawChangeover = (plan: ReleaseOrder[]): boolean => {
    const scenario: ScenarioDef = { ...resolveMixed(REAL, plan) };
    const engine = new FactoryEngine(scenario, baselineParams(scenario));
    for (let t = 0; t < 300; t += 1) {
      engine.advance(1);
      if (engine.getSnapshot().nodes.threading?.state === 'changeover') return true;
    }
    return false;
  };

  if (!sawChangeover(RELEASE_PLANS.standard.plan)) {
    failures.push('the threading line never retooled under a mixed plan — changeover not applied');
  }
  if (sawChangeover([{ variantId: 'casing', qty: 200 }])) {
    failures.push('the threading line retooled under a single-type plan — changeover should not occur');
  }
  return failures;
}

/**
 * The campaign policy batches same-type units, so it must incur fewer threading
 * changeovers than FIFO for the same mixed plan without losing output — the
 * classic changeover/WIP trade-off.
 */
export function checkSchedulingPolicy(): string[] {
  const failures: string[] = [];
  const scenario = resolveMixed(REAL, RELEASE_PLANS.standard.plan);

  const run = (policy: 'fifo' | 'campaigns') => {
    const engine = new FactoryEngine(scenario, baselineParams(scenario));
    engine.setSchedulingPolicy(policy);
    engine.advance(HORIZON_MINUTES);
    const snap = engine.getSnapshot();
    return { changeover: snap.nodes.threading?.changeoverMinutes ?? 0, completed: snap.kpi.completed };
  };

  const fifo = run('fifo');
  const campaigns = run('campaigns');
  if (!(campaigns.changeover < fifo.changeover)) {
    failures.push(`campaigns should cut changeovers: FIFO ${fifo.changeover} vs campaigns ${campaigns.changeover} min`);
  }
  if (campaigns.completed < fifo.completed) {
    failures.push(`campaigns should not lose output: FIFO ${fifo.completed} vs campaigns ${campaigns.completed}`);
  }
  return failures;
}

/** The mixed flow reports output per product type; the parts sum to the whole. */
export function checkKpiByType(): string[] {
  const failures: string[] = [];
  const scenario = resolveMixed(REAL, RELEASE_PLANS.standard.plan);
  const engine = new FactoryEngine(scenario, baselineParams(scenario));
  engine.advance(HORIZON_MINUTES);
  const kpi = engine.getSnapshot().kpi;
  if (!kpi.byType) {
    failures.push('the mixed flow should expose kpi.byType');
    return failures;
  }
  const sum = kpi.byType.reduce((total, type) => total + type.completed, 0);
  if (sum !== kpi.completed) {
    failures.push(`per-type completions ${sum} must sum to the total ${kpi.completed}`);
  }
  const types = kpi.byType.map((type) => type.productId);
  for (const id of ['casing', 'tubing', 'premium'] as VariantId[]) {
    if (!types.includes(id)) failures.push(`kpi.byType is missing "${id}"`);
  }
  return failures;
}

/**
 * With changeovers eroding effective threading capacity, TOC must still
 * identify a constraint in the mixed flow, and the threading line must actually
 * accrue changeover time — the constraint accounting includes retooling.
 */
export function checkMixedConstraint(): string[] {
  const failures: string[] = [];
  const scenario = resolveMixed(REAL, RELEASE_PLANS.standard.plan);
  const engine = new FactoryEngine(scenario, baselineParams(scenario));
  engine.advance(300);
  const snap = engine.getSnapshot();
  const threading = snap.nodes.threading;
  if (!(threading && (threading.changeoverMinutes ?? 0) > 0)) {
    failures.push('the mixed threading line should accrue changeover time');
  }
  // With changeovers eroding threading, TOC must flag it — not an upstream node.
  if (snap.kpi.bottleneckId !== 'threading') {
    failures.push(`mixed constraint should be the threading line once changeovers bite, got "${String(snap.kpi.bottleneckId)}"`);
  }
  return failures;
}

/** Variant-related constants live in constants.ts and nowhere else. */
export function checkVariantConstants(): string[] {
  const failures: string[] = [];
  const expect = (cond: boolean, message: string) => {
    if (!cond) failures.push(message);
  };
  const hex = /^#[0-9a-fA-F]{6}$/;

  const ids: VariantId[] = ['casing', 'tubing', 'premium'];
  for (const id of ids) {
    const color = VARIANT_COLORS[id];
    expect(hex.test(color ?? ''), `VARIANT_COLORS.${id} must be a #rrggbb hex, got "${String(color)}"`);
  }
  const distinct = new Set(ids.map((id) => VARIANT_COLORS[id]));
  expect(distinct.size === ids.length, 'each variant must have a distinct token colour');

  // Defaults for the three premium params.
  expect(DEFAULT_COUPLING_TIME === 3, `DEFAULT_COUPLING_TIME expected 3, got ${DEFAULT_COUPLING_TIME}`);
  expect(DEFAULT_COUPLING_COUNT === 1, `DEFAULT_COUPLING_COUNT expected 1, got ${DEFAULT_COUPLING_COUNT}`);
  expect(DEFAULT_BUNDLING_MINUTES === 10, `DEFAULT_BUNDLING_MINUTES expected 10, got ${DEFAULT_BUNDLING_MINUTES}`);

  // Seamless pipe tolerances: wall −12.5 %, eccentricity ±10 %.
  expect(WALL_TOLERANCE_PERCENT === 12.5, `WALL_TOLERANCE_PERCENT expected 12.5, got ${WALL_TOLERANCE_PERCENT}`);
  expect(ECCENTRICITY_TOLERANCE_PERCENT === 10, `ECCENTRICITY_TOLERANCE_PERCENT expected 10, got ${ECCENTRICITY_TOLERANCE_PERCENT}`);

  // ThreadCallout box dimensions are positive viewBox units.
  expect(THREAD_CALLOUT_WIDTH > 0, `THREAD_CALLOUT_WIDTH must be positive, got ${THREAD_CALLOUT_WIDTH}`);
  expect(THREAD_CALLOUT_HEIGHT > 0, `THREAD_CALLOUT_HEIGHT must be positive, got ${THREAD_CALLOUT_HEIGHT}`);

  return failures;
}
