'use client'

import React, { useState, useEffect } from 'react';
import { GiftCard } from './GiftCard';
import { Gift, ReservationData } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIORITY_OPTIONS } from '@/lib/constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface GiftListProps {
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
}

interface Filters {
  search: string;
  category: string;
  sort: string;
  showAvailable: boolean;
}

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
  },
  
  filter: {
    hidden: { height: 0, opacity: 0 },
    show: { 
      height: "auto", 
      opacity: 1,
      transition: {
        height: {
          type: "spring",
          stiffness: 400,
          damping: 30
        },
        opacity: {
          duration: 0.2
        }
      }
    }
  }
};

const SearchBar = ({ value, onChange }: { 
  value: string; 
  onChange: (value: string) => void;
}) => (
  <div className="relative flex-1">
    <input
      type="text"
      placeholder="Rechercher un cadeau..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
    />
    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  </div>
);

const FilterToggle = ({ showFilters, onToggle }: {
  showFilters: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all font-medium"
  >
    <span>Filtres</span>
    <motion.span 
      animate={{ rotate: showFilters ? 180 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="text-xs"
    >
      ↓
    </motion.span>
  </button>
);

export const GiftList = ({ selectedPriority, onPriorityChange }: GiftListProps) => {
  const queryClient = useQueryClient();
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    sort: '',
    showAvailable: false,
  });
  const [mounted, setMounted] = useState(false);

  const { data: gifts = [], isLoading, error: fetchError } = useQuery({
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
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reserve gift');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
    }
  });
  const categories = React.useMemo(() => (
    [...new Set(gifts.map((gift: Gift) => gift.category))].sort() as string[]
  ), [gifts]);

  const filteredGifts = React.useMemo(() => {
    let filtered = gifts.filter((gift: Gift) => {
      const matchesSearch = !filters.search || 
        gift.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        gift.description?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = !filters.category || gift.category === filters.category;
      const matchesPriority = !selectedPriority || gift.priority === selectedPriority;
      const matchesAvailability = !filters.showAvailable || !gift.reservation;
      return matchesSearch && matchesCategory && matchesPriority && matchesAvailability;
    });

    if (filters.sort) {
      filtered = [...filtered].sort((a: Gift, b: Gift) => {
        if (!a.price || !b.price) return 0;
        return filters.sort === 'price-asc' ? a.price - b.price : b.price - a.price;
      });
    }

    return filtered;
  }, [gifts, filters, selectedPriority]);

  // Effects
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handlers
  const handleReserve = async (giftId: string, data: Omit<ReservationData, 'giftId'>) => {
    try {
      await reserveMutation.mutateAsync({ ...data, giftId });
      return;
    } catch (error) {
      throw error;
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (!mounted) return null;

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={variants.container}
    >
      {/* Search and Filters */}
      <motion.div variants={variants.item} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
          <SearchBar 
            value={filters.search}
            onChange={(value) => handleFilterChange('search', value)}
          />
          <FilterToggle 
            showFilters={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        </div>

        {/* Priority Filter */}
        <motion.div 
          variants={variants.item} 
          className="flex flex-wrap gap-2 justify-start bg-white rounded-xl p-4 shadow-sm overflow-x-auto scrollbar-hide"
        >
          <button
            onClick={() => onPriorityChange('')}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              selectedPriority === '' 
                ? 'bg-blue-600 text-white' 
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
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {priority.label}
            </button>
          ))}
        </motion.div>

        {/* Additional Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              variants={variants.filter}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="bg-white rounded-xl p-4 shadow-sm overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <div className="relative">
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-gray-50 appearance-none pr-10"
                    >
                      <option value="">Toutes les catégories</option>
                      {categories.map((category: string) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Trier par
                  </label>
                  <div className="relative">
                    <select
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-gray-50 appearance-none pr-10"
                    >
                      <option value="">Aucun tri</option>
                      <option value="price-asc">Prix croissant</option>
                      <option value="price-desc">Prix décroissant</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="flex items-center p-3 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">
                      Uniquement disponibles
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Masquer les cadeaux déjà réservés
                    </p>
                  </div>
                  <button
                    onClick={() => handleFilterChange('showAvailable', !filters.showAvailable)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      filters.showAvailable ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className="sr-only">
                      {filters.showAvailable ? 'Désactiver' : 'Activer'} le filtre de disponibilité
                    </span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        filters.showAvailable ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
      ) : fetchError ? (
        <motion.div 
          variants={variants.item}
          className="text-center py-12"
        >
          <div className="inline-block p-4 rounded-full bg-red-100 mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600">
            Une erreur est survenue lors du chargement des cadeaux
          </p>
        </motion.div>
      ) : filteredGifts.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          variants={variants.container}
        >
          {filteredGifts.map((gift: Gift) => (
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
      ) : (
        <motion.div 
          variants={variants.item}
          className="text-center py-12"
        >
          <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-gray-500">
            Aucun cadeau ne correspond à vos critères.
          </p>
          <button
            onClick={() => {
              setFilters({
                search: '',
                category: '',
                sort: '',
                showAvailable: false,
              });
              onPriorityChange('');
            }}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Réinitialiser les filtres
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};