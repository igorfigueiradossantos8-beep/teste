"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { STATUS_PROCESSO_LABEL } from "@/lib/status";
import type { StatusProcesso } from "@/types/database.types";
import type { ProcessosPorStatus } from "@/lib/data/financeiro";

const CORES: Record<string, string> = {
  ativo: "#2c5486",
  suspenso: "#d4b06a",
  aguardando: "#c19a4b",
  recurso: "#a17f38",
  arquivado: "#ddcda3",
  encerrado_ganho: "#1f7a4d",
  encerrado_perdido: "#b91c1c",
  encerrado_acordo: "#0f766e",
};

export function ProcessosStatusChart({ data }: { data: ProcessosPorStatus[] }) {
  const chartData = data.map((d) => ({
    name: STATUS_PROCESSO_LABEL[d.status as StatusProcesso] ?? d.status,
    value: d.quantidade,
    status: d.status,
  }));

  if (chartData.length === 0) {
    return <p className="py-10 text-center text-sm text-preto/50">Nenhum processo cadastrado ainda.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={CORES[entry.status] ?? "#2c5486"} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
