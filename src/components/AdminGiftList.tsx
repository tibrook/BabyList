import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Edit2, Trash2, Tag, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Gift } from '@/lib/types';
import { PRIORITY_OPTIONS } from '@/lib/constants';

interface AdminGiftListProps {
  onEdit: (gift: Gift) => void;
  onDelete: (giftId: string) => void;
}


export const AdminGiftList =  ({ onEdit, onDelete }: AdminGiftListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: gifts = [], isLoading } = useQuery({
    queryKey: ['admin-gifts'],
    queryFn: async () => {
      const response = await fetch('/api/gifts');
      if (!response.ok) throw new Error('Failed to fetch gifts');
      return response.json();
    }
  });

  const categories = [...new Set(gifts.map(gift => gift.category))].sort();

  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = gift.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gift.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || gift.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter Section */}
      <div className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher un cadeau..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Gift Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {isLoading ? (
          Array(6).fill(null).map((_, index) => (
            <div key={index} className="animate-pulse bg-white rounded-lg p-4 shadow-sm border">
              <div className="h-40 bg-gray-200 rounded-lg mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : (
          filteredGifts.map(gift => (
            <motion.div
              key={gift.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              <div className="aspect-square relative">
                {gift.imageUrl ? (
                  <img
                    src={gift.imageUrl}
                    alt={gift.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {gift.priority && (
                  <div className="absolute top-2 left-2">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${PRIORITY_OPTIONS.find(p => p.id === gift.priority)?.color}
                    `}>
                      {PRIORITY_OPTIONS.find(p => p.id === gift.priority)?.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 line-clamp-1">{gift.title}</h3>
                  {gift.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{gift.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{gift.category}</span>
                </div>

                {gift.price && (
                  <div className="text-sm font-medium text-gray-900">
                    {gift.price.toLocaleString('fr-FR')} €
                  </div>
                )}

                {gift.reservation && (
                  <div className="text-sm text-green-600 font-medium">
                    {gift.reservation.isAnonymous 
                      ? "Réservé anonymement"
                      : `Réservé par ${gift.reservation.firstName}`}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onEdit(gift)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => onDelete(gift.id)}
                    className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
