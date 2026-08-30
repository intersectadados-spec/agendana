import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PacientesPage() {
  const supabase = createClient();
  const { data: pacientes } = await supabase
    .from("pacientes")
    .select("*")
    .order("nome");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-wine">Pacientes</h2>
        <Link href="/dashboard/pacientes/novo" className="btn-primary">
          + Novo paciente
        </Link>
      </div>

      <div className="card divide-y divide-line">
        {!pacientes || pacientes.length === 0 ? (
          <p className="p-5 text-sm text-muted">Nenhum paciente cadastrado ainda.</p>
        ) : (
          pacientes.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/pacientes/${p.id}`}
              className="flex items-center justify-between p-4 hover:bg-cream transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{p.nome}</p>
                <p className="text-xs text-muted">{p.telefone}</p>
              </div>
              <div className="text-right text-xs text-muted">
                <p>{formatCurrency(p.preco_consulta)}</p>
                <p className="capitalize">{p.frequencia_pagamento}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
