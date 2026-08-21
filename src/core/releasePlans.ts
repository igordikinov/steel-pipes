import type { ReleaseOrder } from './types';

/**
 * Order-mix presets for the mixed flow. Each plan is a deterministic, RNG-free
 * sequence of production orders that repeats cyclically; the quantities encode
 * the casing / tubing / premium share of the order book.
 */
export interface ReleasePlanPreset {
  id: string;
  name: string;
  /** Casing / tubing / premium percentage, for labels. */
  mix: string;
  plan: ReleaseOrder[];
}

export const RELEASE_PLANS: Record<string, ReleasePlanPreset> = {
  standard: {
    id: 'standard',
    name: 'Базовый портфель',
    mix: '50 / 30 / 20',
    plan: [
      { variantId: 'casing', qty: 5 },
      { variantId: 'tubing', qty: 3 },
      { variantId: 'premium', qty: 2 },
    ],
  },
  deepwells: {
    id: 'deepwells',
    name: 'Глубокие скважины',
    mix: '10 / 40 / 50',
    plan: [
      { variantId: 'casing', qty: 1 },
      { variantId: 'tubing', qty: 4 },
      { variantId: 'premium', qty: 5 },
    ],
  },
};

export const DEFAULT_RELEASE_PLAN_ID = 'standard';
