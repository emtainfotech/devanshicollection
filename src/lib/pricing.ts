// Prices are stored in INR in the database.
export const USD_TO_INR = 1;
export const GST_RATE = 0.18;

// Defaults (will be overridden by dynamic rules if implemented)
export let SHIPPING_FLAT_INR = 100;
export let SHIPPING_FREE_THRESHOLD_INR = 4999;

export const setShippingRules = (flat: number, threshold: number) => {
  SHIPPING_FLAT_INR = flat;
  SHIPPING_FREE_THRESHOLD_INR = threshold;
};

export const toINRValue = (value: number) => value * USD_TO_INR;

export const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const getDiscountedBase = (price: number, discount = 0) => price * (1 - discount / 100);

export const getShippingINR = (subtotalINR: number) =>
  subtotalINR >= SHIPPING_FREE_THRESHOLD_INR ? 0 : SHIPPING_FLAT_INR;
