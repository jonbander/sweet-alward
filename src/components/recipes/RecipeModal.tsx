import React, { useState, useMemo } from 'react';
import { Recipe, RecipeCategory, RecipeIngredient } from '../../types';
import { useWorkshop } from '../../context/WorkshopContext';
import { formatCurrency, formatWeight, calculateRecipeCost } from '../../utils/formatters';
import { 
  X, Check, Plus, Trash2, BookOpen, AlertCircle, 
  Sparkles, Scale, DollarSign, Heart 
} from 'lucide-react';
import { motion } from 'motion/react';

interface RecipeModalProps {
  recipeToEdit?: Recipe | null;
  onClose: () => void;
}

const RECIPE_CATEGORIES: RecipeCategory[] = [
  'معمول وبرازق',
  'حلويات شرقية وقشطة',
  'بقلاوة ونواشف',
  'كيك وكاتو',
  'غربية وبيتي فور',
  'أخرى',
];

export const RecipeModal: React.FC<RecipeModalProps> = ({ recipeToEdit, onClose }) => {
  const { materials, materialsMap, addRecipe, updateRecipe } = useWorkshop();

  // Basic Info
  const [name, setName] = useState(recipeToEdit?.name || '');
  const [category, setCategory] = useState<RecipeCategory>(recipeToEdit?.category || 'معمول وبرازق');
  const [yieldCount, setYieldCount] = useState<number | ''>(recipeToEdit?.yieldCount || 30);
  const [yieldUnit, setYieldUnit] = useState(recipeToEdit?.yieldUnit || 'قطعة');
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState<number | ''>(
    recipeToEdit?.preparationTimeMinutes || 60
  );
  const [instructions, setInstructions] = useState(recipeToEdit?.instructions || '');

  // Overheads and Margins
  const [overheadPercentage, setOverheadPercentage] = useState<number>(
    recipeToEdit ? recipeToEdit.overheadPercentage : 10
  );
  const [fixedOverhead, setFixedOverhead] = useState<number | ''>(
    recipeToEdit ? recipeToEdit.fixedOverhead : 0
  );
  const [targetMarginPercentage, setTargetMarginPercentage] = useState<number>(
    recipeToEdit ? recipeToEdit.targetMarginPercentage : 40
  );

  // Ingredients in recipe
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(() => {
    if (recipeToEdit && recipeToEdit.ingredients.length > 0) {
      return recipeToEdit.ingredients.map((ing) => {
        const currentMat = materialsMap.get(ing.materialId);
        const costPerGram = currentMat ? currentMat.pricePerGram : ing.costPerGram;
        return {
          ...ing,
          materialName: currentMat ? currentMat.name : ing.materialName,
          costPerGram,
          totalCost: ing.quantityGrams * costPerGram,
        };
      });
    }
    return [];
  });

  // State for adding a new ingredient row
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [newIngredientGrams, setNewIngredientGrams] = useState<number | ''>('');
  const [ingredientError, setIngredientError] = useState('');
  const [formError, setFormError] = useState('');

  const activeMaterial = useMemo(() => {
    return materialsMap.get(selectedMaterialId) || null;
  }, [selectedMaterialId, materialsMap]);

  const previewRecipe: Recipe = useMemo(() => {
    return {
      id: recipeToEdit?.id || 'temp',
      name: name || 'وصفة تجريبية',
      category,
      yieldCount: typeof yieldCount === 'number' && yieldCount > 0 ? yieldCount : 1,
      yieldUnit,
      overheadPercentage: overheadPercentage || 0,
      fixedOverhead: typeof fixedOverhead === 'number' ? fixedOverhead : 0,
      targetMarginPercentage: targetMarginPercentage || 0,
      preparationTimeMinutes: typeof preparationTimeMinutes === 'number' ? preparationTimeMinutes : undefined,
      instructions,
      ingredients,
      createdAt: '',
      updatedAt: '',
    };
  }, [name, category, yieldCount, yieldUnit, overheadPercentage, fixedOverhead, targetMarginPercentage, preparationTimeMinutes, instructions, ingredients]);

  const costBreakdown = useMemo(() => {
    return calculateRecipeCost(previewRecipe, materialsMap);
  }, [previewRecipe, materialsMap]);

  const handleAddIngredient = () => {
    if (!selectedMaterialId) {
      setIngredientError('يرجى اختيار المادة من قائمة المواد المخزنة');
      return;
    }
    if (!newIngredientGrams || newIngredientGrams <= 0) {
      setIngredientError('يرجى إدخال الكمية بالغرام');
      return;
    }

    const material = materialsMap.get(selectedMaterialId);
    if (!material) {
      setIngredientError('المادة المختارة غير موجودة');
      return;
    }

    const existingIndex = ingredients.findIndex((i) => i.materialId === selectedMaterialId);
    if (existingIndex >= 0) {
      const updated = [...ingredients];
      const newQty = updated[existingIndex].quantityGrams + Number(newIngredientGrams);
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantityGrams: newQty,
        costPerGram: material.pricePerGram,
        totalCost: newQty * material.pricePerGram,
      };
      setIngredients(updated);
    } else {
      const newIng: RecipeIngredient = {
        materialId: material.id,
        materialName: material.name,
        quantityGrams: Number(newIngredientGrams),
        costPerGram: material.pricePerGram,
        totalCost: Number(newIngredientGrams) * material.pricePerGram,
      };
      setIngredients([...ingredients, newIng]);
    }

    setSelectedMaterialId('');
    setNewIngredientGrams('');
    setIngredientError('');
  };

  const handleUpdateIngredientQty = (index: number, grams: number) => {
    const updated = [...ingredients];
    const ing = updated[index];
    const material = materialsMap.get(ing.materialId);
    const rate = material ? material.pricePerGram : ing.costPerGram;

    updated[index] = {
      ...ing,
      quantityGrams: grams,
      costPerGram: rate,
      totalCost: grams * rate,
    };
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('يرجى إدخال اسم الوصفة');
      return;
    }
    if (ingredients.length === 0) {
      setFormError('يرجى إضافة مكون واحد على الأقل للوصفة من قائمة الأسعار');
      return;
    }
    if (!yieldCount || yieldCount <= 0) {
      setFormError('يرجى إدخال عدد القطع الناتجة');
      return;
    }

    const recipeData = {
      name: name.trim(),
      category,
      yieldCount: Number(yieldCount),
      yieldUnit: yieldUnit.trim() || 'قطعة',
      ingredients,
      overheadPercentage: Number(overheadPercentage) || 0,
      fixedOverhead: Number(fixedOverhead) || 0,
      targetMarginPercentage: Number(targetMarginPercentage) || 0,
      preparationTimeMinutes: typeof preparationTimeMinutes === 'number' ? preparationTimeMinutes : undefined,
      instructions: instructions.trim(),
    };

    if (recipeToEdit) {
      updateRecipe(recipeToEdit.id, recipeData);
    } else {
      addRecipe(recipeData);
    }

    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-stone-900/50 backdrop-blur-xs overscroll-contain overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#ebdcdc] overflow-hidden max-h-[88vh] flex flex-col my-auto"
      >
        {/* Header - Fixed at Top */}
        <div className="shrink-0 bg-[#6b3547] px-5 py-3.5 text-white flex items-center justify-between border-b border-[#5a2a3b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#844458] rounded-2xl">
              <BookOpen className="w-5 h-5 text-[#fcedf1]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>{recipeToEdit ? 'تعديل الوصفة والتكلفة' : 'ابتكار وصفة جديدة وحساب التكلفة'}</span>
                <Heart className="w-3.5 h-3.5 fill-[#e698ae] text-[#e698ae]" />
              </h2>
              <p className="text-xs text-[#fae4eb]">
                اختيار المواد وحساب التكلفة تلقائياً بالغرام والليرة السورية
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#fae4eb] hover:text-white hover:bg-[#844458] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Scrollable Form Body - Smooth scrolling for all elements */}
        <form
          id="recipe-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 touch-pan-y"
        >
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </motion.div>
          )}

          {/* Section 1: Basic Recipe Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  اسم الوصفة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFormError('');
                  }}
                  placeholder="مثال: معمول بالفستق الحلبي، برازق شامية، كاتو شوكولا..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40 font-medium transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  التصنيف
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RecipeCategory)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40 font-medium cursor-pointer"
                >
                  {RECIPE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Yield & Time */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  العدد الناتج (الحصص) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={yieldCount}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseInt(e.target.value);
                    setYieldCount(val);
                    setFormError('');
                  }}
                  placeholder="30"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  نوع الوحدة
                </label>
                <input
                  type="text"
                  value={yieldUnit}
                  onChange={(e) => setYieldUnit(e.target.value)}
                  placeholder="قطعة، حبة، قالب"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  وقت التحضير (دقيقة)
                </label>
                <input
                  type="number"
                  min="0"
                  value={preparationTimeMinutes}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseInt(e.target.value);
                    setPreparationTimeMinutes(val);
                  }}
                  placeholder="60"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Recipe Ingredients (From Prices Page) */}
          <div className="border-t border-[#ebdcdc] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#6b3547]" />
                  <span>المكونات الأولية (بالغرام)</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  تظهر المواد المخزنة في صفحة الأسعار ويتم حساب التكلفة تلقائياً
                </p>
              </div>

              <span className="text-xs font-bold text-[#6b3547] bg-[#f8f0f2] px-2.5 py-1 rounded-full border border-[#eddfe2]">
                {ingredients.length} مكونات مضافة
              </span>
            </div>

            {/* Ingot Selector Box */}
            <div className="p-3.5 bg-[#faf5f6] border border-[#ebdcdc] rounded-3xl space-y-2.5">
              <span className="text-xs font-bold text-stone-700 block">
                + إضافة مادة من صفحة الأسعار:
              </span>

              {ingredientError && (
                <p className="text-[11px] text-red-600 font-bold">{ingredientError}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                {/* Material Select */}
                <div className="sm:col-span-6">
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => {
                      setSelectedMaterialId(e.target.value);
                      setIngredientError('');
                    }}
                    className="w-full px-3 py-2.5 text-xs bg-white border border-[#ebdcdc] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#844458]/40 font-semibold cursor-pointer"
                  >
                    <option value="">-- اختاري مادة من قائمة الأسعار --</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.category}) - {m.pricePerGram < 10 ? m.pricePerGram.toFixed(1) : Math.round(m.pricePerGram)} ل.س/غ
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grams Input */}
                <div className="sm:col-span-3">
                  <div className="relative">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={newIngredientGrams}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setNewIngredientGrams(val);
                        setIngredientError('');
                      }}
                      placeholder="الكمية بالغرام"
                      className="w-full pl-8 pr-3 py-2.5 text-xs bg-white border border-[#ebdcdc] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#844458]/40 font-bold"
                    />
                    <span className="absolute left-2.5 top-2.5 text-[11px] font-bold text-stone-400">
                      غرام
                    </span>
                  </div>
                </div>

                {/* Add Button */}
                <div className="sm:col-span-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleAddIngredient}
                    className="w-full h-full min-h-[38px] flex items-center justify-center gap-1.5 bg-[#6b3547] hover:bg-[#5a2a3b] text-white font-bold px-3 py-2 text-xs rounded-2xl shadow-2xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>إضافة المادة</span>
                  </motion.button>
                </div>
              </div>

              {/* Live Preview of selected material */}
              {activeMaterial && (
                <div className="flex items-center justify-between text-xs px-3 py-2 bg-white rounded-2xl text-stone-700 font-medium border border-[#ebdcdc]">
                  <span>
                    سعر الغرام الحالي: <strong>{activeMaterial.pricePerGram} ل.س / غ</strong>
                  </span>
                  {typeof newIngredientGrams === 'number' && newIngredientGrams > 0 && (
                    <span className="font-bold text-[#6b3547]">
                      تكلفة {formatWeight(newIngredientGrams)} = {formatCurrency(newIngredientGrams * activeMaterial.pricePerGram)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Ingredients Table */}
            {ingredients.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-[#ebdcdc] rounded-2xl text-stone-500 text-xs">
                لم تتم إضافة أي مكون بعد. اختاري مادة وحددي كميتها بالغرام من المربع أعلاه.
              </div>
            ) : (
              <div className="border border-[#ebdcdc] rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#faf5f6] text-stone-800 font-bold border-b border-[#ebdcdc]">
                    <tr>
                      <th className="py-2.5 px-3">المادة</th>
                      <th className="py-2.5 px-2 text-center">الكمية (غ)</th>
                      <th className="py-2.5 px-2 text-center">سعر الغرام</th>
                      <th className="py-2.5 px-3 text-left">التكلفة (ل.س)</th>
                      <th className="py-2.5 px-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {ingredients.map((ing, idx) => {
                      const mat = materialsMap.get(ing.materialId);
                      const currentRate = mat ? mat.pricePerGram : ing.costPerGram;
                      const itemTotal = ing.quantityGrams * currentRate;

                      return (
                        <tr key={ing.materialId + idx} className="hover:bg-[#faf7f5] transition">
                          <td className="py-2 px-3 font-semibold text-stone-800">
                            <div>{ing.materialName}</div>
                            {!mat && (
                              <span className="text-[10px] text-red-500">(مادة محذوفة من الأسعار)</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min="0.1"
                              step="any"
                              value={ing.quantityGrams}
                              onChange={(e) =>
                                handleUpdateIngredientQty(idx, parseFloat(e.target.value) || 0)
                              }
                              className="w-16 px-1.5 py-1 text-center bg-[#faf7f5] border border-[#ebdcdc] rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#844458]/40"
                            />
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-stone-600">
                            {currentRate} ل.س
                          </td>
                          <td className="py-2 px-3 text-left font-bold text-[#6b3547] font-mono">
                            {formatCurrency(itemTotal)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredient(idx)}
                              className="text-stone-400 hover:text-red-600 p-1 rounded-lg transition cursor-pointer"
                              title="حذف المكون"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-[#faf5f6] font-bold text-stone-800 border-t border-[#ebdcdc]">
                    <tr>
                      <td className="py-2.5 px-3">مجموع المواد الأولية:</td>
                      <td className="py-2.5 px-2 text-center font-mono text-[#6b3547]">
                        {formatWeight(costBreakdown.totalWeightGrams)}
                      </td>
                      <td></td>
                      <td className="py-2.5 px-3 text-left font-mono text-[#6b3547] text-sm font-black">
                        {formatCurrency(costBreakdown.rawIngredientsCost)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Overheads and Target Profit Margin */}
          <div className="border-t border-[#ebdcdc] pt-4 space-y-3">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#2c6e49]" />
              <span>التكاليف التشغيلية وهامش الربح</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#faf5f6] p-3 rounded-2xl border border-[#ebdcdc]">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  تكاليف تشغيلية (غاز/كهرباء/هدر) %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={overheadPercentage}
                    onChange={(e) => setOverheadPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-[#ebdcdc] rounded-xl font-bold"
                  />
                  <span className="absolute left-2.5 top-1.5 text-xs text-stone-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-stone-500 block mt-1">
                  = {formatCurrency(costBreakdown.overheadCost)}
                </span>
              </div>

              <div className="bg-[#faf5f6] p-3 rounded-2xl border border-[#ebdcdc]">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  تغليف وكرتون ثابت (ل.س)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={fixedOverhead}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                      setFixedOverhead(val);
                    }}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#ebdcdc] rounded-xl font-bold"
                  />
                  <span className="absolute left-2.5 top-1.5 text-[10px] text-stone-400 font-bold">ل.س</span>
                </div>
                <span className="text-[10px] text-stone-500 block mt-1">
                  علب فاخرة أو شرائط
                </span>
              </div>

              <div className="bg-[#edf5f0] p-3 rounded-2xl border border-[#cde2d5]">
                <label className="block text-[11px] font-bold text-[#2c6e49] mb-1">
                  هامش الربح المستهدف %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={targetMarginPercentage}
                    onChange={(e) => setTargetMarginPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-[#cde2d5] rounded-xl font-bold text-[#2c6e49]"
                  />
                  <span className="absolute left-2.5 top-1.5 text-xs text-[#2c6e49] font-bold">%</span>
                </div>
                <span className="text-[10px] text-[#2c6e49] block mt-1 font-bold">
                  ربح الوجبة: +{formatCurrency(costBreakdown.profitBatch)}
                </span>
              </div>
            </div>
          </div>

            {/* Section 4: Live Costing & Pricing Card */}
            <div className="p-4 bg-[#6b3547] text-white rounded-3xl shadow-md space-y-3.5">
              <div className="flex flex-wrap items-center justify-between border-b border-white/20 pb-2.5 gap-1.5">
                <span className="text-xs font-bold text-[#fcedf1] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#e698ae]" />
                  الحساب الآلي الشامل للتكلفة والربح:
                </span>
                <span className="text-[11px] text-[#fae4eb] font-semibold bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                  وزن الناتج: {costBreakdown.totalWeightGrams > 0 ? formatWeight(costBreakdown.totalWeightGrams, true) : '0 غ'} ({yieldCount} {yieldUnit})
                </span>
              </div>

              {/* Grid of Key Cost & Pricing Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center">
                {/* 1. Total Batch Cost */}
                <div className="bg-white/10 rounded-2xl p-2.5 border border-white/15">
                  <span className="text-[10px] text-[#fae4eb] font-medium block">تكلفة الوجبة الكلية</span>
                  <span className="text-sm sm:text-base font-black text-white font-mono mt-0.5 block">
                    {formatCurrency(costBreakdown.totalRecipeCost)}
                  </span>
                  <span className="text-[9px] text-[#fae4eb]/80 block">لإجمالي {yieldCount} {yieldUnit}</span>
                </div>

                {/* 2. Cost Per 1 KG (User Requested Prominent Feature) */}
                <div className="bg-[#fcedf1] text-[#5c2b3b] rounded-2xl p-2.5 border-2 border-[#e698ae] shadow-xs">
                  <span className="text-[10px] font-black text-[#6b3547] block flex items-center justify-center gap-1">
                    <span>⭐ تكلفة 1 كغ من الناتج:</span>
                  </span>
                  <span className="text-sm sm:text-base font-black text-[#5c2b3b] font-mono mt-0.5 block">
                    {formatCurrency(costBreakdown.costPerKg)}
                  </span>
                  <span className="text-[9px] text-[#844458] font-bold block">
                    لكل 1,000 غرام جاهز
                  </span>
                </div>

                {/* 3. Cost Per Piece */}
                <div className="bg-white/10 rounded-2xl p-2.5 border border-white/15">
                  <span className="text-[10px] text-[#fae4eb] font-medium block">تكلفة القطعة الواحدة</span>
                  <span className="text-sm sm:text-base font-black text-white font-mono mt-0.5 block">
                    {formatCurrency(costBreakdown.costPerUnit)}
                  </span>
                  <span className="text-[9px] text-[#fae4eb]/80 block">لكل 1 {yieldUnit}</span>
                </div>

                {/* 4. Suggested Sale Price for 1 KG */}
                <div className="bg-[#2c6e49]/40 rounded-2xl p-2.5 border border-white/20">
                  <span className="text-[10px] text-[#cde2d5] font-medium block">سعر بيع 1 كغ المقترح</span>
                  <span className="text-sm sm:text-base font-black text-white font-mono mt-0.5 block">
                    {formatCurrency(costBreakdown.suggestedSalePricePerKg)}
                  </span>
                  <span className="text-[9px] text-[#cde2d5] block font-bold">
                    ربح الكيلو: +{formatCurrency(costBreakdown.profitPerKg)}
                  </span>
                </div>

                {/* 5. Suggested Sale Price Per Piece */}
                <div className="bg-[#2c6e49]/40 rounded-2xl p-2.5 border border-white/20">
                  <span className="text-[10px] text-[#cde2d5] font-medium block">سعر بيع القطعة المقترح</span>
                  <span className="text-sm sm:text-base font-black text-white font-mono mt-0.5 block">
                    {formatCurrency(costBreakdown.suggestedSalePricePerUnit)}
                  </span>
                  <span className="text-[9px] text-[#cde2d5] block font-bold">
                    ربح القطعة: +{formatCurrency(costBreakdown.profitPerUnit)}
                  </span>
                </div>

                {/* 6. Total Profit for Batch */}
                <div className="bg-[#2c6e49]/40 rounded-2xl p-2.5 border border-white/20">
                  <span className="text-[10px] text-[#cde2d5] font-medium block">صافي ربح الوجبة كاملة</span>
                  <span className="text-sm sm:text-base font-black text-white font-mono mt-0.5 block">
                    +{formatCurrency(costBreakdown.profitBatch)}
                  </span>
                  <span className="text-[9px] text-[#cde2d5] block">
                    هامش الربح {targetMarginPercentage}%
                  </span>
                </div>
              </div>

              {/* Explanation Banner */}
              {costBreakdown.totalWeightGrams > 0 && (
                <div className="bg-white/10 rounded-2xl p-2.5 text-[11px] text-[#fae4eb] flex flex-col sm:flex-row sm:items-center justify-between gap-1 border border-white/10">
                  <span>
                    💡 <strong>توضيح التكلفة:</strong> ناتج الوصفة هو <strong>{formatWeight(costBreakdown.totalWeightGrams, true)}</strong>، وبذلك تكون تكلفة كل 1 كغ جاهز = <strong className="text-white font-mono underline decoration-[#e698ae] decoration-2">{formatCurrency(costBreakdown.costPerKg)}</strong>.
                  </span>
                  <span className="text-[#cde2d5] font-bold">
                    سعر بيع الوجبة: {formatCurrency(costBreakdown.suggestedSalePriceBatch)}
                  </span>
                </div>
              )}
            </div>

          {/* Section 5: Preparation Steps / Chef Notes */}
          <div className="border-t border-[#ebdcdc] pt-3">
            <label className="block text-xs font-bold text-stone-700 mb-1">
              طريقة التحضير وملاحظات الشيف
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="خطوات العجن، درجات حرارة الفرن، وقت التبريد، لمسات التزيين..."
              className="w-full px-4 py-2.5 text-xs bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40 font-medium transition"
            />
          </div>
        </form>

        {/* Footer Actions - ALWAYS visible at the bottom of the modal */}
        <div className="shrink-0 bg-[#faf7f5] border-t border-[#ebdcdc] px-5 py-3 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-800 hover:bg-stone-200/60 rounded-2xl transition cursor-pointer"
          >
            إلغاء
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            form="recipe-form"
            className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-[#6b3547] hover:bg-[#5a2a3b] text-white rounded-2xl shadow-xs transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{recipeToEdit ? 'حفظ تعديلات الوصفة' : 'اعتماد وحفظ الوصفة'}</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
