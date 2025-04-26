import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency with commas and optional decimal places
 * @param value The number to format
 * @param decimalPlaces Number of decimal places to show (default: 2)
 * @returns Formatted string with commas (e.g., 1,000.00)
 */
export function formatNumber(
  value: number | undefined | null,
  decimalPlaces: number = 2
): string {
  if (value === undefined || value === null) return "";

  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

/**
 * Parse a formatted number string back to a number
 * @param value The formatted string (e.g., "1,000.00")
 * @returns The parsed number or undefined if invalid
 */
export function parseFormattedNumber(value: string): number | undefined {
  if (!value) return undefined;

  // Remove all non-numeric characters except decimal point
  const cleanValue = value.replace(/[^\d.-]/g, "");
  const parsedValue = parseFloat(cleanValue);

  return isNaN(parsedValue) ? undefined : parsedValue;
}
