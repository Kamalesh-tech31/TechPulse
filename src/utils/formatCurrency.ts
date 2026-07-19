/**
 * Shared currency formatter for Trado.
 * Always formats as ₹1,000,000.00 (international standard).
 * Never uses Indian lakh grouping (₹10,00,000).
 */
const rupeeFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a number as Indian Rupees with international comma grouping.
 * @example formatCurrency(1000000) → "₹1,000,000.00"
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '₹0.00';
  return '₹' + rupeeFormatter.format(value);
}

/**
 * Format a compact value (no decimals) for display in tight spaces.
 * @example formatCurrencyCompact(1000000) → "₹1,000,000"
 */
export function formatCurrencyCompact(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  return '₹' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}
