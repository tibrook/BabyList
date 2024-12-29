import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
}

export const CategorySelect = ({ value, onChange, categories }: CategorySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedCategory = value || "Toutes les catégories";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-100 focus:border-amber-300 bg-white text-left flex items-center justify-between"
      >
        <span className="truncate">{selectedCategory}</span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <button 
              className="fixed inset-0 z-30 w-full h-full bg-transparent cursor-default" 
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le menu"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-40"
            >
              <div className="p-1">
                <button
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left rounded-lg text-sm hover:bg-amber-50 transition-colors ${
                    value === '' ? 'bg-amber-100 text-amber-900' : 'text-gray-700'
                  }`}
                >
                  Toutes les catégories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      onChange(category);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left rounded-lg text-sm hover:bg-amber-50 transition-colors ${
                      value === category ? 'bg-amber-100 text-amber-900' : 'text-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};