"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { FluxoMensal } from "@/lib/data/financeiro";

export function FluxoChart({ data }: { data: FluxoMensal[] }) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ece1c8" />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#14120f99" }} axisLine={{ stroke: "#ddcda3" }} />
        <YAxis tick={{ fontSize: 12, fill: "#14120f99" }} axisLine={{ stroke: "#ddcda3" }} tickFormatter={(v) => formatCurrency(v)} width={90} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 8, borderColor: "#ddcda3" }} />
        <Legend />
        <Bar dataKey="entradas" name="Entradas" fill="#2c5486" radius={[4, 4, 0, 0]} />
        <Bar dataKey="saidas" name="Saídas" fill="#c19a4b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
