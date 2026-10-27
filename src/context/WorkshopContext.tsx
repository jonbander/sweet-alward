import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Material, Recipe } from '../types';
import { DEFAULT_MATERIALS, DEFAULT_RECIPES } from '../data/defaultData';
import { computePricePerGram } from '../utils/formatters';

interface WorkshopContextType {
  materials: Material[];
  recipes: Recipe[];
  materialsMap: Map<string, Material>;
  activeTab: 'materials' | 'recipes' | 'orders' | 'dashboard';
  setActiveTab: (tab: 'materials' | 'recipes' | 'orders' | 'dashboard') => void;
  selectedRecipeIdForOrder: string | null;
  setSelectedRecipeIdForOrder: (id: string | null) => void;
  addMaterial: (material: Omit<Material, 'id' | 'pricePerGram' | 'totalGrams' | 'updatedAt'>) => Material;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Recipe;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  duplicateRecipe: (id: string) => void;
  resetToDefaults: () => void;
  exportBackupJson: () => void;
  importBackupJson: (jsonData: string) => boolean;
}

const WorkshopContext = createContext<WorkshopContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MATERIALS: 'sweets_workshop_materials_v1',
  RECIPES: 'sweets_workshop_recipes_v1',
};

export const WorkshopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'recipes' | 'orders' | 'dashboard'>('recipes');
  const [selectedRecipeIdForOrder, setSelectedRecipeIdForOrder] = useState<string | null>(null);

  // Load materials from localStorage or defaults
  const [materials, setMaterials] = useState<Material[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load materials from localStorage', e);
    }
    return DEFAULT_MATERIALS;
  });

  // Load recipes from localStorage or defaults
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECIPES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load recipes from localStorage', e);
    }
    return DEFAULT_RECIPES;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
    } catch (e) {
      console.error('Failed to save materials', e);
    }
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
    } catch (e) {
      console.error('Failed to save recipes', e);
    }
  }, [recipes]);

  // Fast materials lookup map
  const materialsMap = useMemo(() => {
    const map = new Map<string, Material>();
    materials.forEach((m) => map.set(m.id, m));
    return map;
  }, [materials]);

  // Material actions
  const addMaterial = (
    data: Omit<Material, 'id' | 'pricePerGram' | 'totalGrams' | 'updatedAt'>
  ): Material => {
    const { totalGrams, pricePerGram } = computePricePerGram(
      data.purchasePrice,
      data.purchaseQuantity,
      data.purchaseUnit
    );

    const newMaterial: Material = {
      ...data,
      id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      totalGrams,
      pricePerGram,
      updatedAt: new Date().toISOString(),
    };

    setMaterials((prev) => [newMaterial, ...prev]);
    return newMaterial;
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const purchasePrice = updates.purchasePrice !== undefined ? updates.purchasePrice : item.purchasePrice;
        const purchaseQuantity = updates.purchaseQuantity !== undefined ? updates.purchaseQuantity : item.purchaseQuantity;
        const purchaseUnit = updates.purchaseUnit !== undefined ? updates.purchaseUnit : item.purchaseUnit;

        const { totalGrams, pricePerGram } = computePricePerGram(
          purchasePrice,
          purchaseQuantity,
          purchaseUnit
        );

        return {
          ...item,
          ...updates,
          totalGrams,
          pricePerGram,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // Recipe actions
  const addRecipe = (
    data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>
  ): Recipe => {
    const newRecipe: Recipe = {
      ...data,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRecipes((prev) => [newRecipe, ...prev]);
    return newRecipe;
  };

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    setRecipes((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const duplicateRecipe = (id: string) => {
    const original = recipes.find((r) => r.id === id);
    if (!original) return;

    const copy: Recipe = {
      ...original,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: `${original.name} (نسخة جديدة)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRecipes((prev) => [copy, ...prev]);
  };

  const resetToDefaults = () => {
    setMaterials(DEFAULT_MATERIALS);
    setRecipes(DEFAULT_RECIPES);
  };

  const exportBackupJson = () => {
    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      materials,
      recipes,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sweets-workshop-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJson = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data.materials) && Array.isArray(data.recipes)) {
        setMaterials(data.materials);
        setRecipes(data.recipes);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  return (
    <WorkshopContext.Provider
      value={{
        materials,
        recipes,
        materialsMap,
        activeTab,
        setActiveTab,
        selectedRecipeIdForOrder,
        setSelectedRecipeIdForOrder,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        duplicateRecipe,
        resetToDefaults,
        exportBackupJson,
        importBackupJson,
      }}
    >
      {children}
    </WorkshopContext.Provider>
  );
};

export const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  if (!context) {
    throw new Error('useWorkshop must be used within a WorkshopProvider');
  }
  return context;
};
