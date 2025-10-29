"use client";

import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Tiny `cn` helper. If you already have `@/utils/cn`, remove this and import it instead:
 * import { cn } from "@/utils/cn";
 */
function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  loading?: boolean;
}

/**
 * Named export `Button` so existing imports remain valid:
 * import { Button } from "../../components/ui/button";
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      loading = false,
      disabled,
      children,
      ...rest
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none cursor-pointer";

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      default:
        "bg-[#FFD600] text-[#0a2342] hover:bg-[#FFEA70] focus:ring-[#FFD600]",
      outline:
        "border border-[#E5E7EB] bg-white text-[#0a2342] hover:bg-[#F8F9FA] focus:ring-[#0a2342]",
      ghost:
        "bg-transparent text-[#0a2342] hover:bg-[#00000008] focus:ring-[#0a2342]",
    };

    const classes = cn(base, variants[variant], className);

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        type={rest.type ?? "button"}
        {...rest}
      >
        {loading && (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
