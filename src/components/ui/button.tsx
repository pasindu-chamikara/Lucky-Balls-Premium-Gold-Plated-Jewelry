import * as React from "react";

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "default" | "outline" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2";
    const variants = {
      primary: "bg-rose-600 text-white hover:bg-rose-700",
      secondary: "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
      ghost: "bg-transparent text-zinc-700 hover:bg-zinc-100",
      default: "bg-zinc-900 text-white hover:bg-zinc-800",
      outline: "border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-900",
      danger: "bg-red-500 text-white hover:bg-red-600",
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
