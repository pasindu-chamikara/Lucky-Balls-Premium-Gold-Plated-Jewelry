import * as React from "react";

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "default" | "outline" | "danger" | "rose" | "danger-outline" | "danger-ghost" | "rose-outline" | "rose-ghost" | "custom";
  size?: "default" | "sm" | "lg" | "icon";
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
      primary: "bg-[#E5C98F] text-zinc-900 hover:bg-[var(--accent-deep)] shadow-sm",
      secondary: "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-2)] shadow-sm",
      ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-2)]",
      default: "bg-[#E5C98F] text-zinc-900 hover:bg-[var(--accent-deep)]",
      outline: "border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--foreground)]",
      danger: "bg-red-500 text-zinc-100 hover:bg-red-600",
      rose: "bg-[var(--accent)] text-[var(--foreground)] hover:bg-[var(--accent-deep)] border border-[var(--accent)]",
      "danger-outline": "border border-red-200 bg-white hover:bg-red-50 text-red-600",
      "danger-ghost": "bg-transparent hover:bg-red-50 text-red-600",
      "rose-outline": "border border-[var(--accent)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--accent-deep)]",
      "rose-ghost": "bg-transparent hover:bg-[var(--surface-2)] text-[var(--accent-deep)]",
      custom: "",
    };
    const sizes = {
      default: "h-11 px-5 text-sm",
      sm: "h-9 px-4 text-sm",
      lg: "h-12 px-8 text-base",
      icon: "h-11 w-11",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, cn };
