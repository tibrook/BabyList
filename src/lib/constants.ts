// src/lib/constants.ts
export const DEFAULT_CATEGORIES = [
    'Vêtements',
    'Puériculture',
    'Jeux & Éveil',
    'Chambre',
    'Repas',
    'Hygiène & Soins',
    'Sorties',
    'Transport',
    'Sécurité'
  ];
  
  export const PRIORITY_OPTIONS = [
    { 
      id: 'MUST_HAVE', 
      label: 'Indispensable', 
      color: 'bg-rose-600 text-white ring-1 ring-rose-500 shadow-md' 
    },
    { 
      id: 'REALLY_WANT', 
      label: 'Vraiment souhaité', 
      color: 'bg-violet-600 text-white ring-1 ring-violet-500 shadow-md'
    },
    { 
      id: 'NORMAL', 
      label: 'Normal', 
      color: 'bg-blue-600 text-white ring-1 ring-blue-500 shadow-md' 
    },
    { 
      id: 'NICE_TO_HAVE', 
      label: 'Ce serait sympa', 
      color: 'bg-blue-600 text-white ring-1 ring-blue-500 shadow-md' 
    }
  ];