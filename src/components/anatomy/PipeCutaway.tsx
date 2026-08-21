import { motion } from 'framer-motion';
import cutaway from '@/assets/img/anatomy/cutaway.png';
import cutawayPremium from '@/assets/img/anatomy/cutaway-premium.png';
import { MOTION_BASE, MOTION_EASE } from '@/core/constants';
import type { ConstructionPart } from '@/core/types';

export interface PipeCutawayProps {
  parts: ConstructionPart[];
  selectedId: string | null;
  /** Premium connections are shown with their own sectioned render. */
  premium?: boolean;
}

/** Photoreal cutaway; the selected element tints the surrounding accent. */
export function PipeCutaway({ parts, selectedId, premium = false }: PipeCutawayProps) {
  const selected = parts.find((part) => part.id === selectedId) ?? null;
  const accent = selected?.color ?? 'transparent';

  return (
    <div className="relative flex h-full w-full items-center justify-center p-2">
      <motion.div
        className="absolute inset-3 rounded-2xl"
        initial={false}
        animate={{ boxShadow: selected ? `inset 0 0 0 3px ${accent}` : 'inset 0 0 0 0px transparent' }}
        transition={{ duration: MOTION_BASE, ease: MOTION_EASE }}
      />
      <img
        src={premium ? cutawayPremium : cutaway}
        alt={premium ? 'Разрез премиум-соединения' : 'Разрез бесшовной трубы с муфтой'}
        className="max-h-full max-w-full object-contain drop-shadow-sm"
      />
      {selected ? (
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION_BASE, ease: MOTION_EASE }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-line bg-white/90 px-3 py-1 text-[12px] font-bold text-ink-900 shadow-card backdrop-blur"
        >
          <span
            className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
            style={{ backgroundColor: accent }}
          />
          {selected.name}
        </motion.div>
      ) : null}
    </div>
  );
}
