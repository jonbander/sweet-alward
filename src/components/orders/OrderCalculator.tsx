import React, { useState, useMemo } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { 
  formatCurrency, formatWeight, scaleRecipeIngredients 
} from '../../utils/formatters';
import { 
  Calculator, Printer, Copy, Check, Scale, 
  Heart 
} from 'lucide-react';
import { motion } from 'motion/react';

export const OrderCalculator: React.FC = () => {
  const { recipes, materialsMap, selectedRecipeIdForOrder, setSelectedRecipeIdForOrder } = useWorkshop();

  const [activeRecipeId, setActiveRecipeId] = useState<string>(() => {
    if (selectedRecipeIdForOrder && recipes.some((r) => r.id === selectedRecipeIdForOrder)) {
      return selectedRecipeIdForOrder;
    }
    return recipes[0]?.id || '';
  });

  const activeRecipe = useMemo(() => {
    return recipes.find((r) => r.id === activeRecipeId) || recipes[0] || null;
  }, [activeRecipeId, recipes]);

  const [targetQuantity, setTargetQuantity] = useState<number | ''>(() => {
    return activeRecipe ? activeRecipe.yieldCount * 2 : 50;
  });

  const [activePreset, setActivePreset] = useState<string>('2');
  const [copied, setCopied] = useState(false);

  const handleSelectRecipe = (id: string) => {
    setActiveRecipeId(id);
    setSelectedRecipeIdForOrder(id);
    const rec = recipes.find((r) => r.id === id);
    if (rec) {
      setTargetQuantity(rec.yieldCount * 2);
      setActivePreset('2');
    }
  };

  const handleApplyMultiplier = (multiplier: number) => {
    if (!activeRecipe) return;
    const count = Math.round(activeRecipe.yieldCount * multiplier);
    setTargetQuantity(count);
    setActivePreset(multiplier.toString());
  };

  const targetCountNum = typeof targetQuantity === 'number' && targetQuantity > 0 ? targetQuantity : 1;

  const orderResult = useMemo(() => {
    if (!activeRecipe) return null;
    return scaleRecipeIngredients(activeRecipe, targetCountNum, materialsMap);
  }, [activeRecipe, targetCountNum, materialsMap]);

  const handleCopyOrder = () => {
    if (!activeRecipe || !orderResult) return;

    let text = `📋 كشف تشغيل وطلبية إنتاج حلويات:\n`;
    text += `🧁 الوصفة: ${activeRecipe.name}\n`;
    text += `📦 الكمية المطلوبة: ${targetCountNum} ${activeRecipe.yieldUnit}\n`;
    if (orderResult.totalWeightGrams > 0) {
      text += `⚖️ إجمالي وزن الناتج: ${formatWeight(orderResult.totalWeightGrams, true)}\n`;
    }
    text += `\nالمواد الأولية الواجب صرفها من المستودع:\n`;

    orderResult.scaledIngredients.forEach((item) => {
      text += `• ${item.materialName}: ${formatWeight(item.scaledGrams, true)} (تكلفة: ${formatCurrency(item.cost)})\n`;
    });

    text += `\n💰 ملخص التكلفة والبيع (ليرة سورية):\n`;
    text += `• تكلفة المواد الأولية: ${formatCurrency(orderResult.totalRawCost)}\n`;
    text += `• التكلفة الإجمالية للطلبية: ${formatCurrency(orderResult.totalCost)}\n`;
    if (orderResult.costPerKg > 0) {
      text += `• ⭐ تكلفة 1 كغ من الناتج: ${formatCurrency(orderResult.costPerKg)}\n`;
      text += `• سعر بيع 1 كغ المقترح: ${formatCurrency(orderResult.salePerKg)}\n`;
    }
    text += `• تكلفة القطعة الواحدة: ${formatCurrency(orderResult.costPerUnit)}\n`;
    text += `• سعر البيع المقترح: ${formatCurrency(orderResult.totalSale)} (${formatCurrency(orderResult.salePerUnit)} للقطعة)\n`;
    text += `• صافي الربح المتوقع: +${formatCurrency(orderResult.profit)} (هامش ${activeRecipe.targetMarginPercentage}%)\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (recipes.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-[#ebdcdc] space-y-3">
        <div className="w-14 h-14 bg-[#f8f0f2] text-[#6b3547] rounded-full flex items-center justify-center mx-auto">
          <Calculator className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-stone-800">لا توجد وصفات جاهزة للحساب</h3>
        <p className="text-xs text-stone-500">
          يرجى إنشاء وصفة أولاً في صفحة الوصفات ليتم حساب تكلفة طلبيات الإنتاج.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Selector Card */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="no-print bg-white rounded-3xl p-4 sm:p-5 shadow-2xs border border-[#ebdcdc] space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-[#f8f0f2] text-[#6b3547] rounded-2xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
              <span>حاسبة إنتاج وتكلفة الطلبيات</span>
              <Heart className="w-3.5 h-3.5 text-[#e698ae] fill-[#e698ae]" />
            </h2>
            <p className="text-xs text-stone-500">
              حددي الوصفة والكمية المطلوبة للزبونة لحساب كميات المواد والتكلفة الإجمالية فوراً
            </p>
          </div>
        </div>

        {/* Recipe Picker */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            اختاري الوصفة المراد تصنيعها:
          </label>
          <select
            value={activeRecipe?.id || ''}
            onChange={(e) => handleSelectRecipe(e.target.value)}
            className="w-full px-4 py-3 bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl text-xs sm:text-sm font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40 cursor-pointer"
          >
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (أساس الوصفة: {r.yieldCount} {r.yieldUnit}) - {r.category}
              </option>
            ))}
          </select>
        </div>

        {/* Target Count & Multipliers Dropdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-stone-700">
              الكمية المطلوبة في الطلبية ({activeRecipe?.yieldUnit || 'قطعة'}):
            </label>
            <span className="text-[11px] text-stone-500 font-medium">
              يمكنك كتابة العدد المطلوب مباشرة أو اختيار مضاعفة سريعة
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Free exact manual typing input */}
            <div className="sm:col-span-7 relative">
              <input
                type="number"
                min="1"
                value={targetQuantity}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value);
                  setTargetQuantity(val);
                  setActivePreset('custom');
                }}
                placeholder="أدخلي العدد المطلوب بحرية..."
                className="w-full px-4 py-2.5 bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl text-base font-black text-[#5c2b3b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40 font-mono"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 pointer-events-none">
                {activeRecipe?.yieldUnit || 'قطعة'}
              </span>
            </div>

            {/* Quick Multiplier Dropdown List */}
            <div className="sm:col-span-5">
              <select
                value={activePreset}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setActivePreset('custom');
                  } else {
                    const mult = parseFloat(val);
                    if (!isNaN(mult)) {
                      handleApplyMultiplier(mult);
                    }
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-[#f8f0f2] border border-[#ebdcdc] rounded-2xl text-xs sm:text-sm font-bold text-[#6b3547] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40 cursor-pointer"
              >
                <option value="custom" disabled={activePreset !== 'custom'}>
                  {activePreset === 'custom'
                    ? `✏️ كمية مخصصة (${targetQuantity || 0} ${activeRecipe?.yieldUnit || ''})`
                    : '-- اختاري مضاعفة سريعة --'}
                </option>
                <option value="1">1x (الوصفة الأصلية: {activeRecipe?.yieldCount} {activeRecipe?.yieldUnit})</option>
                <option value="2">2x (الضعف: {(activeRecipe?.yieldCount || 0) * 2} {activeRecipe?.yieldUnit})</option>
                <option value="3">3x (3 أضعاف: {(activeRecipe?.yieldCount || 0) * 3} {activeRecipe?.yieldUnit})</option>
                <option value="4">4x (4 أضعاف: {(activeRecipe?.yieldCount || 0) * 4} {activeRecipe?.yieldUnit})</option>
                <option value="5">5x (5 أضعاف: {(activeRecipe?.yieldCount || 0) * 5} {activeRecipe?.yieldUnit})</option>
                <option value="10">10x (10 أضعاف: {(activeRecipe?.yieldCount || 0) * 10} {activeRecipe?.yieldUnit})</option>
                <option value="20">20x (20 ضعف: {(activeRecipe?.yieldCount || 0) * 20} {activeRecipe?.yieldUnit})</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Production Order Output Result */}
      {orderResult && activeRecipe && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xs border border-[#ebdcdc] overflow-hidden space-y-4 p-4 sm:p-5"
        >
          {/* Header of the Order Sheet */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
            <div>
              <span className="text-[10px] font-bold text-[#6b3547] bg-[#f8f0f2] px-2.5 py-0.5 rounded-full border border-[#eddfe2]">
                كشف إنتاج طلبية معمل
              </span>
              <h3 className="text-base sm:text-lg font-black text-stone-900 mt-1 flex items-center gap-1.5">
                <span>{activeRecipe.name}</span>
                <Heart className="w-4 h-4 text-[#e698ae] fill-[#e698ae]" />
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                الكمية المطلوبة: <strong className="text-[#6b3547] font-bold">{targetCountNum} {activeRecipe.yieldUnit}</strong> (مضاعفة بنسبة {orderResult.ratio.toFixed(2)}x)
                {orderResult.totalWeightGrams > 0 && (
                  <span className="mr-2 text-stone-500">
                    | وزن الناتج الإجمالي: <strong className="text-stone-800 font-bold">{formatWeight(orderResult.totalWeightGrams, true)}</strong>
                  </span>
                )}
              </p>
            </div>

            {/* Print and Copy Actions */}
            <div className="no-print flex items-center gap-2 self-start sm:self-auto">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyOrder}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f0f2] hover:bg-[#ebdcdc] text-[#6b3547] rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-[#2c6e49]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ الكشف'}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6b3547] hover:bg-[#5a2a3b] text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة للورشة</span>
              </motion.button>
            </div>
          </div>

          {/* Financial Overview Cards with 1 KG Cost */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* 1. Raw Materials Cost */}
            <div className="bg-[#faf7f5] border border-[#ebdcdc] p-3 rounded-2xl text-center">
              <span className="text-[10px] text-stone-500 font-bold block">
                تكلفة المواد الأولية
              </span>
              <span className="text-sm sm:text-base font-black text-stone-900 font-mono mt-0.5 block">
                {formatCurrency(orderResult.totalRawCost)}
              </span>
              <span className="text-[9px] text-stone-400 block">
                من المستودع
              </span>
            </div>

            {/* 2. Total Order Cost */}
            <div className="bg-[#faf5f6] border border-[#eedfe2] p-3 rounded-2xl text-center">
              <span className="text-[10px] text-[#6b3547] font-bold block">
                التكلفة الكلية للطلبية
              </span>
              <span className="text-sm sm:text-base font-black text-[#5c2b3b] font-mono mt-0.5 block">
                {formatCurrency(orderResult.totalCost)}
              </span>
              <span className="text-[9px] text-[#844458] block font-semibold">
                ({formatCurrency(orderResult.costPerUnit)} للقطعة)
              </span>
            </div>

            {/* 3. Cost Per 1 KG (User Requested Feature) */}
            <div className="bg-[#fcedf1] border-2 border-[#e698ae] p-3 rounded-2xl text-center shadow-xs">
              <span className="text-[10px] text-[#6b3547] font-black block">
                ⭐ تكلفة 1 كغ من الناتج
              </span>
              <span className="text-sm sm:text-base font-black text-[#5c2b3b] font-mono mt-0.5 block">
                {orderResult.costPerKg > 0 ? formatCurrency(orderResult.costPerKg) : '—'}
              </span>
              <span className="text-[9px] text-[#2c6e49] block font-bold">
                بيع الكيلو: {orderResult.salePerKg > 0 ? formatCurrency(orderResult.salePerKg) : '—'}
              </span>
            </div>

            {/* 4. Suggested Sale Price */}
            <div className="bg-[#edf5f0] border border-[#cde2d5] p-3 rounded-2xl text-center">
              <span className="text-[10px] text-[#2c6e49] font-bold block">
                سعر البيع المقترح
              </span>
              <span className="text-sm sm:text-base font-black text-[#2c6e49] font-mono mt-0.5 block">
                {formatCurrency(orderResult.totalSale)}
              </span>
              <span className="text-[9px] text-[#2c6e49] block font-semibold">
                ({formatCurrency(orderResult.salePerUnit)} للقطعة)
              </span>
            </div>

            {/* 5. Expected Profit */}
            <div className="bg-[#edf5f0] border border-[#cde2d5] p-3 rounded-2xl text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-[#2c6e49] font-bold block">
                صافي الربح المتوقع
              </span>
              <span className="text-sm sm:text-base font-black text-[#2c6e49] font-mono mt-0.5 block">
                +{formatCurrency(orderResult.profit)}
              </span>
              <span className="text-[9px] text-[#2c6e49] block font-semibold">
                هامش {activeRecipe.targetMarginPercentage}%
              </span>
            </div>
          </div>

          {/* Ingredients Breakdown Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#6b3547]" />
                <span>المواد الأولية الواجب صرفها من المستودع للورشة:</span>
              </h4>
              <span className="text-[11px] text-stone-500 font-mono">
                {orderResult.scaledIngredients.length} أصناف
              </span>
            </div>

            <div className="border border-[#ebdcdc] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#faf5f6] text-stone-800 font-bold border-b border-[#ebdcdc]">
                  <tr>
                    <th className="py-2.5 px-3">المادة الأولية</th>
                    <th className="py-2.5 px-2 text-center">الكمية المطلوبة (غ / كغ)</th>
                    <th className="py-2.5 px-2 text-center">سعر الغرام</th>
                    <th className="py-2.5 px-3 text-left">تكلفة المكون (ل.س)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orderResult.scaledIngredients.map((item, idx) => (
                    <tr key={item.materialId + idx} className="hover:bg-[#faf7f5]">
                      <td className="py-2.5 px-3 font-semibold text-stone-900">
                        {item.materialName}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-[#5c2b3b] font-mono">
                        {formatWeight(item.scaledGrams, true)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-stone-600">
                        {item.rate} ل.س
                      </td>
                      <td className="py-2.5 px-3 text-left font-bold text-stone-900 font-mono">
                        {formatCurrency(item.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#faf5f6] font-bold text-stone-800 border-t border-[#ebdcdc]">
                  <tr>
                    <td className="py-2 px-3">إجمالي وزن المواد:</td>
                    <td className="py-2 px-2 text-center font-mono text-stone-900">
                      {formatWeight(
                        orderResult.scaledIngredients.reduce((s, i) => s + i.scaledGrams, 0),
                        true
                      )}
                    </td>
                    <td></td>
                    <td className="py-2 px-3 text-left font-mono font-black text-[#5c2b3b]">
                      {formatCurrency(orderResult.totalRawCost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Workshop Staff Notes */}
          {activeRecipe.instructions && (
            <div className="bg-[#faf7f5] border border-[#ebdcdc] p-3 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-stone-800 block">تعليمات التصنيع للشيف:</span>
              <p className="text-stone-600 whitespace-pre-line leading-relaxed">
                {activeRecipe.instructions}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
