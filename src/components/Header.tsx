import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { Sparkles, Plus, Settings, Heart, Cake } from 'lucide-react';
import { SettingsModal } from './settings/SettingsModal';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onOpenAddMaterial: () => void;
  onOpenAddRecipe: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddMaterial, onOpenAddRecipe }) => {
  const { activeTab } = useWorkshop();
  const [showSettings, setShowSettings] = useState(false);

  const getTitle = () => {
    switch (activeTab) {
      case 'materials':
        return { title: 'قائمة أسعار المواد', subtitle: 'تسعير الغرام بالليرة السورية' };
      case 'recipes':
        return { title: 'الوصفات وحساب التكاليف', subtitle: 'دقة المقادير وهوامش الأرباح' };
      case 'orders':
        return { title: 'حاسبة إنتاج الطلبيات', subtitle: 'مضاعفة الكميات للورشة والزبائن' };
      case 'dashboard':
        return { title: 'استوديو الحلويات', subtitle: 'لوحة التحكم ومراقبة التكاليف' };
      default:
        return { title: 'شيف الحلويات', subtitle: 'إدارة التكاليف والأسعار' };
    }
  };

  const { title, subtitle } = getTitle();

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#6b3547] text-white shadow-xs border-b border-[#5a2a3b]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-2xl bg-[#844458] flex items-center justify-center text-white border border-[#9d556c]"
            >
              <Cake className="w-5 h-5 text-[#fcedf1]" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <motion.h1
                  key={title}
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5"
                >
                  <span>{title}</span>
                  <Heart className="w-3.5 h-3.5 text-[#e698ae] fill-[#e698ae] inline" />
                </motion.h1>
                <span className="text-[10px] font-bold bg-[#844458] text-[#faeef2] px-2 py-0.5 rounded-full border border-[#9d556c]">
                  ل.س / غ
                </span>
              </div>
              <motion.p
                key={subtitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-[#fae4eb] font-medium"
              >
                {subtitle}
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {activeTab === 'materials' && (
                <motion.button
                  key="add-mat-btn"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={onOpenAddMaterial}
                  className="flex items-center gap-1.5 bg-white text-[#6b3547] hover:bg-[#faf4f6] font-extrabold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>إضافة مادة</span>
                </motion.button>
              )}

              {activeTab === 'recipes' && (
                <motion.button
                  key="add-rec-btn"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={onOpenAddRecipe}
                  className="flex items-center gap-1.5 bg-white text-[#6b3547] hover:bg-[#faf4f6] font-extrabold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>وصفة جديدة</span>
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ rotate: 45, scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl text-[#fae4eb] hover:text-white hover:bg-[#844458] transition cursor-pointer"
              title="إعدادات ونسخ احتياطي"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </>
  );
};
