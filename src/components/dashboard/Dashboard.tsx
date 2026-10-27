import React, { useMemo } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { formatCurrency, calculateRecipeCost } from '../../utils/formatters';
import { 
  Tag, BookOpen, Calculator, TrendingUp, Sparkles, 
  Award, Coins, Heart 
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  onOpenAddMaterial: () => void;
  onOpenAddRecipe: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenAddMaterial, onOpenAddRecipe }) => {
  const { materials, recipes, materialsMap, setActiveTab } = useWorkshop();

  const topExpensiveMaterials = useMemo(() => {
    return [...materials].sort((a, b) => b.pricePerGram - a.pricePerGram).slice(0, 5);
  }, [materials]);

  const recipeStats = useMemo(() => {
    if (recipes.length === 0) return null;
    const computed = recipes.map((r) => ({
      recipe: r,
      cost: calculateRecipeCost(r, materialsMap),
    }));

    computed.sort((a, b) => b.cost.costPerUnit - a.cost.costPerUnit);

    const highestUnitCost = computed[0];
    const lowestUnitCost = computed[computed.length - 1];

    const totalBatchCosts = computed.reduce((sum, item) => sum + item.cost.totalRecipeCost, 0);
    const avgBatchCost = totalBatchCosts / recipes.length;

    return {
      highestUnitCost,
      lowestUnitCost,
      avgBatchCost,
      computed,
    };
  }, [recipes, materialsMap]);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#6b3547] rounded-3xl p-5 sm:p-6 text-white shadow-xs border border-[#5a2a3b] relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#844458] text-[#fcedf1] text-[10px] font-bold px-3 py-1 rounded-full border border-[#9d556c] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#e698ae]" />
            <span>استوديو ومعمل الحلويات الفاخرة</span>
            <Heart className="w-3 h-3 text-[#e698ae] fill-[#e698ae]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            أهلاً بكِ في نظام تسعير وتكاليف الحلويات
          </h2>
          <p className="text-xs sm:text-sm text-[#fae4eb] mt-1.5 max-w-lg leading-relaxed">
            حساب دقيق لأسعار المواد بالغرام وتكلفة الوصفات وهوامش الأرباح لتفادي الخسائر ومواكبة تغير الأسعار.
          </p>

          {/* Action Shortcuts */}
          <div className="grid grid-cols-2 gap-2.5 mt-5 pt-3.5 border-t border-white/20">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAddMaterial}
              className="flex items-center justify-center gap-1.5 bg-white text-[#6b3547] hover:bg-[#faf4f6] font-black py-2.5 px-3 rounded-2xl text-xs transition shadow-2xs cursor-pointer"
            >
              <Tag className="w-4 h-4" />
              <span>تسجيل مادة وسعر جديد</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAddRecipe}
              className="flex items-center justify-center gap-1.5 bg-[#844458] hover:bg-[#965066] active:scale-95 text-white font-bold py-2.5 px-3 rounded-2xl text-xs transition border border-[#9d556c] cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>حساب تكلفة وصفة</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main 4 Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => setActiveTab('materials')}
          className="bg-white p-4 rounded-3xl border border-[#ebdcdc] shadow-2xs hover:border-[#dabec5] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-400 mb-1.5">
            <span className="text-[11px] font-bold text-stone-600">المواد الأولية</span>
            <div className="p-1.5 bg-[#f8f0f2] text-[#6b3547] rounded-xl">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-stone-900 font-mono block">
            {materials.length}
          </span>
          <span className="text-[10px] text-[#6b3547] font-bold mt-1 block">
            عرض وتحديث الأسعار ←
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => setActiveTab('recipes')}
          className="bg-white p-4 rounded-3xl border border-[#ebdcdc] shadow-2xs hover:border-[#dabec5] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-400 mb-1.5">
            <span className="text-[11px] font-bold text-stone-600">الوصفات المسجلة</span>
            <div className="p-1.5 bg-[#f8f0f2] text-[#6b3547] rounded-xl">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-stone-900 font-mono block">
            {recipes.length}
          </span>
          <span className="text-[10px] text-[#6b3547] font-bold mt-1 block">
            إدارة الوصفات والقطع ←
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-4 rounded-3xl border border-[#ebdcdc] shadow-2xs"
        >
          <div className="flex items-center justify-between text-stone-400 mb-1.5">
            <span className="text-[11px] font-bold text-stone-600">أعلى مادة تكلفة</span>
            <div className="p-1.5 bg-[#f8f0f2] text-[#6b3547] rounded-xl">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <span className="text-sm font-black text-stone-900 truncate block" title={topExpensiveMaterials[0]?.name}>
            {topExpensiveMaterials[0]?.name || '-'}
          </span>
          <span className="text-[10px] text-stone-500 font-bold block mt-0.5">
            {topExpensiveMaterials[0] ? `${topExpensiveMaterials[0].pricePerGram} ل.س / غ` : '-'}
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => setActiveTab('orders')}
          className="bg-white p-4 rounded-3xl border border-[#ebdcdc] shadow-2xs hover:border-[#dabec5] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-400 mb-1.5">
            <span className="text-[11px] font-bold text-stone-600">حاسبة الإنتاج</span>
            <div className="p-1.5 bg-[#edf5f0] text-[#2c6e49] rounded-xl">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <span className="text-sm font-black text-[#2c6e49] block mt-1">
            جاهزة للحساب
          </span>
          <span className="text-[10px] text-stone-500 font-bold mt-1 block">
            طلبيات ومضاعفة كميات ←
          </span>
        </motion.div>
      </div>

      {/* Top 5 Most Expensive Materials per Gram */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xs border border-[#ebdcdc] space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-[#6b3547]" />
            <span>أعلى المواد سعراً للغرام الواحد (يجب مراقبة هدرها):</span>
          </h3>
          <button
            onClick={() => setActiveTab('materials')}
            className="text-[11px] text-[#6b3547] font-bold hover:underline cursor-pointer"
          >
            كل المواد
          </button>
        </div>

        <div className="space-y-2">
          {topExpensiveMaterials.map((mat, idx) => (
            <div
              key={mat.id}
              className="flex items-center justify-between p-2.5 px-3 bg-[#faf7f5] hover:bg-[#f8f0f2] rounded-2xl transition border border-[#ebdcdc]"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#6b3547] text-white font-black text-[10px] flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-xs font-bold text-stone-900 block">{mat.name}</span>
                  <span className="text-[10px] text-[#6b3547] font-medium">{mat.category}</span>
                </div>
              </div>

              <div className="text-left font-mono">
                <span className="text-xs font-black text-[#5c2b3b] block">
                  {mat.pricePerGram} ل.س / غ
                </span>
                <span className="text-[10px] text-stone-400">
                  الكيلو: {formatCurrency(mat.pricePerGram * 1000)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recipe Pricing Comparison if available */}
      {recipeStats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xs border border-[#ebdcdc] space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#2c6e49]" />
              <span>مقارنة تكلفة القطعة وأسعار البيع المقترحة:</span>
            </h3>
            <button
              onClick={() => setActiveTab('recipes')}
              className="text-[11px] text-[#6b3547] font-bold hover:underline cursor-pointer"
            >
              قائمة الوصفات
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {recipeStats.computed.slice(0, 4).map(({ recipe, cost }) => (
              <div
                key={recipe.id}
                className="p-3 bg-[#faf7f5] rounded-2xl border border-[#ebdcdc] space-y-1.5"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-stone-900">{recipe.name}</span>
                  <span className="text-[10px] bg-[#f8f0f2] text-[#6b3547] px-2 py-0.5 rounded-full font-bold">
                    {recipe.yieldCount} {recipe.yieldUnit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200/60">
                  <span className="text-stone-500">تكلفة القطعة:</span>
                  <span className="font-bold font-mono text-stone-800">{formatCurrency(cost.costPerUnit)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#2c6e49] font-medium">سعر البيع المقترح:</span>
                  <span className="font-bold font-mono text-[#2c6e49]">{formatCurrency(cost.suggestedSalePricePerUnit)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sweet Studio Pro Tips Card */}
      <div className="bg-[#f8f0f2] border border-[#ebdcdc] rounded-3xl p-5 space-y-2.5">
        <h4 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#6b3547]" />
          <span>نصائح ذهبية لإدارة معمل الحلويات:</span>
          <Heart className="w-3.5 h-3.5 fill-[#e698ae] text-[#e698ae]" />
        </h4>
        <ul className="text-xs text-stone-700 space-y-2 pr-4 list-disc font-medium leading-relaxed">
          <li>
            <strong>تحديث أسعار المواد فور الشراء:</strong> عند تغير سعر السمنة أو الفستق أو الطحين في السوق السوري، قومي بتعديل السعر في صفحة الأسعار وسيتم تحديث تكلفة كل الوصفات فوراً!
          </li>
          <li>
            <strong>المحافظة على هامش الأمان التشغيلي:</strong> تأكدي من ضبط نسبة التكاليف التشغيلية (الغاز، الكهرباء، التغليف) بين 10% إلى 15% لتغطية الهدر والمصاريف.
          </li>
          <li>
            <strong>استخدام حاسبة الطلبيات:</strong> قبل قبول طلبيات المناسبات، استخدمي حاسبة الإنتاج لمعرفة كميات المواد المطلوبة بدقة والتأكد من تحقيق هامش الربح المطلوب.
          </li>
        </ul>
      </div>
    </div>
  );
};
