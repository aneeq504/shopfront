export function formatPrice(cents: number): string {
  return `Rs. ${(cents / 100).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
