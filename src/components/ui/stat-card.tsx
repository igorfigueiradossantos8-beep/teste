import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "azul",
  hint,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: "azul" | "dourado" | "vermelho" | "verde";
  hint?: string;
}) {
  const toneClasses = {
    azul: "bg-azul-900 text-dourado-400",
    dourado: "bg-dourado-500 text-azul-950",
    vermelho: "bg-red-700 text-branco",
    verde: "bg-emerald-700 text-branco",
  }[tone];

  return (
    <div className="rounded-xl border border-bege-200 bg-branco p-5 shadow-sm shadow-azul-950/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-preto/50">{label}</p>
          <p className="mt-2 font-serif text-2xl font-semibold text-azul-950">{value}</p>
          {hint && <p className="mt-1 text-xs text-preto/50">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", toneClasses)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
