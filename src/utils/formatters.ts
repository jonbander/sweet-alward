import { Material, Recipe, RecipeCostBreakdown } from '../types';

/**
 * Format a number into Syrian Pounds string representation
 * e.g., 150000 -> 150,000 ل.س
 */
export function formatCurrency(amount: number, includeSymbol: boolean = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return includeSymbol ? '0 ل.س' : '0';
  }
  
  // Syrian pounds are typically whole numbers or 1 decimal if small
  const rounded = Math.round(amount * 10) / 10;
  const formatted = new Intl.NumberFormat('ar-SY', {
    maximumFractionDigits: amount < 100 && amount > 0 ? 2 : 0,
  }).format(rounded);

  return includeSymbol ? `${formatted} ل.س` : formatted;
}

/**
 * Format grams into clean readable Arabic label
 * e.g., 500 -> "500 غ", 2500 -> "2,500 غ (2.5 كغ)"
 */
export function formatWeight(grams: number, showKgEquivalent: boolean = false): string {
  if (isNaN(grams) || grams === null || grams === undefined) return '0 غ';
  const formattedGrams = new Intl.NumberFormat('ar-SY').format(Math.round(grams));
  
  if (showKgEquivalent && grams >= 1000) {
    const kg = (grams / 1000).toFixed(2).replace(/\.00$/, '');
    return `${formattedGrams} غ (${kg} كغ)`;
  }
  return `${formattedGrams} غ`;
}

/**
 * Compute price per gram for a material given price and quantity
 */
export function computePricePerGram(
  purchasePrice: number,
  quantity: number,
  unit: 'كغ' | 'غ'
): { totalGrams: number; pricePerGram: number } {
  const totalGrams = unit === 'كغ' ? quantity * 1000 : quantity;
  if (totalGrams <= 0 || purchasePrice <= 0) {
    return { totalGrams: totalGrams || 0, pricePerGram: 0 };
  }
  const pricePerGram = purchasePrice / totalGrams;
  return {
    totalGrams,
    pricePerGram,
  };
}

/**
 * Calculate full recipe cost breakdown given current materials list
 * Always syncs with latest price per gram from materials list if available!
 */
export function calculateRecipeCost(
  recipe: Recipe,
  materialsMap?: Map<string, Material>
): RecipeCostBreakdown {
  let rawIngredientsCost = 0;
  let totalWeightGrams = 0;

  recipe.ingredients.forEach((ing) => {
    // If we have live materialsMap, use current pricePerGram, else fallback to ingredient's saved costPerGram
    const currentMaterial = materialsMap?.get(ing.materialId);
    const rate = currentMaterial ? currentMaterial.pricePerGram : (ing.costPerGram || 0);
    const itemCost = ing.quantityGrams * rate;
    
    rawIngredientsCost += itemCost;
    totalWeightGrams += ing.quantityGrams;
  });

  const overheadCost = (rawIngredientsCost * (recipe.overheadPercentage || 0)) / 100;
  const fixedOverheadCost = recipe.fixedOverhead || 0;
  const totalRecipeCost = rawIngredientsCost + overheadCost + fixedOverheadCost;

  const yieldCount = recipe.yieldCount > 0 ? recipe.yieldCount : 1;
  const costPerUnit = totalRecipeCost / yieldCount;
  
  // Cost per 1 kg of finished dough/mix
  const costPerKg = totalWeightGrams > 0 ? (totalRecipeCost / totalWeightGrams) * 1000 : 0;

  // Margin calculation: Sale Price = Cost / (1 - Margin/100) or Cost * (1 + Margin/100)
  // In bakery markup, markup multiplier = Cost * (1 + margin / 100)
  const markupMultiplier = 1 + (recipe.targetMarginPercentage || 0) / 100;
  const suggestedSalePriceBatch = Math.round(totalRecipeCost * markupMultiplier);
  const suggestedSalePricePerUnit = Math.round(costPerUnit * markupMultiplier);
  const suggestedSalePricePerKg = totalWeightGrams > 0 ? Math.round(costPerKg * markupMultiplier) : 0;

  const profitBatch = suggestedSalePriceBatch - totalRecipeCost;
  const profitPerUnit = suggestedSalePricePerUnit - costPerUnit;
  const profitPerKg = suggestedSalePricePerKg - costPerKg;

  return {
    rawIngredientsCost,
    totalWeightGrams,
    overheadCost,
    fixedOverheadCost,
    totalRecipeCost,
    costPerUnit,
    costPerKg,
    suggestedSalePriceBatch,
    suggestedSalePricePerUnit,
    suggestedSalePricePerKg,
    profitBatch,
    profitPerUnit,
    profitPerKg,
  };
}

/**
 * Scale recipe ingredients for a custom batch target
 */
export function scaleRecipeIngredients(
  recipe: Recipe,
  targetCount: number,
  materialsMap: Map<string, Material>
) {
  const baseCount = recipe.yieldCount > 0 ? recipe.yieldCount : 1;
  const ratio = targetCount / baseCount;

  const scaledIngredients = recipe.ingredients.map((ing) => {
    const scaledGrams = Math.round(ing.quantityGrams * ratio * 10) / 10;
    const currentMaterial = materialsMap.get(ing.materialId);
    const rate = currentMaterial ? currentMaterial.pricePerGram : ing.costPerGram;
    const cost = scaledGrams * rate;

    return {
      materialId: ing.materialId,
      materialName: ing.materialName,
      baseGrams: ing.quantityGrams,
      scaledGrams,
      rate,
      cost,
    };
  });

  const totalRawCost = scaledIngredients.reduce((sum, item) => sum + item.cost, 0);
  const overhead = (totalRawCost * (recipe.overheadPercentage || 0)) / 100;
  const scaledFixed = (recipe.fixedOverhead || 0) * ratio;
  const totalCost = totalRawCost + overhead + scaledFixed;

  const markupMultiplier = 1 + (recipe.targetMarginPercentage || 0) / 100;
  const totalSale = Math.round(totalCost * markupMultiplier);
  const profit = totalSale - totalCost;

  const totalWeightGrams = scaledIngredients.reduce((sum, item) => sum + item.scaledGrams, 0);
  const costPerKg = totalWeightGrams > 0 ? (totalCost / totalWeightGrams) * 1000 : 0;
  const salePerKg = totalWeightGrams > 0 ? Math.round((totalSale / totalWeightGrams) * 1000) : 0;

  return {
    ratio,
    targetCount,
    scaledIngredients,
    totalWeightGrams,
    costPerKg,
    salePerKg,
    totalRawCost,
    overhead,
    scaledFixed,
    totalCost,
    totalSale,
    profit,
    costPerUnit: targetCount > 0 ? totalCost / targetCount : 0,
    salePerUnit: targetCount > 0 ? Math.round(totalSale / targetCount) : 0,
  };
}
