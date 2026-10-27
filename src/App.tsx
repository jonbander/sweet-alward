/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkshopProvider, useWorkshop } from './context/WorkshopContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MaterialList } from './components/materials/MaterialList';
import { RecipeList } from './components/recipes/RecipeList';
import { OrderCalculator } from './components/orders/OrderCalculator';
import { Dashboard } from './components/dashboard/Dashboard';
import { MaterialModal } from './components/materials/MaterialModal';
import { RecipeModal } from './components/recipes/RecipeModal';
import { Smartphone, Monitor, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function MainApp() {
  const { activeTab } = useWorkshop();
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf7f5] text-[#2e2629] flex flex-col justify-between selection:bg-[#c27b8f] selection:text-white">
      {/* Desktop view switcher (hidden on mobile, useful on desktop) */}
      <div className="hidden lg:flex items-center justify-between px-5 py-2 bg-[#422530] text-[#f2e6ea] text-xs border-b border-[#5a3341] shadow-xs">
        <div className="flex items-center gap-2 font-medium">
          <Heart className="w-3.5 h-3.5 text-[#e698ae] fill-[#e698ae]" />
          <span>شيف الحلويات | استوديو التكاليف والأسعار | الليرة السورية (ل.س) | الغرام (غ)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
              isPhoneFrame
                ? 'bg-[#844458] text-white font-bold shadow-xs'
                : 'hover:bg-white/10 text-stone-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>عرض إطار الهاتف</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
              !isPhoneFrame
                ? 'bg-[#844458] text-white font-bold shadow-xs'
                : 'hover:bg-white/10 text-stone-300'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>عرض المتصفح الكامل</span>
          </button>
        </div>
      </div>

      {/* Main Container - note: NO backdrop-blur or transform here to ensure position:fixed works perfectly */}
      <div
        className={`w-full mx-auto flex-1 flex flex-col transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-md my-4 rounded-[36px] shadow-xl border-4 border-stone-800 bg-white relative'
            : 'max-w-3xl bg-white min-h-screen relative shadow-xs border-x border-[#f0e4e7]'
        }`}
      >
        {/* Header */}
        <Header
          onOpenAddMaterial={() => setIsAddMaterialOpen(true)}
          onOpenAddRecipe={() => setIsAddRecipeOpen(true)}
        />

        {/* Content Area with bottom padding so content never hides behind fixed bottom bar */}
        <main className="flex-1 p-3.5 sm:p-5 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeTab === 'materials' && <MaterialList />}
              {activeTab === 'recipes' && <RecipeList />}
              {activeTab === 'orders' && <OrderCalculator />}
              {activeTab === 'dashboard' && (
                <Dashboard
                  onOpenAddMaterial={() => setIsAddMaterialOpen(true)}
                  onOpenAddRecipe={() => setIsAddRecipeOpen(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Navigation - Fixed at root level to guarantee it's always visible at the bottom of the viewport */}
      <BottomNav />

      {/* Add Material Modal */}
      <AnimatePresence>
        {isAddMaterialOpen && (
          <MaterialModal
            onClose={() => setIsAddMaterialOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Add Recipe Modal */}
      <AnimatePresence>
        {isAddRecipeOpen && (
          <RecipeModal
            onClose={() => setIsAddRecipeOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <WorkshopProvider>
      <MainApp />
    </WorkshopProvider>
  );
}
