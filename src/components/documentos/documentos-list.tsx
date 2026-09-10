"use client";

import { useTransition } from "react";
import { FileText, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getDocumentoUrl, deleteDocumentoAction } from "@/lib/actions/documentos";
import { TIPO_DOCUMENTO_LABEL } from "@/lib/status";
import { formatDate } from "@/lib/utils";
import type { Documento } from "@/types/database.types";

export function DocumentosList({ documentos }: { documentos: Documento[] }) {
  const [isPending, startTransition] = useTransition();

  async function handleDownload(path: string) {
    const url = await getDocumentoUrl(path);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleDelete(doc: Documento) {
    if (!confirm(`Excluir o documento "${doc.nome}"?`)) return;
    startTransition(() =>
      deleteDocumentoAction(doc.id, doc.storage_path, {
        cliente_id: doc.cliente_id,
        processo_id: doc.processo_id,
      }),
    );
  }

  if (documentos.length === 0) {
    return (
      <EmptyState icon={FileText} title="Nenhum documento anexado" description="Envie contratos, procurações e petições." />
    );
  }

  return (
    <ul className="divide-y divide-bege-100">
      {documentos.map((doc) => (
        <li key={doc.id} className="flex items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bege-100 text-azul-800">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-azul-950">{doc.nome}</p>
              <p className="text-xs text-preto/50">{formatDate(doc.created_at)}</p>
            </div>
            <Badge tone="azul">{TIPO_DOCUMENTO_LABEL[doc.tipo]}</Badge>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => handleDownload(doc.storage_path)}
              className="rounded-md p-2 text-azul-900 hover:bg-bege-100"
              title="Baixar"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(doc)}
              disabled={isPending}
              className="rounded-md p-2 text-red-700 hover:bg-red-50"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
