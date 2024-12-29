import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export const MobileIndicator = () => (
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
  