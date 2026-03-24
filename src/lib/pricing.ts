export const USD_TO_INR = 83;
export const GST_RATE = 0.18;
export const SHIPPING_FLAT_INR = 99;
export const SHIPPING_FREE_THRESHOLD_INR = 4999;

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
