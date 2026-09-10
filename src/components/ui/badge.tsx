import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-bege-100 text-preto/70",
  azul: "bg-azul-900/10 text-azul-900",
  dourado: "bg-dourado-500/15 text-dourado-700",
  verde: "bg-emerald-100 text-emerald-800",
  vermelho: "bg-red-100 text-red-800",
  amarelo: "bg-amber-100 text-amber-800",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
