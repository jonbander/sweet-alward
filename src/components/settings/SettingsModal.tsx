import React, { useRef, useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { 
  X, Download, Upload, RotateCcw, AlertTriangle, 
  Check, Settings, Info, Database, Heart 
} from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { 
    materials, 
    recipes, 
    exportBackupJson, 
    importBackupJson, 
    resetToDefaults 
  } = useWorkshop();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJson(content);
      if (success) {
        setStatusMessage({ type: 'success', text: 'تم استيراد النسخة الاحتياطية بنجاح!' });
      } else {
        setStatusMessage({ type: 'error', text: 'الملف غير صالح أو تالف، تأكدي من اختيار ملف JSON صحيح.' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    resetToDefaults();
    setShowConfirmReset(false);
    setStatusMessage({ type: 'success', text: 'تمت استعادة البيانات الافتراضية بنجاح!' });
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
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#ebdcdc] overflow-hidden max-h-[88vh] flex flex-col my-auto"
      >
        {/* Header - Fixed */}
        <div className="shrink-0 bg-[#6b3547] px-5 py-3.5 text-white flex items-center justify-between border-b border-[#5a2a3b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#844458] rounded-2xl">
              <Settings className="w-5 h-5 text-[#fcedf1]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>إعدادات المعمل والبيانات</span>
                <Heart className="w-3.5 h-3.5 text-[#e698ae] fill-[#e698ae]" />
              </h2>
              <p className="text-xs text-[#fae4eb]">النسخ الاحتياطي وإدارة البيانات</p>
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

        {/* Content - Smooth scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 touch-pan-y">
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-[#edf5f0] text-[#2c6e49] border border-[#cde2d5]'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-[#2c6e49] shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </motion.div>
          )}

          {/* Currency and Unit Info */}
          <div className="bg-[#faf5f6] border border-[#ebdcdc] p-3.5 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <Info className="w-4 h-4 text-[#6b3547]" />
              <span>معايير العمل الأساسية في التطبيق:</span>
            </div>
            <ul className="text-xs text-stone-700 pr-5 list-disc space-y-1 font-medium">
              <li>العملة المعتمدة: <strong>الليرة السورية (ل.س)</strong>.</li>
              <li>وحدة القياس المعتمدة للمكونات: <strong>الغرام (غ)</strong>.</li>
              <li>يتم حفظ جميع التعديلات تلقائياً في ذاكرة الهاتف.</li>
            </ul>
          </div>

          {/* Backup & Restore Section */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#6b3547]" />
              <span>النسخ الاحتياطي (نقل البيانات لجهاز آخر):</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportBackupJson}
                className="flex items-center justify-center gap-1.5 p-3 bg-[#faf7f5] hover:bg-[#f8f0f2] active:scale-95 border border-[#ebdcdc] rounded-2xl text-xs font-bold text-stone-800 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#6b3547]" />
                <span>تصدير نسخة (JSON)</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 p-3 bg-[#faf7f5] hover:bg-[#f8f0f2] active:scale-95 border border-[#ebdcdc] rounded-2xl text-xs font-bold text-stone-800 transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#6b3547]" />
                <span>استيراد نسخة (JSON)</span>
              </motion.button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <p className="text-[11px] text-stone-500">
              الحجم الحالي: {materials.length} مادة أولية، {recipes.length} وصفة مخزنة.
            </p>
          </div>

          {/* Reset to Default Data */}
          <div className="border-t border-stone-100 pt-3">
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full flex items-center justify-center gap-1.5 p-2.5 text-xs font-bold text-[#6b3547] bg-[#f8f0f2] hover:bg-[#ebdcdc] rounded-2xl border border-[#ebdcdc] transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>استعادة البيانات الافتراضية للمعلم</span>
              </button>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-red-700 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>تأكيد استعادة البيانات الافتراضية؟</span>
                </div>
                <p className="text-[11px] text-red-600 leading-relaxed">
                  سيتم استرجاع قائمة أسعار المواد والوصفات النموذجية. هل تريدين المتابعة؟
                </p>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition cursor-pointer"
                  >
                    نعم، استعادة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="shrink-0 bg-[#faf7f5] border-t border-[#ebdcdc] px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-[#6b3547] hover:bg-[#5a2a3b] text-white rounded-2xl shadow-xs transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
