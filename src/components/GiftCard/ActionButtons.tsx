// ActionButtons.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Heart } from 'lucide-react';

interface ActionButtonsProps {
  isLiked: boolean;
  onShare: (e: React.MouseEvent) => Promise<void>;
  onToggleLike: (e: React.MouseEvent) => void;
}

export const ActionButtons = ({ isLiked, onShare, onToggleLike }: ActionButtonsProps) => (
  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
    <div className="relative group/tooltip">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm flex items-center justify-center transition-colors ${
          isLiked ? 'text-rose-500' : 'text-gray-600 hover:text-gray-900'
        }`}
        onClick={onToggleLike}
      >
        <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
      </motion.button>
    </div>
    <div className="relative group/tooltip">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
        onClick={onShare}
      >
        <Share2 className="w-4 h-4" />
      </motion.button>
      <span className="invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap transition-all">
        Partager
      </span>
    </div>
  </div>
);