// ReservationOverlay.tsx
import { motion } from 'framer-motion';

interface ReservationOverlayProps {
  reservation: {
    firstName?: string;
    isAnonymous?: boolean;
  };
}

export const ReservationOverlay = ({ reservation }: ReservationOverlayProps) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="text-center px-6"
    >
      <span className="block text-white font-medium text-lg">
        {!reservation.isAnonymous && reservation.firstName
          ? `Réservé par ${reservation.firstName}`
          : "Déjà réservé"}
      </span>
    </motion.div>
  </motion.div>
);