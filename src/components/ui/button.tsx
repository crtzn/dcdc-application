import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Enhanced button variants with explicit color values as fallbacks
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 bg-[#000000] text-[#ffffff] hover:bg-[#333333]",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 bg-[#ef4444] hover:bg-[#dc2626]",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border-[#e5e5e5] bg-[#ffffff] hover:bg-[#f5f5f5]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 bg-[#f5f5f5] text-[#000000] hover:bg-[#e5e5e5]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 hover:bg-[#f5f5f5]",
        link: "text-primary underline-offset-4 hover:underline text-[#000000]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  style,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  // Fallback inline styles based on variant
  const getFallbackStyles = () => {
    const baseStyles = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "6px",
      fontFamily: "'Poppins', system-ui, sans-serif",
      fontSize: "14px",
      fontWeight: 500,
      transition: "all 0.2s ease",
    };

    const variantStyles = {
      default: {
        backgroundColor: "#000000",
        color: "#ffffff",
        border: "1px solid transparent",
      },
      destructive: {
        backgroundColor: "#ef4444",
        color: "#ffffff",
        border: "1px solid transparent",
      },
      outline: {
        backgroundColor: "#ffffff",
        color: "#000000",
        border: "1px solid #e5e5e5",
      },
      secondary: {
        backgroundColor: "#f5f5f5",
        color: "#000000",
        border: "1px solid transparent",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "#000000",
        border: "1px solid transparent",
      },
      link: {
        backgroundColor: "transparent",
        color: "#000000",
        border: "none",
        textDecoration: "underline",
      },
    };

    const sizeStyles = {
      default: {
        height: "36px",
        padding: "0 16px",
      },
      sm: {
        height: "32px",
        padding: "0 12px",
      },
      lg: {
        height: "40px",
        padding: "0 24px",
      },
      icon: {
        height: "36px",
        width: "36px",
        padding: "0",
      },
    };

    return {
      ...baseStyles,
      ...variantStyles[variant as keyof typeof variantStyles],
      ...sizeStyles[size as keyof typeof sizeStyles],
    };
  };

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      // Apply fallback inline styles that will be used if CSS fails to load
      style={{ ...getFallbackStyles(), ...style }}
      {...props}
    />
  );
}

export { Button, buttonVariants };
