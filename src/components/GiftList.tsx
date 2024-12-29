'use client'

import React, { useState } from 'react';
import { GiftCard } from './GiftCard';
import { Gift, ReservationData } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIORITY_OPTIONS } from '@/lib/constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Filter, X } from 'lucide-react';
import { CategorySelect } from './CategorySelect';

const variants = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  }
};

export const GiftList = ({ selectedPriority, onPriorityChange }: {
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
}) => {
  const queryClient = useQueryClient();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    showAvailable: true,
  });

  const { data: gifts = [], isLoading } = useQuery({
    queryKey: ['gifts'],
    queryFn: async () => {
      const response = await fetch('/api/gifts');
      if (!response.ok) throw new Error('Failed to fetch gifts');
      return response.json();
    }
  });

  const reserveMutation = useMutation({
    mutationFn: async (data: ReservationData) => {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Échec de la réservation');
      return response.json();
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['gifts'] });
      }, 2000); 
    }
  });
  const sortedAndFilteredGifts = React.useMemo(() => {
    return gifts
      .filter((gift: Gift) => {
        const matchesCategory = !filters.category || gift.category === filters.category;
        const matchesPriority = !selectedPriority || gift.priority === selectedPriority;
        const matchesAvailability = !filters.showAvailable || !gift.reservation;
        return matchesCategory && matchesPriority && matchesAvailability;
      })
      .sort((a: Gift, b: Gift) => {
        if (a.reservation && !b.reservation) return 1;
        if (!a.reservation && b.reservation) return -1;

        const priorityOrder = {
          'MUST_HAVE': 0,
          'REALLY_WANT': 1,
          'NORMAL': 2,
          'NICE_TO_HAVE': 3
        };
        return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
      });
  }, [gifts, selectedPriority, filters]);

  const categories = React.useMemo(() => (
    [...new Set(gifts.map((gift: Gift) => gift.category))].sort()
  ), [gifts]);

  const filteredGifts = React.useMemo(() => {
    return gifts.filter((gift: Gift) => {
      const matchesCategory = !filters.category || gift.category === filters.category;
      const matchesPriority = !selectedPriority || gift.priority === selectedPriority;
      const matchesAvailability = !filters.showAvailable || !gift.reservation;
      return matchesCategory && matchesPriority && matchesAvailability;
    });
  }, [gifts, selectedPriority, filters]);

  const handleReserve = async (giftId: string, data: Omit<ReservationData, 'giftId'>) => {
    await reserveMutation.mutateAsync({ ...data, giftId });
  };

  const PriorityFilters = () => (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onPriorityChange('')}
        className={`px-4 py-2 rounded-full text-sm transition-all ${
          selectedPriority === '' 
            ? 'bg-amber-600 text-white' 
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        }`}
      >
        Tous
      </button>
      {PRIORITY_OPTIONS.map((priority) => (
        <button
          key={priority.id}
          onClick={() => onPriorityChange(priority.id)}
          className={`px-4 py-2 rounded-full text-sm transition-all whitespace-nowrap ${
            selectedPriority === priority.id 
              ? 'bg-amber-600 text-white' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          {priority.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="hidden md:block space-y-4 bg-white rounded-xl p-4 shadow-sm">
        <PriorityFilters />
        
        <div className="flex gap-6 items-center mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Catégorie :
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-100 focus:border-amber-300 bg-white text-sm"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Uniquement disponibles
            </label>
            <button
              onClick={() => setFilters(prev => ({ ...prev, showAvailable: !prev.showAvailable }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                filters.showAvailable ? 'bg-amber-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  filters.showAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="fixed bottom-6 right-6 bg-amber-600 text-white p-4 rounded-full shadow-lg hover:bg-amber-700 transition-colors z-50 md:hidden"
      >
        {showMobileFilters ? <X className="w-6 h-6" /> : <Filter className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-lg z-40 md:hidden"
            style={{ maxHeight: "85vh" }}
          >
            <div className="overflow-y-auto p-6 max-h-[85vh]">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Filtres</h2>
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6 pb-20">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Priorité
                    </label>
                    <PriorityFilters />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Catégorie
                    </label>
                    <CategorySelect
                      value={filters.category}
                      onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                      categories={categories}
                    />
                  </div>

                  <div className="flex items-center gap-3 justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Uniquement disponibles
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Masquer les cadeaux déjà réservés
                      </p>
                    </div>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, showAvailable: !prev.showAvailable }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        filters.showAvailable ? 'bg-amber-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          filters.showAvailable ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <motion.div
              key={index}
              variants={variants.item}
              className="h-[360px] bg-white rounded-xl animate-pulse"
            >
              <div className="w-full h-48 bg-gray-200 rounded-t-xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={variants.container}
          initial="hidden"
          animate="show"
        >
           {sortedAndFilteredGifts.map((gift: Gift) => (
            <motion.div 
              key={gift.id}
              variants={variants.item}
              layout
            >
              <GiftCard 
                gift={gift}
                onReserve={handleReserve}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};