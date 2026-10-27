import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { Tag, BookOpen, Calculator, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, materials, recipes } = useWorkshop();

  const navItems = [
    {
      id: 'materials' as const,
      label: 'الأسعار والمواد',
      icon: Tag,
      badge: materials.length,
    },
    {
      id: 'recipes' as const,
      label: 'الوصفات والتكاليف',
      icon: BookOpen,
      badge: recipes.length,
    },
    {
      id: 'orders' as const,
      label: 'حاسبة الإنتاج',
      icon: Calculator,
      badge: null,
    },
    {
      id: 'dashboard' as const,
      label: 'الاستوديو',
      icon: Sparkles,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#ebdcdc] shadow-[0_-3px_15px_rgba(46,38,41,0.05)] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 px-1.5 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center justify-center py-0.5 px-0.5 rounded-xl transition cursor-pointer select-none group"
            >
              {/* Smooth active background pill */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#f7edf0] rounded-xl border border-[#ecdbe0] shadow-2xs"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <motion.div
                    animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`p-1 rounded-lg transition-colors ${
                      isActive ? 'text-[#75384c]' : 'text-stone-400 group-hover:text-[#75384c]/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  </motion.div>

                  {item.badge !== null && (
                    <span className="absolute -top-0.5 -right-1 text-[9px] min-w-3.5 h-3.5 px-0.5 flex items-center justify-center font-bold bg-[#844458] text-white rounded-full border border-white shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] mt-0.5 tracking-tight leading-none transition-colors ${
                    isActive ? 'font-black text-[#5c2b3b]' : 'font-medium text-stone-500 group-hover:text-[#75384c]'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
