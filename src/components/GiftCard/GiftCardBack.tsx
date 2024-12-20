// GiftCardBack.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Gift } from '@/lib/types';
import { BackContent } from './BackContent';

interface GiftCardBackProps {
  gift: Gift;
  isFlipped: boolean;
  onClose: () => void;
  userCanCancel: boolean;
  onCancelReservation: (e: React.MouseEvent) => Promise<void>;
  onShowModal: (e: React.MouseEvent) => void;
}

export const GiftCardBack = ({
  gift,
  isFlipped,
  onClose,
  userCanCancel,
  onCancelReservation,
  onShowModal
}: GiftCardBackProps) => (
  <div className="absolute w-full h-full backface-hidden rotate-y-180">
    <motion.div 
      className="w-full h-full bg-white rounded-2xl p-6 shadow-lg ring-1 ring-black/5"
      initial={false}
      animate={{ scale: isFlipped ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <BackContent 
        gift={gift}
        isFlipped={isFlipped}
        onClose={onClose}
        userCanCancel={userCanCancel}
        onCancelReservation={onCancelReservation}
        onShowModal={onShowModal}
      />
    </motion.div>
  </div>
);