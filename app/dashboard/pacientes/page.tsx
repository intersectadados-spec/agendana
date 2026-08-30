import PacientesDiretorio from "@/components/PacientesDiretorio";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PacientesPage() {
  const supabase = createClient();
  const { data: pacientes } = await supabase
    .from("pacientes")
    .select("id, nome, telefone, preco_consulta, frequencia_pagamento")
    .order("nome");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-wine">Pacientes</h2>
        <Link href="/dashboard/pacientes/novo" className="btn-primary">
          + Novo paciente
        </Link>
      </div>

      <PacientesDiretorio pacientes={pacientes ?? []} />
    </div>
  );
}
