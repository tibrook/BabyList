'use client'

import React, { useState, useEffect } from 'react';
import { Gift } from '@/lib/types';
import { PRIORITY_OPTIONS } from '@/lib/constants';

interface AdminGiftListProps {
  onEdit: (gift: Gift) => void;
}

export const AdminGiftList = ({ onEdit }: AdminGiftListProps) => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      const response = await fetch('/api/gifts');
      if (!response.ok) throw new Error('Failed to fetch gifts');
      const data = await response.json();
      setGifts(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des cadeaux');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (giftId: string) => {
    try {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce cadeau ?')) return;

      const response = await fetch(`/api/gifts/${giftId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete gift');
      }

      await fetchGifts();
      setError(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Erreur lors de la suppression du cadeau');
    }
  };

  const filteredGifts = gifts.filter(gift =>
    gift.title.toLowerCase().includes(search.toLowerCase()) ||
    gift.description?.toLowerCase().includes(search.toLowerCase()) ||
    gift.category.toLowerCase().includes(search.toLowerCase())
  );

  const getPriorityLabel = (priorityId: string) => {
    return PRIORITY_OPTIONS.find(option => option.id === priorityId) || 
           PRIORITY_OPTIONS.find(option => option.id === 'NORMAL');
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="px-6 py-4 text-rose-600 bg-rose-50 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="px-6 py-4 border-b bg-gray-50/50">
        <input
          type="text"
          placeholder="Rechercher un cadeau..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-rose-100 focus:border-rose-300 transition-colors"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider text-sm">Image</th>
              <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider text-sm">Informations</th>
              <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider text-sm">Catégorie</th>
              <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider text-sm">Prix</th>
              <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider text-sm">Priorité</th>
              <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider text-sm">Statut</th>
              <th className="py-4 px-6 text-right font-medium text-gray-500 uppercase tracking-wider text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredGifts.map(gift => (
              <tr key={gift.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6">
                  {gift.imageUrl ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={gift.imageUrl}
                        alt={gift.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-2xl">🎁</span>
                    </div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="font-medium text-gray-900">{gift.title}</div>
                  {gift.description && (
                    <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {gift.description}
                    </div>
                  )}
                  {gift.productUrl && (
                    <a
                      href={gift.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block"
                    >
                      Voir le produit ↗
                    </a>
                  )}
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {gift.category}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-900">
                  {gift.price ? `${gift.price.toLocaleString('fr-FR')}€` : '-'}
                </td>
                <td className="py-4 px-6">
                  {gift.priority && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityLabel(gift.priority)?.color}`}>
                      {getPriorityLabel(gift.priority)?.label}
                    </span>
                  )}
                </td>
                <td className="py-4 px-6">
                  {gift.reservation ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Réservé
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Disponible
                    </span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => onEdit(gift)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(gift.id)}
                      className="text-sm text-rose-600 hover:text-rose-800 font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredGifts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun cadeau ne correspond à votre recherche
          </div>
        )}
      </div>
    </div>
  );
};