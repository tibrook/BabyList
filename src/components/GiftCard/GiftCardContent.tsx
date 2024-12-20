// GiftCardContent.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Gift } from '@/lib/types';

interface GiftCardContentProps {
  gift: Gift;
  onFlip: (e: React.MouseEvent) => void;
}

const MobileIndicator = () => (
  <motion.div 
    className="md:hidden flex items-center text-sky-600 text-sm"
    animate={{ x: [0, 5, 0] }}
    transition={{ 
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <span className="mr-1">Voir plus</span>
    <ChevronRight className="w-4 h-4" />
  </motion.div>
);

const DesktopButton = ({ onFlip }: { onFlip: (e: React.MouseEvent) => void }) => (
  <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
    <motion.button
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-600 text-white hover:bg-sky-700 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onFlip}
    >
      <span className="text-sm font-medium">Détails</span>
      <ChevronRight className="w-4 h-4" />
    </motion.button>
  </div>
);

export const GiftCardContent = ({ gift, onFlip }: GiftCardContentProps) => (
  <div className="absolute bottom-0 w-full h-[35%] p-4 bg-white flex flex-col justify-between">
    <div className="flex-1">
      <h3 className="font-medium text-lg text-gray-900 line-clamp-2 group-hover:text-sky-600 transition-colors">
        {gift.title}
      </h3>
    </div>
    
    <div className="flex justify-between items-center mt-2">
      {gift.price !== null && gift.price !== undefined && (
        <motion.span 
          className="text-sky-600 font-semibold flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
        >
          {gift.price.toLocaleString('fr-FR')}€
        </motion.span>
      )}
      
      <MobileIndicator />
      <DesktopButton onFlip={onFlip} />
    </div>
  </div>
);