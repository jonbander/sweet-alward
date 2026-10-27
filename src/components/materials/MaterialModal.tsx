import React, { useState } from 'react';
import { Material, MaterialCategory } from '../../types';
import { useWorkshop } from '../../context/WorkshopContext';
import { formatCurrency } from '../../utils/formatters';
import { X, Check, Calculator, Sparkles, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface MaterialModalProps {
  materialToEdit?: Material | null;
  onClose: () => void;
}

const CATEGORIES: MaterialCategory[] = [
  'مكسرات',
  'سمن وزيوت',
  'دقيق ونشا وسميد',
  'سكريات ومحليات',
  'ألبان وأجبان',
  'نكهات ومطيبات',
  'شوكولا وحشوات',
  'تغليف ولوازم',
  'أخرى',
];

export const MaterialModal: React.FC<MaterialModalProps> = ({ materialToEdit, onClose }) => {
  const { addMaterial, updateMaterial } = useWorkshop();

  const [name, setName] = useState(materialToEdit?.name || '');
  const [category, setCategory] = useState<MaterialCategory>(materialToEdit?.category || 'مكسرات');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(materialToEdit?.purchasePrice || '');
  const [purchaseQuantity, setPurchaseQuantity] = useState<number | ''>(materialToEdit?.purchaseQuantity || 1);
  const [purchaseUnit, setPurchaseUnit] = useState<'كغ' | 'غ'>(materialToEdit?.purchaseUnit || 'كغ');
  const [supplier, setSupplier] = useState(materialToEdit?.supplier || '');
  const [notes, setNotes] = useState(materialToEdit?.notes || '');
  const [error, setError] = useState('');

  // Live calculation of price per gram
  const numPrice = typeof purchasePrice === 'number' ? purchasePrice : 0;
  const numQty = typeof purchaseQuantity === 'number' ? purchaseQuantity : 0;
  const totalGrams = purchaseUnit === 'كغ' ? numQty * 1000 : numQty;
  const calculatedPricePerGram = totalGrams > 0 && numPrice > 0 ? numPrice / totalGrams : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة اسم المادة الأولية');
      return;
    }
    if (!numPrice || numPrice <= 0) {
      setError('يرجى إدخال سعر الشراء بالليرة السورية');
      return;
    }
    if (!numQty || numQty <= 0) {
      setError('يرجى إدخال كمية الشراء');
      return;
    }

    if (materialToEdit) {
      updateMaterial(materialToEdit.id, {
        name: name.trim(),
        category,
        purchasePrice: numPrice,
        purchaseQuantity: numQty,
        purchaseUnit,
        supplier: supplier.trim(),
        notes: notes.trim(),
      });
    } else {
      addMaterial({
        name: name.trim(),
        category,
        purchasePrice: numPrice,
        purchaseQuantity: numQty,
        purchaseUnit,
        supplier: supplier.trim(),
        notes: notes.trim(),
      });
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
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#ebdcdc] overflow-hidden max-h-[88vh] flex flex-col my-auto"
      >
        {/* Header - Fixed at Top */}
        <div className="shrink-0 bg-[#6b3547] px-5 py-3.5 text-white flex items-center justify-between border-b border-[#5a2a3b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#844458] rounded-2xl">
              <Calculator className="w-5 h-5 text-[#fcedf1]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>{materialToEdit ? 'تعديل بيانات المادة' : 'إضافة مادة أولية جديدة'}</span>
                <Heart className="w-3.5 h-3.5 fill-[#e698ae] text-[#e698ae]" />
              </h2>
              <p className="text-xs text-[#fae4eb]">
                تسجيل السعر وحساب تكلفة الغرام الواحد تلقائياً
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

        {/* Scrollable Form Body - Smooth scrolling for any screen height */}
        <form
          id="material-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 touch-pan-y"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              اسم المادة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="مثال: فستق حلبي مفروم، سمن بلدي حماوي، طحين زيرو..."
              className="w-full px-4 py-2.5 text-sm bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40 font-medium transition"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              التصنيف
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-xl transition font-medium cursor-pointer ${
                    category === cat
                      ? 'bg-[#6b3547] text-white shadow-2xs font-bold'
                      : 'bg-[#faf5f6] text-stone-700 hover:bg-[#ebdcdc] border border-[#ebdcdc]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Quantity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Purchase Price */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                سعر الشراء الإجمالي (ل.س) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={purchasePrice}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                    setPurchasePrice(val);
                    setError('');
                  }}
                  placeholder="مثال: 240000"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40 font-semibold transition"
                  required
                />
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-stone-400 pointer-events-none">
                  ل.س
                </span>
              </div>
            </div>

            {/* Quantity and Unit */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                الكمية المشتراة <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={purchaseQuantity}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                    setPurchaseQuantity(val);
                    setError('');
                  }}
                  placeholder="مثال: 1 أو 25"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40 font-semibold transition"
                  required
                />
                <div className="flex bg-[#f2e8ea] p-1 rounded-2xl border border-[#ebdcdc] shrink-0">
                  <button
                    type="button"
                    onClick={() => setPurchaseUnit('كغ')}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                      purchaseUnit === 'كغ'
                        ? 'bg-[#6b3547] text-white shadow-2xs'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    كغ
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurchaseUnit('غ')}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                      purchaseUnit === 'غ'
                        ? 'bg-[#6b3547] text-white shadow-2xs'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    غرام
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Automatic Calculation Highlight Box */}
          <div className="p-4 bg-[#faf5f6] border border-[#ebdcdc] rounded-2xl">
            <div className="flex items-center justify-between text-xs text-[#5c2b3b]">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#844458]" />
                الحساب التلقائي لسعر الغرام الواحد:
              </span>
              <span className="text-stone-500 text-[11px] font-medium">
                {totalGrams > 0 ? `إجمالي: ${new Intl.NumberFormat('ar-SY').format(totalGrams)} غ` : ''}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs text-stone-600 font-medium">سعر الغرام (ل.س / غ):</span>
              <div className="text-right">
                <span className="text-2xl font-black text-[#5c2b3b] font-mono">
                  {calculatedPricePerGram > 0
                    ? calculatedPricePerGram < 1
                      ? calculatedPricePerGram.toFixed(3)
                      : calculatedPricePerGram < 10
                      ? calculatedPricePerGram.toFixed(2)
                      : Math.round(calculatedPricePerGram * 10) / 10
                    : '0'}
                </span>
                <span className="text-xs font-bold text-[#844458] mr-1.5">ليرة سورية / غ</span>
              </div>
            </div>
            {calculatedPricePerGram > 0 && (
              <p className="text-[11px] text-stone-600 mt-1.5 border-t border-[#ebdcdc] pt-1.5">
                أي أن سعر كل 100 غرام = <strong>{formatCurrency(calculatedPricePerGram * 100)}</strong> ، والكيلوغرام = <strong>{formatCurrency(calculatedPricePerGram * 1000)}</strong>
              </p>
            )}
          </div>

          {/* Supplier & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                المورد / المحل (اختياري)
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="سوق البزورية، شركة مطاحن..."
                className="w-full px-3.5 py-2 text-xs bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                ملاحظات الجودة / الماركة
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="حبة كاملة، نخب أول، تخزين مبرد..."
                className="w-full px-3.5 py-2 text-xs bg-[#faf7f5] border border-[#ebdcdc] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#844458]/40"
              />
            </div>
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
            form="material-form"
            className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold bg-[#6b3547] hover:bg-[#5a2a3b] text-white rounded-2xl shadow-xs transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{materialToEdit ? 'حفظ التعديلات' : 'إضافة المادة'}</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
