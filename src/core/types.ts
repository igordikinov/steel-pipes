/**
 * Domain-agnostic factory model: a scenario describes a Factory as Resources,
 * Buffers, Routes, Orders and Events. The seamless pipe mill is only one
 * scenario file — swapping the JSON visualises any other industry.
 */

export type NodeKind = 'source' | 'process' | 'buffer' | 'sink';

/** Key of the SVG renderer used to draw a node. */
export type MachineKind =
  | 'billets'
  | 'furnace'
  | 'piercer'
  | 'mill'
  | 'reducer'
  | 'coolbed'
  | 'straightener'
  | 'inspection'
  | 'cutting'
  | 'buffer'
  | 'threading'
  | 'warehouse'
  | 'coupling'
  | 'threadcheck'
  | 'bundle';

export type ResourceState = 'idle' | 'working' | 'blocked' | 'starved' | 'changeover';

/** Order in which a resource pulls units from its queue in the mixed flow. */
export type SchedulingPolicy = 'fifo' | 'campaigns';

/** Tunable parameters exposed through the Parameter Panel. */
export type ParamKey =
  | 'furnaceTime'
  | 'piercerTime'
  | 'millTime'
  | 'threadingTime'
  | 'inspectionTime'
  | 'threadingCount'
  | 'batchSize'
  | 'bufferCapacity'
  | 'couplingTime'
  | 'couplingCount'
  | 'bundlingMinutes'
  | 'changeoverMinutes'
  | 'campaignSize';

export type Params = Record<ParamKey, number>;

export interface ParamDef {
  key: ParamKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  group: 'time' | 'capacity' | 'premium' | 'mixed';
  hint: string;
}

export interface NodeDef {
  id: string;
  /** 01..12 badge shown on the canvas. */
  index: number;
  name: string;
  subtitle: string;
  kind: NodeKind;
  machine: MachineKind;
  /** Minutes of service per unit. Buffers, sources and sinks use 0. */
  processMinutes: number;
  /** Parallel servers (e.g. 4 threading machines). */
  capacity: number;
  /** Units that may wait in front of the node. */
  queueCapacity: number;
  /** Travel time towards `next`, in simulated minutes. */
  transportMinutes: number;
  next: string | null;
  /** Per-product-type route overrides (mixed flow); falls back to `next`. */
  routes?: Partial<Record<VariantId, string | null>>;
  /** Canvas coordinates in scenario viewBox units. */
  x: number;
  y: number;
  /** +1 when material flows to the right, -1 when it flows to the left. */
  dir: 1 | -1;
  /** Queue rendered as a grid rack rather than a single file. */
  rackColumns?: number;
  /** Parameter that drives `processMinutes`. */
  timeParam?: ParamKey;
  /** Parameter that drives `capacity`. */
  capacityParam?: ParamKey;
  /** Parameter that drives `queueCapacity`. */
  queueParam?: ParamKey;
  /** Parameter driving the tooling-changeover time when the product type switches. */
  changeoverParam?: ParamKey;
  /** Units leaving this node change appearance (billet → shell → pipe → threaded). */
  transformsAppearance?: boolean;
  narration?: string;
}

/** One structural element of the finished product. */
export interface ConstructionPart {
  id: string;
  index: number;
  name: string;
  role: string;
  detail: string;
  color: string;
}

/** One step of the forming sequence: billet → heated → shell → … → pipe. */
export interface AssemblyLayer {
  id: string;
  step: number;
  name: string;
  caption: string;
}

/** A raw material or resource consumed by the line. */
export interface MaterialDef {
  id: string;
  name: string;
  purpose: string;
  /** Share of the conversion cost, in percent. */
  share: number;
  /** Node that consumes it. */
  stage: string;
  color: string;
}

/** One element of the steel grade, in mass percent. */
export interface CompositionEntry {
  symbol: string;
  name: string;
  /** Mass fraction in percent; `basis` marks iron as the remainder. */
  percent: number;
  basis?: boolean;
}

/** Process window: reheat temperature and hydrotest pressure. */
export interface ProcessSpec {
  temperatureC: [number, number];
  pressureBar: [number, number];
}

/** One narrated chapter of the unattended presentation. */
export interface PresentationChapter {
  title: string;
  narration: string;
  toc: boolean;
  aps: boolean;
  /** Parameter overrides applied when the chapter starts. */
  params?: Partial<Params>;
}

/** Product variants share one line; each is a data patch over the scenario. */
export type VariantId = 'casing' | 'tubing' | 'premium';

/** One production order in a release plan; the plan repeats cyclically. */
export interface ReleaseOrder {
  variantId: VariantId;
  /** Units of this type released before advancing to the next order. */
  qty: number;
  /** Optional due time in shift minutes, for OTIF (Phase 2 KPIs). */
  dueMinutes?: number;
}

/** A thin data layer over the base scenario; resolveVariant() folds it away. */
export interface VariantDef {
  id: VariantId;
  /** «Обсадная», «НКТ», «Премиум-соединение». */
  name: string;
  /** Product string shown in the Header, e.g. «Обсадная 168,3 × 8,94 J55». */
  product: string;
  /** «API 5CT» | «Tubing» | «Премиум». */
  badge?: string;
  /** Optional per-variant token colour override; the canonical source is VARIANT_COLORS. */
  tokenColor?: string;
  /** Overrides folded onto the base params. */
  params?: Partial<Params>;
  /** The "after" params for Compare Mode. */
  optimisedParams?: Partial<Params>;
  /** Extra sliders appended to the base paramDefs (e.g. the premium group). */
  extraParamDefs?: ParamDef[];
  /** Field-level patches applied to existing nodes by id (narration, next…). */
  nodesPatch?: Record<string, Partial<NodeDef>>;
  /** New nodes appended to the chain; wired via their own `next` + a predecessor patch. */
  nodesAdd?: NodeDef[];
  /** Overrides the base canvas (premium needs a taller viewBox). */
  canvas?: { width: number; height: number };
  /** Full per-variant lists (simpler than diffing). */
  construction?: ConstructionPart[];
  assemblyLayers?: AssemblyLayer[];
  materials?: MaterialDef[];
  composition?: CompositionEntry[];
  spec?: ProcessSpec;
  /** Extra chapters appended to the base presentation script. */
  presentation?: PresentationChapter[];
}

export interface ScenarioDef {
  id: string;
  name: string;
  product: string;
  unitLabel: string;
  /** Minutes between two consecutive releases of one batch. */
  releaseIntervalMinutes: number;
  canvas: { width: number; height: number };
  nodes: NodeDef[];
  params: Params;
  paramDefs: ParamDef[];
  /** Alternative parameter set used by Compare Mode as the "after" case. */
  optimisedParams: Partial<Params>;
  /** Anatomy of the product, shown by the Anatomy tab. */
  construction: ConstructionPart[];
  /** Forming sequence from billet to finished pipe. */
  assemblyLayers: AssemblyLayer[];
  /** Materials and resources consumed by the line. */
  materials: MaterialDef[];
  /** Steel grade chemistry shown by the Anatomy tab. */
  composition: CompositionEntry[];
  spec: ProcessSpec;
  /** Unattended presentation script; falls back to the built-in default when absent. */
  presentation?: PresentationChapter[];
  /** Product variants selectable in the Header; resolved away before the engine runs. */
  variants?: VariantDef[];
  /** Which variant this resolved scenario represents; stamped on released units. */
  productId?: VariantId;
  /** Deterministic mixed-flow release sequence (Phase 2); repeats cyclically. */
  releasePlan?: ReleaseOrder[];
}

export interface UnitView {
  id: number;
  /** Node the unit belongs to (target node while moving). */
  nodeId: string;
  fromNodeId: string | null;
  phase: 'queued' | 'service' | 'moving' | 'done';
  /** 0..1 within the current phase. */
  progress: number;
  queueIndex: number;
  slotIndex: number;
  createdAt: number;
  /** Count of transformsAppearance nodes passed: billet → hot → shell → pipe → threaded. */
  appearanceStage?: number;
  /** Product variant this unit belongs to, for per-type colouring in the mixed flow. */
  productId?: VariantId;
}

export interface NodeView {
  id: string;
  state: ResourceState;
  queueLength: number;
  queueCapacity: number;
  inService: number;
  capacity: number;
  /** Physical server slots currently drawn, including ones draining after a cut. */
  slotCount: number;
  utilization: number;
  wip: number;
  processed: number;
  processMinutes: number;
  isBottleneck: boolean;
  /** Total minutes this resource has spent retooling (changeover), for KPIs. */
  changeoverMinutes?: number;
}

export interface Kpi {
  throughput: number;
  cycleTimeMinutes: number;
  wip: number;
  queue: number;
  utilization: number;
  bottleneckId: string | null;
  bottleneckName: string;
  bottleneckUtilization: number;
  completed: number;
  released: number;
  /** Per-product-type output and WIP, for the mixed flow. */
  byType?: Array<{ productId: VariantId; completed: number; wip: number }>;
}

export interface HistoryPoint {
  t: number;
  throughput: number;
  wip: number;
  queue: number;
}

export interface Snapshot {
  time: number;
  units: UnitView[];
  nodes: Record<string, NodeView>;
  kpi: Kpi;
  history: HistoryPoint[];
  narration: string;
  narrationAt: number;
}
