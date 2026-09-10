import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-azul-900 text-branco hover:bg-azul-800 focus-visible:outline-azul-900",
  gold: "bg-dourado-500 text-azul-950 hover:bg-dourado-600 focus-visible:outline-dourado-600",
  outline: "border border-azul-900/30 text-azul-900 hover:bg-azul-900/5 focus-visible:outline-azul-900",
  ghost: "text-azul-900 hover:bg-azul-900/5",
  danger: "bg-red-700 text-branco hover:bg-red-800 focus-visible:outline-red-700",
};

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", href, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer",
      variants[variant],
      sizes[size],
      className,
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {props.children as React.ReactNode}
        </Link>
      );
    }

    return <button ref={ref} className={classes} {...props} />;
  },
);
Button.displayName = "Button";
