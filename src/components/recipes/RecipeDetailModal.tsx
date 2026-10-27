import React, { useState, useMemo } from 'react';
import { Recipe } from '../../types';
import { useWorkshop } from '../../context/WorkshopContext';
import { 
  formatCurrency, formatWeight, calculateRecipeCost, scaleRecipeIngredients 
} from '../../utils/formatters';
import { 
  X, Printer, Copy, Check, Edit3, Trash2, Scale, 
  Clock, ChefHat, Calculator, Heart 
} from 'lucide-react';
import { motion } from 'motion/react';

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
  onEdit: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, onClose, onEdit }) => {
  const { materialsMap, setSelectedRecipeIdForOrder, setActiveTab, deleteRecipe } = useWorkshop();
  
  const [multiplier, setMultiplier] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const baseCost = useMemo(() => {
    return calculateRecipeCost(recipe, materialsMap);
  }, [recipe, materialsMap]);

  const targetCount = Math.round(recipe.yieldCount * multiplier);

  const scaled = useMemo(() => {
    return scaleRecipeIngredients(recipe, targetCount, materialsMap);
  }, [recipe, targetCount, materialsMap]);

  const handleCopyText = () => {
    let text = `📜 بطاقة وصفة: ${recipe.name}\n`;
    text += `🏷️ التصنيف: ${recipe.category}\n`;
    text += `📦 الكمية: ${targetCount} ${recipe.yieldUnit} (${multiplier}x)\n`;
    text += `⏱️ وقت التحضير: ${recipe.preparationTimeMinutes || '-'} دقيقة\n\n`;
    text += `⚖️ المكونات المطلوبة:\n`;

    scaled.scaledIngredients.forEach((ing) => {
      text += `• ${ing.materialName}: ${formatWeight(ing.scaledGrams)} (التكلفة: ${formatCurrency(ing.cost)})\n`;
    });

    text += `\n💰 الملخص المالي بالليرة السورية:\n`;
    text += `• تكلفة المواد الأولية: ${formatCurrency(scaled.totalRawCost)}\n`;
    text += `• التكلفة الإجمالية: ${formatCurrency(scaled.totalCost)}\n`;
    text += `• تكلفة القطعة: ${formatCurrency(scaled.costPerUnit)}\n`;
    text += `• سعر البيع المقترح: ${formatCurrency(scaled.totalSale)} (${formatCurrency(scaled.salePerUnit)} للقطعة)\n`;
    text += `• صافي الربح: ${formatCurrency(scaled.profit)}\n`;

    if (recipe.instructions) {
      text += `\n👩‍🍳 طريقة التحضير:\n${recipe.instructions}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoToOrderCalc = () => {
    setSelectedRecipeIdForOrder(recipe.id);
    setActiveTab('orders');
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
        {/* Modal Top Actions - Fixed Header */}
        <div className="no-print shrink-0 bg-[#6b3547] px-5 py-3.5 text-white flex items-center justify-between border-b border-[#5a2a3b]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">
              {recipe.category}
            </span>
            <span className="text-xs text-[#fae4eb] font-medium">بطاقة التكلفة والمكونات</span>
          </div>

          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyText}
              className="p-1.5 px-2.5 rounded-xl text-[#fae4eb] hover:text-white hover:bg-white/15 transition flex items-center gap-1 text-xs cursor-pointer"
              title="نسخ بيانات الوصفة"
            >
              {copied ? <Check className="w-4 h-4 text-[#cde2d5]" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'نسخ'}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              className="p-1.5 px-2.5 rounded-xl text-[#fae4eb] hover:text-white hover:bg-white/15 transition flex items-center gap-1 text-xs cursor-pointer"
              title="طباعة بطاقة الوصفة"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="p-1.5 px-2.5 rounded-xl text-[#fae4eb] hover:text-white hover:bg-white/15 transition flex items-center gap-1 text-xs cursor-pointer"
              title="تعديل"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">تعديل</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#fae4eb] hover:text-white hover:bg-white/15 transition mr-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Content Body - Smooth internal scroll */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 touch-pan-y">
          {/* Recipe Header Card */}
          <div className="bg-[#faf5f6] border border-[#ebdcdc] rounded-3xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-stone-900 font-heading flex items-center gap-1.5">
                  <span>{recipe.name}</span>
                  <Heart className="w-4 h-4 text-[#e698ae] fill-[#e698ae]" />
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-stone-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-[#6b3547]" />
                    الناتج الأساسي: <strong>{recipe.yieldCount} {recipe.yieldUnit}</strong>
                  </span>
                  {recipe.preparationTimeMinutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#6b3547]" />
                      التحضير: <strong>{recipe.preparationTimeMinutes} دقيقة</strong>
                    </span>
                  )}
                  <span>
                    الوزن الكلي: <strong>{formatWeight(baseCost.totalWeightGrams)}</strong>
                  </span>
                </div>
              </div>

              {/* Scaling Switcher (no-print) */}
              <div className="no-print mt-2 sm:mt-0 flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#ebdcdc] shadow-2xs self-start sm:self-auto">
                <span className="text-[11px] font-bold text-stone-600 mr-1">مضاعفة:</span>
                {[0.5, 1, 2, 5].map((scaleVal) => (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    key={scaleVal}
                    onClick={() => setMultiplier(scaleVal)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                      multiplier === scaleVal
                        ? 'bg-[#6b3547] text-white shadow-2xs'
                        : 'text-stone-600 hover:bg-[#faf5f6]'
                    }`}
                  >
                    {scaleVal}x
                  </motion.button>
                ))}
              </div>
            </div>

            {multiplier !== 1 && (
              <div className="no-print mt-2.5 pt-2.5 border-t border-[#ebdcdc] text-xs text-stone-800 font-bold flex items-center justify-between">
                <span>يتم عرض الكميات والتكلفة لمضاعفة {multiplier}x:</span>
                <span className="bg-[#f2e6ea] text-[#6b3547] px-2.5 py-0.5 rounded-full font-black">
                  الناتج المستهدف: {targetCount} {recipe.yieldUnit}
                </span>
              </div>
            )}
          </div>

          {/* Key Financial Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            <div className="bg-[#faf7f5] border border-[#ebdcdc] p-3 rounded-2xl text-center">
              <span className="text-[10px] text-stone-500 font-bold block">
                {multiplier !== 1 ? 'التكلفة الإجمالية للكمية' : 'تكلفة الوجبة الكلية'}
              </span>
              <span className="text-base font-black text-stone-900 font-mono mt-0.5 block">
                {formatCurrency(scaled.totalCost)}
              </span>
              <span className="text-[9px] text-stone-400 block">لإجمالي {targetCount} {recipe.yieldUnit}</span>
            </div>

            <div className="bg-[#fcedf1] border-2 border-[#e698ae] p-3 rounded-2xl text-center shadow-xs">
              <span className="text-[10px] font-black text-[#6b3547] block">
                ⭐ تكلفة 1 كغ من الناتج
              </span>
              <span className="text-base font-black text-[#5c2b3b] font-mono mt-0.5 block">
                {formatCurrency(scaled.costPerKg)}
              </span>
              <span className="text-[9px] text-[#844458] font-bold block">لكل 1,000 غرام</span>
            </div>

            <div className="bg-[#faf5f6] border border-[#eedfe2] p-3 rounded-2xl text-center">
              <span className="text-[10px] text-[#6b3547] font-bold block">
                تكلفة القطعة الواحدة
              </span>
              <span className="text-base font-black text-[#6b3547] font-mono mt-0.5 block">
                {formatCurrency(scaled.costPerUnit)}
              </span>
              <span className="text-[9px] text-stone-400 block">لكل 1 {recipe.yieldUnit}</span>
            </div>

            <div className="bg-[#edf5f0] border border-[#cde2d5] p-3 rounded-2xl text-center">
              <span className="text-[10px] text-[#2c6e49] font-bold block">
                سعر بيع 1 كغ المقترح
              </span>
              <span className="text-base font-black text-[#2c6e49] font-mono mt-0.5 block">
                {formatCurrency(scaled.salePerKg)}
              </span>
              <span className="text-[9px] text-[#2c6e49] block">
                (هامش {recipe.targetMarginPercentage}%)
              </span>
            </div>

            <div className="bg-[#edf5f0] border border-[#cde2d5] p-3 rounded-2xl text-center">
              <span className="text-[10px] text-[#2c6e49] font-bold block">
                سعر بيع القطعة
              </span>
              <span className="text-base font-black text-[#2c6e49] font-mono mt-0.5 block">
                {formatCurrency(scaled.salePerUnit)}
              </span>
              <span className="text-[9px] text-[#2c6e49] block font-bold">
                ربح: +{formatCurrency(scaled.salePerUnit - scaled.costPerUnit)}
              </span>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-stone-800 uppercase tracking-wider">
                جدول المواد والمكونات بالغرام والليرة السورية
              </h3>
              <span className="text-[11px] text-stone-500">
                {scaled.scaledIngredients.length} مواد
              </span>
            </div>

            <div className="border border-[#ebdcdc] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#faf5f6] text-stone-800 font-bold border-b border-[#ebdcdc]">
                  <tr>
                    <th className="py-2.5 px-3">المادة</th>
                    <th className="py-2.5 px-2 text-center">الكمية المطلوبة</th>
                    <th className="py-2.5 px-2 text-center">سعر الغرام</th>
                    <th className="py-2.5 px-3 text-left">التكلفة (ل.س)</th>
                    <th className="py-2.5 px-2 text-center">% من التكلفة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {scaled.scaledIngredients.map((item, idx) => {
                    const pct = scaled.totalRawCost > 0
                      ? Math.round((item.cost / scaled.totalRawCost) * 100)
                      : 0;

                    return (
                      <tr key={item.materialId + idx} className="hover:bg-[#faf7f5]">
                        <td className="py-2.5 px-3 font-semibold text-stone-900">
                          {item.materialName}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-stone-800">
                          {formatWeight(item.scaledGrams, true)}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-stone-600">
                          {item.rate} ل.س
                        </td>
                        <td className="py-2.5 px-3 text-left font-bold text-stone-900 font-mono">
                          {formatCurrency(item.cost)}
                        </td>
                        <td className="py-2.5 px-2 text-center text-[11px] text-stone-500 font-mono">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-[#faf5f6] font-bold text-stone-800 border-t border-[#ebdcdc]">
                  <tr>
                    <td className="py-2 px-3">مجموع المواد الأولية:</td>
                    <td className="py-2 px-2 text-center font-mono">
                      {formatWeight(
                        scaled.scaledIngredients.reduce((s, i) => s + i.scaledGrams, 0),
                        true
                      )}
                    </td>
                    <td></td>
                    <td className="py-2 px-3 text-left font-mono text-[#5c2b3b] font-black">
                      {formatCurrency(scaled.totalRawCost)}
                    </td>
                    <td className="text-center font-mono">100%</td>
                  </tr>
                  {scaled.overhead > 0 && (
                    <tr className="text-stone-600 bg-stone-50 font-medium">
                      <td className="py-1.5 px-3">مصاريف تشغيلية ({recipe.overheadPercentage}%):</td>
                      <td></td>
                      <td></td>
                      <td className="py-1.5 px-3 text-left font-mono">
                        +{formatCurrency(scaled.overhead)}
                      </td>
                      <td></td>
                    </tr>
                  )}
                  {scaled.scaledFixed > 0 && (
                    <tr className="text-stone-600 bg-stone-50 font-medium">
                      <td className="py-1.5 px-3">تغليف ولوازم ثابتة:</td>
                      <td></td>
                      <td></td>
                      <td className="py-1.5 px-3 text-left font-mono">
                        +{formatCurrency(scaled.scaledFixed)}
                      </td>
                      <td></td>
                    </tr>
                  )}
                  <tr className="bg-[#f5ebee] text-[#5c2b3b] font-black border-t border-[#ebdcdc] text-sm">
                    <td className="py-2.5 px-3">التكلفة النهائية الكلية:</td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      {targetCount} {recipe.yieldUnit}
                    </td>
                    <td></td>
                    <td className="py-2.5 px-3 text-left font-mono text-base">
                      {formatCurrency(scaled.totalCost)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Preparation Instructions if any */}
          {recipe.instructions && (
            <div className="bg-[#faf7f5] border border-[#ebdcdc] p-4 rounded-2xl space-y-1.5">
              <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-[#6b3547]" />
                طريقة التحضير وملاحظات الشيف:
              </h4>
              <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed pr-5 font-medium">
                {recipe.instructions}
              </p>
            </div>
          )}

          {/* Quick Production Calculator Trigger */}
          <div className="no-print p-4 bg-[#6b3547] text-white rounded-3xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-2xl">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold block">هل لديكِ طلبية زبونة أو عرس لهذه الوصفة؟</span>
                <span className="text-[11px] text-[#fae4eb]">افتحي حاسبة الإنتاج لحساب الكميات الدقيقة فوراً</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToOrderCalc}
              className="px-4 py-2 bg-white hover:bg-[#faf5f6] text-[#6b3547] font-black text-xs rounded-2xl shadow-xs transition cursor-pointer"
            >
              حاسبة الطلبية ←
            </motion.button>
          </div>
        </div>

        {/* Modal Footer (no-print) - Fixed */}
        <div className="no-print shrink-0 bg-[#faf7f5] border-t border-[#ebdcdc] px-5 py-3 flex items-center justify-between">
          <div>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-stone-400 hover:text-red-600 text-xs font-bold p-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الوصفة</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-bold">تأكيد الحذف؟</span>
                <button
                  onClick={() => {
                    deleteRecipe(recipe.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold bg-red-600 text-white rounded-xl cursor-pointer"
                >
                  نعم
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 text-[11px] text-stone-600 hover:bg-stone-200 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-200/60 rounded-2xl transition cursor-pointer"
            >
              إغلاق
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="px-5 py-2 text-xs font-bold bg-[#6b3547] hover:bg-[#5a2a3b] text-white rounded-2xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل المكونات والأسعار</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
