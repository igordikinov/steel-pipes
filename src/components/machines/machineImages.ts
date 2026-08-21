import type { MachineKind } from '@/core/types';
import billets from '@/assets/img/machines/billets.png';
import bundle from '@/assets/img/machines/bundle.png';
import coolbed from '@/assets/img/machines/coolbed.png';
import coupling from '@/assets/img/machines/coupling.png';
import cutting from '@/assets/img/machines/cutting.png';
import furnace from '@/assets/img/machines/furnace.png';
import inspection from '@/assets/img/machines/inspection.png';
import mill from '@/assets/img/machines/mill.png';
import piercer from '@/assets/img/machines/piercer.png';
import reducer from '@/assets/img/machines/reducer.png';
import straightener from '@/assets/img/machines/straightener.png';
import threadcheck from '@/assets/img/machines/threadcheck.png';
import threading from '@/assets/img/machines/threading.png';

/**
 * Realistic equipment renders for the process stations. Buffer and warehouse
 * are intentionally absent — those keep their SVG racks, which fill pipe by
 * pipe with the live stock; on the constraint story that queue is the point.
 */
export const MACHINE_IMAGES: Partial<Record<MachineKind, string>> = {
  billets,
  furnace,
  piercer,
  mill,
  reducer,
  coolbed,
  straightener,
  inspection,
  cutting,
  threading,
  coupling,
  threadcheck,
  bundle,
};
