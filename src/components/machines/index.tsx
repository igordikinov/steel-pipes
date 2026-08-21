import { memo, type ComponentType } from 'react';
import type { MachineKind } from '@/core/types';
import {
  BufferRack,
  CuttingMachine,
  InspectionMachine,
  StraightenerMachine,
  WarehouseRack,
} from './FinishingMachines';
import {
  BilletStock,
  ContinuousMill,
  CoolingBed,
  PiercingMill,
  ReducingMill,
  RingFurnace,
} from './HotMillMachines';
import {
  BundleMachine,
  CouplingMachine,
  ThreadCheckMachine,
  ThreadingMachine,
} from './ThreadingMachines';
import type { MachineProps } from './parts';

const REGISTRY: Record<MachineKind, ComponentType<MachineProps>> = {
  billets: BilletStock,
  furnace: RingFurnace,
  piercer: PiercingMill,
  mill: ContinuousMill,
  reducer: ReducingMill,
  coolbed: CoolingBed,
  straightener: StraightenerMachine,
  inspection: InspectionMachine,
  cutting: CuttingMachine,
  buffer: BufferRack,
  threading: ThreadingMachine,
  warehouse: WarehouseRack,
  coupling: CouplingMachine,
  threadcheck: ThreadCheckMachine,
  bundle: BundleMachine,
};

export interface MachineArtProps extends MachineProps {
  kind: MachineKind;
}

/**
 * Memoised so that 60 fps canvas updates never restart machine animations.
 * Every drawing is inline SVG — no raster assets are used anywhere.
 */
export const MachineArt = memo(function MachineArt({ kind, ...props }: MachineArtProps) {
  const Machine = REGISTRY[kind];
  if (!Machine) return null;
  return <Machine {...props} />;
});

export type { MachineProps };
