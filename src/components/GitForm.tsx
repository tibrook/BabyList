// components/GiftForm.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Gift } from '@/lib/types';
import { DEFAULT_CATEGORIES, PRIORITY_OPTIONS } from '@/lib/constants';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface GiftFormProps {
  onSubmit: (giftData: Partial<Gift>) => Promise<void>;
  initialData?: Gift;
}

interface UploadResponse {
  secure_url: string;
  imageType: string;
  imageData: string;
}

export const GiftForm = ({ onSubmit, initialData }: GiftFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Gift>>({
    title: '',
    description: '',
    price: undefined,
    category: '',
    productUrl: '',
    imageUrl: '',
    priority: 'NORMAL'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        price: initialData.price,
        category: initialData.category,
        productUrl: initialData.productUrl,
        imageUrl: initialData.imageUrl,
        priority: initialData.priority
      });
      setImagePreview(initialData.imageUrl || null);
    }
  }, [initialData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(progress));
        }
      };

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch  {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
      });

      xhr.open('POST', '/api/upload', true);
      xhr.send(formData);

      const response = await uploadPromise as UploadResponse;

      setFormData(prev => ({
        ...prev,
        imageUrl: response.secure_url,
        imageType: response.imageType,
        imageData: response.imageData
      }));

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Erreur lors du téléchargement de l\'image');
      setImagePreview(formData.imageUrl || null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '', imageData: '', imageType: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      setNewCategory('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submit error:', error);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Zone de drop d'image */}
      <button 
        type="button"
        onClick={() => !loading && fileInputRef.current?.click()}
        className="group relative h-64 w-full bg-white rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-rose-300 transition-all cursor-pointer"
      >
        {imagePreview ? (
          <div className="absolute inset-0">
            <Image
              src={imagePreview}
              alt="Aperçu"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
              <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-medium text-gray-700">
                Modifier l&apos;image
              </span>
            </div>
            {/* Bouton de suppression */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-rose-500 transition-colors duration-200">
            <Upload className="w-12 h-12 mb-4" />
            <span className="text-sm font-medium">Ajouter une photo</span>
            <span className="text-xs text-gray-400 mt-2">JPG ou PNG jusqu&apos;à 5 MB</span>
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-2">Upload en cours...</div>
              <div className="w-48 h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </button>

      {/* Informations générales */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Informations générales</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre du produit<span className="text-rose-500 ml-1">*</span>
            </label>
            <input
              required
              type="text"
              value={formData.title || ''}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-100 focus:border-rose-300 placeholder-gray-400"
              placeholder="Ex: Poussette Yoyo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-100 focus:border-rose-300 placeholder-gray-400"
              placeholder="Décrivez le produit en quelques mots..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lien vers le produit
              <span className="text-gray-400 text-xs ml-2">(optionnel)</span>
            </label>
            <input
              type="url"
              value={formData.productUrl || ''}
              onChange={e => setFormData(prev => ({ ...prev, productUrl: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-100 focus:border-rose-300 placeholder-gray-400"
              placeholder="https://www.exemple.com/produit"
            />
          </div>
        </div>
      </div>

      {/* Prix */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Prix</h3>
        </div>
        
        <div className="p-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix du produit
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || undefined }))}
                className="w-full pl-4 pr-12 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-100 focus:border-rose-300 placeholder-gray-400"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-gray-500">EUR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priorité */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Priorité</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {PRIORITY_OPTIONS.map(option => (
              <label
                key={option.id}
                className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
                  formData.priority === option.id 
                    ? 'border-gray-900 bg-gray-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  value={option.id}
                  checked={formData.priority === option.id}
                  onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as Gift['priority'] }))}
                  className="sr-only"
                />
                <div className="flex flex-col">
                  <span className={`inline-flex px-2 py-1 rounded-full text-sm ${option.color}`}>
                    {option.label}
                  </span>
                </div>
                <div className={`absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full border ${
                  formData.priority === option.id 
                    ? 'border-gray-900 bg-gray-900' 
                    : 'border-gray-300'
                }`}>
                  <div className={`h-2.5 w-2.5 rounded-full bg-white ${
                    formData.priority === option.id ? 'opacity-100' : 'opacity-0'
                  }`} />
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Catégorie */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Catégorie</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner une catégorie<span className="text-rose-500 ml-1">*</span>
            </label>
            <select
              required
              value={formData.category || ''}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-100 focus:border-rose-300 appearance-none"
            >
              <option value="">Choisir une catégorie</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="text-gray-900">{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ou créer une nouvelle catégorie
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                className="flex-1 px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-100 focus:border-rose-300 placeholder-gray-400"
                placeholder="Nom de la catégorie"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'actions fixe */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {error && (
            <div className="text-rose-500 bg-rose-50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium transition-colors flex items-center gap-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};