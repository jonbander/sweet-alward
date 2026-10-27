import React, { useState, useMemo } from 'react';
import { Material, MaterialCategory } from '../../types';
import { useWorkshop } from '../../context/WorkshopContext';
import { formatCurrency } from '../../utils/formatters';
import { 
  Search, Plus, Tag, Edit3, Trash2, ArrowUpDown, 
  AlertCircle 
} from 'lucide-react';
import { MaterialModal } from './MaterialModal';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES: ('الكل' | MaterialCategory)[] = [
  'الكل',
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

export const MaterialList: React.FC = () => {
  const { materials, deleteMaterial, setActiveTab } = useWorkshop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'الكل' | MaterialCategory>('الكل');
  const [sortBy, setSortBy] = useState<'date' | 'priceAsc' | 'priceDesc' | 'name'>('priceDesc');
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);

  // Filter and sort
  const filteredMaterials = useMemo(() => {
    return materials
      .filter((mat) => {
        const matchesCategory = selectedCategory === 'الكل' || mat.category === selectedCategory;
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery = !query || 
          mat.name.toLowerCase().includes(query) ||
          (mat.supplier && mat.supplier.toLowerCase().includes(query)) ||
          (mat.notes && mat.notes.toLowerCase().includes(query));
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'priceDesc') return b.pricePerGram - a.pricePerGram;
        if (sortBy === 'priceAsc') return a.pricePerGram - b.pricePerGram;
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [materials, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-4">
      {/* Search and Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-4 shadow-2xs border border-[#ebdcdc] space-y-3"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute right-4 top-3.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحثي عن مادة أولية (فستق، سمنة، طحين، سكر، قشطة...)"
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
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = cat === 'الكل'
              ? materials.length
              : materials.filter((m) => m.category === cat).length;

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

        {/* Sort & Quick info row */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-[#6b3547]">{filteredMaterials.length}</span>
            <span>مادة مسجلة في قائمة الأسعار</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-[#6b3547] focus:outline-none cursor-pointer"
            >
              <option value="priceDesc">سعر الغرام: الأعلى أولاً</option>
              <option value="priceAsc">سعر الغرام: الأقل أولاً</option>
              <option value="name">الاسم أبجدياً</option>
              <option value="date">تاريخ آخر تعديل</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 text-center border border-dashed border-[#ebdcdc] space-y-3"
        >
          <div className="w-14 h-14 bg-[#f8f0f2] text-[#6b3547] rounded-full flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-800">لا توجد مواد مطابقة</h3>
            <p className="text-xs text-stone-500 mt-1">
              {searchQuery ? 'جربي البحث بكلمة أخرى' : 'ابدئي بإضافة المواد الأولية وأسعارها بالليرة السورية'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#6b3547] hover:bg-[#5a2a3b] text-white rounded-2xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول مادة</span>
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <AnimatePresence>
            {filteredMaterials.map((material, idx) => {
              return (
                <motion.div
                  layout
                  key={material.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="bg-white rounded-3xl p-4 border border-[#ebdcdc] shadow-2xs hover:shadow-md hover:border-[#dabec5] transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Bar: Name and Category */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#6b3547] bg-[#f8f0f2] px-2.5 py-0.5 rounded-full border border-[#eddfe2] inline-block mb-1">
                          {material.category}
                        </span>
                        <h4 className="text-sm font-black text-stone-900 group-hover:text-[#6b3547] transition leading-snug">
                          {material.name}
                        </h4>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingMaterial(material)}
                          className="p-2 text-stone-400 hover:text-[#6b3547] hover:bg-[#f8f0f2] rounded-xl transition cursor-pointer"
                          title="تعديل السعر"
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setMaterialToDelete(material)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Prominent Price Per Gram Box */}
                    <div className="mt-3 p-3 bg-[#faf5f6] rounded-2xl border border-[#eedfe2] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 block">سعر الغرام الواحد:</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xl font-black text-[#5c2b3b] font-mono">
                            {material.pricePerGram < 1
                              ? material.pricePerGram.toFixed(3)
                              : material.pricePerGram < 10
                              ? material.pricePerGram.toFixed(2)
                              : Math.round(material.pricePerGram * 10) / 10}
                          </span>
                          <span className="text-xs font-bold text-[#844458]">ل.س / غ</span>
                        </div>
                      </div>

                      <div className="text-left text-[11px] text-stone-500 border-r border-[#ebdcdc] pr-3">
                        <span className="block text-[10px] text-stone-400">سعر الكيلو (1000 غ):</span>
                        <span className="font-black text-stone-800 font-mono">
                          {formatCurrency(material.pricePerGram * 1000)}
                        </span>
                      </div>
                    </div>

                    {/* Purchase details badge */}
                    <div className="mt-2 text-xs text-stone-500 flex items-center justify-between">
                      <span>
                        شراء:{' '}
                        <strong className="text-stone-800 font-bold">
                          {material.purchaseQuantity} {material.purchaseUnit}
                        </strong>{' '}
                        بسعر{' '}
                        <strong className="text-[#6b3547] font-bold">
                          {formatCurrency(material.purchasePrice)}
                        </strong>
                      </span>
                      {material.supplier && (
                        <span className="text-[11px] text-stone-400 truncate max-w-[120px]" title={material.supplier}>
                          {material.supplier}
                        </span>
                      )}
                    </div>

                    {/* Notes if any */}
                    {material.notes && (
                      <p className="mt-1.5 text-[11px] text-stone-500 bg-[#faf7f5] p-2 rounded-xl border border-[#ebdcdc] italic">
                        {material.notes}
                      </p>
                    )}
                  </div>

                  {/* Footer date */}
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                    <span>
                      آخر تحديث: {new Date(material.updatedAt).toLocaleDateString('ar-SY')}
                    </span>
                    <button
                      onClick={() => setActiveTab('recipes')}
                      className="text-[#6b3547] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>استخدمي في وصفة</span>
                      <span>←</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Floating Add Button for Mobile - positioned safely above fixed bottom nav */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-20 left-4 z-40 flex items-center gap-2 bg-[#6b3547] hover:bg-[#5a2a3b] text-white font-bold px-4 py-3 rounded-full shadow-lg border border-white/30 transition sm:hidden cursor-pointer"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span className="text-xs">إضافة مادة</span>
      </motion.button>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {(isAddModalOpen || editingMaterial) && (
          <MaterialModal
            materialToEdit={editingMaterial}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingMaterial(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {materialToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 border border-[#ebdcdc] shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-500">
                <div className="p-2.5 bg-red-50 rounded-2xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-stone-900">تأكيد حذف المادة</h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                هل أنتِ متأكدة من حذف <strong>"{materialToDelete.name}"</strong>؟ قد يؤثر ذلك على الوصفات المرتبطة بها.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setMaterialToDelete(null)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    deleteMaterial(materialToDelete.id);
                    setMaterialToDelete(null);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                >
                  نعم، احذف المادة
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
