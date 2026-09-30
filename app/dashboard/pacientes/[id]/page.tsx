import ConsultaPacienteItem from "@/components/ConsultaPacienteItem";
import ExcluirPacienteBotao from "@/components/ExcluirPacienteBotao";
import PacienteForm from "@/components/PacienteForm";
import { atualizarPaciente } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { formatDateBR } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

function mesAtualISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function limitesDoMes(mesISO: string) {
  const [ano, mes] = mesISO.split("-").map(Number);
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const proximoMes = mes === 12 ? 1 : mes + 1;
  const anoProximo = mes === 12 ? ano + 1 : ano;
  const fim = `${anoProximo}-${String(proximoMes).padStart(2, "0")}-01`;
  return { inicio, fim };
}

export default async function EditarPacientePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { mes?: string };
}) {
  const supabase = createClient();
  const { data: paciente } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!paciente) notFound();

  const atualizarComId = atualizarPaciente.bind(null, params.id);

  const mesSelecionado = searchParams.mes ?? mesAtualISO();
  const { inicio, fim } = limitesDoMes(mesSelecionado);

  const { data: consultasDoMes } = await supabase
    .from("agendamentos")
    .select("id, data, horario, status, atendido, pago, valor_pago")
    .eq("paciente_id", params.id)
    .gte("data", inicio)
    .lt("data", fim)
    .order("data")
    .order("horario");

  const [ano, mes] = mesSelecionado.split("-").map(Number);
  const mesAnterior = `${mes === 1 ? ano - 1 : ano}-${String(mes === 1 ? 12 : mes - 1).padStart(2, "0")}`;
  const mesSeguinte = `${mes === 12 ? ano + 1 : ano}-${String(mes === 12 ? 1 : mes + 1).padStart(2, "0")}`;
  const nomeMes = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl text-wine">Editar paciente</h2>
      <PacienteForm action={atualizarComId} defaultValues={paciente} />

      <ExcluirPacienteBotao id={params.id} />

      <div className="max-w-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg capitalize">Consultas em {nomeMes}</h3>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/pacientes/${params.id}?mes=${mesAnterior}`}
              className="btn-ghost px-3 py-1.5 text-sm"
            >
              ←
            </Link>
            <Link
              href={`/dashboard/pacientes/${params.id}?mes=${mesAtualISO()}`}
              className="btn-ghost px-3 py-1.5 text-sm"
            >
              Mês atual
            </Link>
            <Link
              href={`/dashboard/pacientes/${params.id}?mes=${mesSeguinte}`}
              className="btn-ghost px-3 py-1.5 text-sm"
            >
              →
            </Link>
          </div>
        </div>

        <div className="card divide-y divide-line">
          {!consultasDoMes || consultasDoMes.length === 0 ? (
            <p className="p-4 text-sm text-muted">Nenhuma consulta marcada nesse mês.</p>
          ) : (
            consultasDoMes.map((c) => (
              <ConsultaPacienteItem
                key={c.id}
                id={c.id}
                dataFormatada={formatDateBR(c.data)}
                horario={c.horario}
                atendido={c.atendido}
                pago={c.pago}
                status={c.status}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
