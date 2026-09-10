import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bege-100 text-azul-800">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div>
        <p className="font-medium text-azul-950">{title}</p>
        {description && <p className="mt-1 text-sm text-preto/60">{description}</p>}
      </div>
      {action}
    </div>
  );
}
