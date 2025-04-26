import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { formatNumber, parseFormattedNumber } from "@/lib/utils";

interface FormattedNumberInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> {
  value: number | undefined | null;
  onChange: (value: number | undefined) => void;
  decimalPlaces?: number;
  allowNegative?: boolean;
  placeholder?: string;
}

/**
 * A custom input component for numbers that:
 * 1. Displays formatted numbers with commas (e.g., 1,000.00)
 * 2. Allows clearing the input completely
 * 3. Properly handles the conversion between formatted strings and numbers
 */
export function FormattedNumberInput({
  value,
  onChange,
  decimalPlaces = 2,
  allowNegative = false,
  placeholder = "0.00",
  ...props
}: FormattedNumberInputProps) {
  // State to track the displayed formatted value
  const [displayValue, setDisplayValue] = useState<string>("");
  // State to track if the input is being edited
  const [isEditing, setIsEditing] = useState(false);

  // Update the displayed value when the actual value changes
  // (but only if we're not currently editing)
  useEffect(() => {
    if (!isEditing && (value !== undefined && value !== null)) {
      setDisplayValue(formatNumber(value, decimalPlaces));
    } else if (!isEditing && (value === undefined || value === null)) {
      setDisplayValue("");
    }
  }, [value, decimalPlaces, isEditing]);

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    
    // When blurring, format the current value
    if (displayValue) {
      const parsedValue = parseFormattedNumber(displayValue);
      if (parsedValue !== undefined) {
        setDisplayValue(formatNumber(parsedValue, decimalPlaces));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input for clearing
    if (!inputValue) {
      setDisplayValue("");
      onChange(undefined);
      return;
    }
    
    // For non-empty input, validate and parse
    // Only allow digits, commas, decimal point, and optionally a negative sign
    const regex = allowNegative 
      ? /^-?[\d,]*\.?\d*$/ 
      : /^[\d,]*\.?\d*$/;
      
    if (regex.test(inputValue)) {
      setDisplayValue(inputValue);
      const parsedValue = parseFormattedNumber(inputValue);
      onChange(parsedValue);
    }
  };

  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
}
