import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface DesktopButtonProps {
  onFlip: () => void;
}

export const DesktopButton = ({ onFlip }: DesktopButtonProps) => (
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
  