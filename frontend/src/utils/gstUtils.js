// Helper utilities for Category-Based Inclusive Indian GST Rules

export const CATEGORY_GST_RATES = {
  'Food': 5,
  'Grains': 5,
  'Groceries': 5,
  'Essentials': 5,
  'Dairy': 5,
  'Bakery': 5,
  'Apparel': 12,
  'Clothing': 12,
  'Footwear': 12,
  'Personal Care': 18,
  'Cleaning': 18,
  'Electronics': 18,
  'Beauty': 18,
  'Stationery': 18,
  'Hardware': 18,
  'Beverages': 28,
  'Luxury': 28,
  'Default': 18
};

/**
 * Returns the applicable Indian GST percentage rate for a product category
 * @param {string} category 
 * @returns {number} GST rate (5, 12, 18, 28)
 */
export const getGstRateForCategory = (category) => {
  if (!category) return CATEGORY_GST_RATES.Default;
  const matchKey = Object.keys(CATEGORY_GST_RATES).find(
    key => key.toLowerCase() === category.trim().toLowerCase()
  );
  return matchKey ? CATEGORY_GST_RATES[matchKey] : CATEGORY_GST_RATES.Default;
};

/**
 * Calculates the inclusive GST tax amount from a tax-inclusive price/subtotal
 * Formula: Tax = Taxable Amount * (Rate / (100 + Rate))
 * @param {number} totalInclusiveAmount 
 * @param {number} gstRate 
 * @returns {number} Rounded tax amount
 */
export const calculateInclusiveGst = (totalInclusiveAmount, gstRate = 18) => {
  if (!totalInclusiveAmount || totalInclusiveAmount <= 0) return 0;
  const tax = (totalInclusiveAmount * gstRate) / (100 + gstRate);
  return Math.round(tax * 100) / 100;
};

/**
 * Calculates detailed inclusive GST breakdown for a shopping cart
 * @param {Array} cartItems 
 * @param {number} discount 
 */
export const getCartGstBreakdown = (cartItems = [], discount = 0) => {
  if (!cartItems || cartItems.length === 0) {
    return { inclusiveTax: 0, primaryGstRate: 18, rateLabel: '18% GST (Incl.)', ratesUsed: [18] };
  }

  let totalSubtotal = 0;
  let totalInclusiveTax = 0;
  const ratesUsedSet = new Set();

  cartItems.forEach(item => {
    const rate = getGstRateForCategory(item.category);
    ratesUsedSet.add(rate);
    const itemSubtotal = (Number(item.sellingPrice) || 0) * (Number(item.quantity) || 1);
    totalSubtotal += itemSubtotal;
    totalInclusiveTax += calculateInclusiveGst(itemSubtotal, rate);
  });

  const taxableBase = Math.max(0, totalSubtotal - (Number(discount) || 0));
  // Pro-rate inclusive tax if discount is applied
  const ratio = totalSubtotal > 0 ? taxableBase / totalSubtotal : 1;
  const finalInclusiveTax = Math.round(totalInclusiveTax * ratio * 100) / 100;

  const ratesUsed = Array.from(ratesUsedSet).sort((a, b) => a - b);
  const primaryGstRate = ratesUsed.length === 1 ? ratesUsed[0] : 18;
  const rateLabel = ratesUsed.length === 1 
    ? `${ratesUsed[0]}% GST (Inclusive)`
    : `${ratesUsed.join('%, ')}% GST (Inclusive)`;

  return {
    inclusiveTax: finalInclusiveTax,
    primaryGstRate,
    rateLabel,
    ratesUsed
  };
};
