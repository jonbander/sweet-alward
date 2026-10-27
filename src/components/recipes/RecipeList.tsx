import React, { useState, useMemo } from 'react';
import { Recipe, RecipeCategory } from '../../types';
import { useWorkshop } from '../../context/WorkshopContext';
import { 
  formatCurrency, formatWeight, calculateRecipeCost 
} from '../../utils/formatters';
import { 
  Search, Plus, BookOpen, Clock, ArrowUpDown, 
  ChevronLeft, Copy, Edit3, Calculator, Heart 
} from 'lucide-react';
import { RecipeModal } from './RecipeModal';
import { RecipeDetailModal } from './RecipeDetailModal';
import { motion, AnimatePresence } from 'motion/react';

const RECIPE_CATEGORIES: ('الكل' | RecipeCategory)[] = [
  'الكل',
  'معمول وبرازق',
  'حلويات شرقية وقشطة',
  'بقلاوة ونواشف',
  'كيك وكاتو',
  'غربية وبيتي فور',
  'أخرى',
];

export const RecipeList: React.FC = () => {
  const { 
    recipes, 
    materialsMap, 
    duplicateRecipe, 
    setSelectedRecipeIdForOrder, 
    setActiveTab 
  } = useWorkshop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'الكل' | RecipeCategory>('الكل');
  const [sortBy, setSortBy] = useState<'date' | 'costDesc' | 'costAsc' | 'profitDesc' | 'name'>('date');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeForDetails, setSelectedRecipeForDetails] = useState<Recipe | null>(null);

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    return recipes
      .filter((rec) => {
        const matchesCategory = selectedCategory === 'الكل' || rec.category === selectedCategory;
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery = !query || 
          rec.name.toLowerCase().includes(query) ||
          rec.ingredients.some((i) => i.materialName.toLowerCase().includes(query));
        return matchesCategory && matchesQuery;
      })
      .map((rec) => {
        const cost = calculateRecipeCost(rec, materialsMap);
        return { recipe: rec, cost };
      })
      .sort((a, b) => {
        if (sortBy === 'costDesc') return b.cost.totalRecipeCost - a.cost.totalRecipeCost;
        if (sortBy === 'costAsc') return a.cost.totalRecipeCost - b.cost.totalRecipeCost;
        if (sortBy === 'profitDesc') return b.cost.profitBatch - a.cost.profitBatch;
        if (sortBy === 'name') return a.recipe.name.localeCompare(b.recipe.name, 'ar');
        return new Date(b.recipe.updatedAt).getTime() - new Date(a.recipe.updatedAt).getTime();
      });
  }, [recipes, selectedCategory, searchQuery, sortBy, materialsMap]);

  return (
    <div className="space-y-4">
      {/* Search and Categories Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-4 shadow-2xs border border-[#ebdcdc] space-y-3"
      >
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute right-4 top-3.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحثي عن وصفة حلويات (معمول، برازق، حلاوة الجبن، كاتو، بيتي فور...)"
            className="w-full pr-11 pl-4 py-3 bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40 font-medium placeholder:text-stone-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-3 text-xs text-stone-400 hover:text-stone-600 bg-stone-200/60 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          {RECIPE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = cat === 'الكل'
              ? recipes.length
              : recipes.filter((r) => r.category === cat).length;

            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#6b3547] text-white shadow-2xs'
                    : 'bg-[#f7f0f2] text-stone-700 hover:bg-[#ede1e4] border border-[#ebdcdc]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-[#6b3547]'
                  }`}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Sort and Count */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
          <div className="flex items-center gap-1 font-extrabold text-[#6b3547]">
            <span>{filteredRecipes.length}</span>
            <span>وصفة محسوبة التكلفة</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-[#6b3547] focus:outline-none cursor-pointer"
            >
              <option value="date">تاريخ آخر تعديل</option>
              <option value="costDesc">تكلفة الوجبة: الأعلى أولاً</option>
              <option value="costAsc">تكلفة الوجبة: الأقل أولاً</option>
              <option value="profitDesc">صافي الربح: الأعلى أولاً</option>
              <option value="name">الاسم أبجدياً</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Recipes Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 text-center border border-dashed border-[#ebdcdc] space-y-3"
        >
          <div className="w-14 h-14 bg-[#f8f0f2] text-[#6b3547] rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-800">لا توجد وصفات</h3>
            <p className="text-xs text-stone-500 mt-1">
              {searchQuery ? 'لم نعثر على وصفة مطابقة للبحث' : 'ابدئي بتركيب وتكلفة وصفات حلوياتك الرائعة الآن'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#6b3547] hover:bg-[#5a2a3b] text-white rounded-2xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء أول وصفة</span>
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <AnimatePresence>
            {filteredRecipes.map(({ recipe, cost }, idx) => {
              return (
                <motion.div
                  layout
                  key={recipe.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="bg-white rounded-3xl p-4 border border-[#ebdcdc] shadow-2xs hover:shadow-md hover:border-[#dabec5] transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Bar */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#6b3547] bg-[#f8f0f2] px-2.5 py-0.5 rounded-full border border-[#eddfe2] inline-block mb-1">
                          {recipe.category}
                        </span>
                        <h3
                          onClick={() => setSelectedRecipeForDetails(recipe)}
                          className="text-base font-black text-stone-900 group-hover:text-[#6b3547] transition cursor-pointer leading-snug flex items-center gap-1.5"
                        >
                          <span>{recipe.name}</span>
                          <Heart className="w-3.5 h-3.5 text-[#e698ae] opacity-0 group-hover:opacity-100 transition" />
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 font-medium">
                          <span>الناتج: <strong>{recipe.yieldCount} {recipe.yieldUnit}</strong></span>
                          <span>•</span>
                          <span>{recipe.ingredients.length} مكونات</span>
                          {recipe.preparationTimeMinutes && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3 text-stone-400" />
                                {recipe.preparationTimeMinutes} د
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quick icons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => duplicateRecipe(recipe.id)}
                          className="p-2 text-stone-400 hover:text-[#6b3547] hover:bg-[#f8f0f2] rounded-xl transition cursor-pointer"
                          title="تكرار وإنشاء نسخة"
                        >
                          <Copy className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingRecipe(recipe)}
                          className="p-2 text-stone-400 hover:text-[#6b3547] hover:bg-[#f8f0f2] rounded-xl transition cursor-pointer"
                          title="تعديل المكونات والأسعار"
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Pricing Matrix Highlight */}
                    <div className="mt-3.5 grid grid-cols-2 gap-2 p-3 bg-[#faf5f6] rounded-2xl border border-[#eedfe2]">
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 block">
                          تكلفة القطعة الواحدة:
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-black text-[#5c2b3b] font-mono">
                            {formatCurrency(cost.costPerUnit)}
                          </span>
                        </div>
                      </div>

                      <div className="text-left border-r border-[#ebdcdc] pr-2.5">
                        <span className="text-[10px] font-bold text-[#2c6e49] block">
                          سعر البيع المقترح:
                        </span>
                        <span className="text-base font-black text-[#2c6e49] font-mono mt-0.5 block">
                          {formatCurrency(cost.suggestedSalePricePerUnit)}
                        </span>
                        <span className="text-[9px] text-[#2c6e49] font-bold block">
                          ربح: +{formatCurrency(cost.profitPerUnit)}
                        </span>
                      </div>
                    </div>

                    {/* Batch Cost & Yield Summary */}
                    <div className="mt-2.5 flex items-center justify-between text-xs text-stone-600 px-1">
                      <span>
                        تكلفة الوجبة الكلية:{' '}
                        <strong className="text-stone-900 font-mono font-bold">
                          {formatCurrency(cost.totalRecipeCost)}
                        </strong>
                      </span>
                      <span className="text-[11px] text-[#6b3547] font-bold bg-[#f8f0f2] px-2.5 py-0.5 rounded-full border border-[#eddfe2]">
                        هامش {recipe.targetMarginPercentage}%
                      </span>
                    </div>

                    {/* Ingredients Preview Tags */}
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {recipe.ingredients.slice(0, 4).map((ing, ingIdx) => (
                        <span
                          key={ingIdx}
                          className="text-[10px] bg-[#faf7f5] text-stone-700 px-2 py-0.5 rounded-lg border border-[#ebdcdc]"
                        >
                          {ing.materialName} ({formatWeight(ing.quantityGrams)})
                        </span>
                      ))}
                      {recipe.ingredients.length > 4 && (
                        <span className="text-[10px] bg-[#f8f0f2] text-[#6b3547] px-1.5 py-0.5 rounded-lg font-bold">
                          +{recipe.ingredients.length - 4} أخرى
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedRecipeIdForOrder(recipe.id);
                        setActiveTab('orders');
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#6b3547] hover:bg-[#f8f0f2] px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>حاسبة طلبية إنتاج</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedRecipeForDetails(recipe)}
                      className="flex items-center gap-1 text-xs font-bold bg-[#6b3547] hover:bg-[#5a2a3b] text-white px-3.5 py-1.5 rounded-2xl transition shadow-xs cursor-pointer"
                    >
                      <span>كارت التكلفة</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Floating Add Recipe Button on Mobile */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-20 left-4 z-40 flex items-center gap-2 bg-[#6b3547] hover:bg-[#5a2a3b] text-white font-bold px-4 py-3 rounded-full shadow-lg border border-white/30 transition sm:hidden cursor-pointer"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span className="text-xs">وصفة جديدة</span>
      </motion.button>

      {/* Add / Edit Recipe Modal */}
      <AnimatePresence>
        {(isAddModalOpen || editingRecipe) && (
          <RecipeModal
            recipeToEdit={editingRecipe}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingRecipe(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {selectedRecipeForDetails && (
          <RecipeDetailModal
            recipe={selectedRecipeForDetails}
            onClose={() => setSelectedRecipeForDetails(null)}
            onEdit={() => {
              setEditingRecipe(selectedRecipeForDetails);
              setSelectedRecipeForDetails(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
