export type MaterialCategory = 
  | 'مكسرات'
  | 'سمن وزيوت'
  | 'دقيق ونشا وسميد'
  | 'سكريات ومحليات'
  | 'ألبان وأجبان'
  | 'نكهات ومطيبات'
  | 'شوكولا وحشوات'
  | 'تغليف ولوازم'
  | 'أخرى';

export interface Material {
  id: string;
  name: string; // اسم المادة
  category: MaterialCategory; // التصنيف
  purchasePrice: number; // سعر الشراء الإجمالي بالليرة السورية
  purchaseQuantity: number; // كمية الشراء (مثلاً 1 كغ، 25 كغ، 500 غ)
  purchaseUnit: 'كغ' | 'غ'; // وحدة الشراء المدخلة
  totalGrams: number; // إجمالي الكمية بالغرام
  pricePerGram: number; // السعر المحسوب للغرام الواحد بالليرة السورية
  supplier?: string; // المورد أو الشركة
  notes?: string; // ملاحظات
  updatedAt: string; // تاريخ آخر تحديث
}

export interface RecipeIngredient {
  materialId: string; // معرف المادة من صفحة الأسعار
  materialName: string; // اسم المادة وقت الإضافة
  quantityGrams: number; // الكمية المطلوبة بالغرام
  costPerGram: number; // سعر الغرام (يؤخذ آلياً من المادة)
  totalCost: number; // التكلفة الإجمالية للمكون = الكمية × سعر الغرام
}

export type RecipeCategory = 
  | 'معمول وبرازق'
  | 'حلويات شرقية وقشطة'
  | 'بقلاوة ونواشف'
  | 'كيك وكاتو'
  | 'غربية وبيتي فور'
  | 'أخرى';

export interface Recipe {
  id: string;
  name: string; // اسم الوصفة (مثلاً معمول بالفستق الحلبي)
  category: RecipeCategory; // تصنيف الوصفة
  yieldCount: number; // عدد الحصص أو القطع الناتجة (مثلاً 50 قطعة)
  yieldUnit: string; // وحدة الناتج (قطعة، حبة، صينية، قالب، كغ)
  ingredients: RecipeIngredient[]; // قائمة المكونات المأخوذة من صفحة الأسعار
  overheadPercentage: number; // نسبة التكاليف التشغيلية (غاز، كهرباء، عمالة) مثلاً 10%
  fixedOverhead: number; // تكاليف ثابتة إضافية (تغليف، كرتون) بالليرة السورية
  targetMarginPercentage: number; // هامش الربح المستهدف (مثلاً 40%)
  preparationTimeMinutes?: number; // وقت التحضير بالدقائق
  instructions?: string; // طريقة التحضير وملاحظات الشيف
  createdAt: string;
  updatedAt: string;
}

export interface RecipeCostBreakdown {
  rawIngredientsCost: number; // تكلفة المواد الأولية
  totalWeightGrams: number; // إجمالي وزن المواد بالغرام
  overheadCost: number; // قيمة التكاليف التشغيلية
  fixedOverheadCost: number; // قيمة التكاليف الثابتة
  totalRecipeCost: number; // إجمالي تكلفة الوصفة بالليرة السورية
  costPerUnit: number; // تكلفة القطعة / الحصة الواحدة
  costPerKg: number; // تكلفة الكيلوغرام الواحد
  suggestedSalePriceBatch: number; // سعر البيع المقترح للوجبة بالكامل
  suggestedSalePricePerUnit: number; // سعر البيع المقترح للقطعة الواحدة
  suggestedSalePricePerKg: number; // سعر البيع المقترح للكيلوغرام الواحد
  profitBatch: number; // صافي الربح المتوقع للوجبة
  profitPerUnit: number; // صافي الربح المتوقع للقطعة
  profitPerKg: number; // صافي الربح المتوقع للكيلوغرام الواحد
}
