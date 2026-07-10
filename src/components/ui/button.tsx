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
      primary: "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm",
      secondary: "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 shadow-sm",
      ghost: "bg-transparent text-zinc-700 hover:bg-zinc-100",
      default: "bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
      outline: "border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-900",
      danger: "bg-red-500 text-zinc-100 hover:bg-red-600",
      rose: "bg-rose-500 text-white hover:bg-rose-600 border border-rose-500/50",
      "danger-outline": "border border-red-200 bg-white hover:bg-red-50 text-red-600",
      "danger-ghost": "bg-transparent hover:bg-red-50 text-red-600",
      "rose-outline": "border border-rose-200 bg-white hover:bg-rose-50 text-rose-600",
      "rose-ghost": "bg-transparent hover:bg-rose-50 text-rose-600",
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
