// BackContent.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Gift } from '@/lib/types';
import { X, ExternalLink } from 'lucide-react';

interface BackContentProps {
  gift: Gift;
  isFlipped: boolean;
  onClose: (e: React.MouseEvent) => void;
  userCanCancel: boolean;
  onCancelReservation: (e: React.MouseEvent) => Promise<void>;
  onShowModal: (e: React.MouseEvent) => void;
}

export const BackContent = ({
  gift,
  isFlipped,
  onClose,
  userCanCancel,
  onCancelReservation,
  onShowModal
}: BackContentProps) => {
  const reservationInfo = gift.reservation && !gift.reservation.isAnonymous
    ? `Réservé par ${gift.reservation.firstName}`
    : "Déjà réservé";

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <motion.h3 
          className="font-medium text-xl text-gray-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 20 }}
          transition={{ delay: 0.2 }}
        >
          {gift.title}
        </motion.h3>
        
        <motion.button
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
        >
          <X className="w-4 h-4 text-gray-600" />
        </motion.button>
      </div>

      {gift.description && (
        <motion.div 
          className="flex-1 overflow-y-auto mb-6 pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isFlipped ? 1 : 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">
            {gift.description}
          </p>
        </motion.div>
      )}

      <motion.div 
        className="space-y-3 mt-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 20 }}
        transition={{ delay: 0.4 }}
      >
        {gift.productUrl && (
          <a 
            href={gift.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 w-full text-gray-600 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
          >
            <span className="text-sm font-medium group-hover:text-gray-900">
              Voir le produit
            </span>
            <ExternalLink className="w-4 h-4 group-hover:text-gray-900" />
          </a>
        )}

        {gift.reservation ? (
          <div className="text-center space-y-3">
            <p className="text-gray-600 font-medium">
              {reservationInfo}
            </p>
            {userCanCancel && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancelReservation}
                className="w-full text-rose-600 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors font-medium"
              >
                Annuler ma réservation
              </motion.button>
            )}
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onShowModal}
            className="w-full text-white py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 transition-colors font-medium"
          >
            Réserver
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};