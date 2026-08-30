import AgendamentoItem from "@/components/AgendamentoItem";
import NovoAgendamentoForm from "@/components/NovoAgendamentoForm";
import VisaoTabs from "@/components/agenda/VisaoTabs";
import SemanaView from "@/components/agenda/SemanaView";
import MesView from "@/components/agenda/MesView";
import { createClient } from "@/lib/supabase/server";
import { formatDateLong, toISODate } from "@/lib/utils";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

export const dynamic = "force-dynamic";

const diasSemanaLabel = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function agruparPorDia(agendamentos: any[]) {
  const mapa: Record<string, any[]> = {};
  for (const a of agendamentos) {
    if (!mapa[a.data]) mapa[a.data] = [];
    mapa[a.data].push(a);
  }
  return mapa;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { data?: string; visao?: string };
}) {
  const supabase = createClient();
  const visao = searchParams.visao === "semana" || searchParams.visao === "mes" ? searchParams.visao : "dia";
  const dataSelecionada = searchParams.data ?? toISODate(new Date());
  const dataRef = new Date(`${dataSelecionada}T00:00:00`);
  const hojeISO = toISODate(new Date());

  const { data: pacientes } = await supabase
    .from("pacientes")
    .select("id, nome")
    .order("nome");

  // ---------- VISÃO DIA ----------
  if (visao === "dia") {
    const { data: agendamentos } = await supabase
      .from("agendamentos")
      .select("*, pacientes(id, nome, telefone, preco_consulta)")
      .eq("data", dataSelecionada)
      .order("horario");

    const dataAnterior = toISODate(addDays(dataRef, -1));
    const dataSeguinte = toISODate(addDays(dataRef, 1));

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <VisaoTabs visaoAtual={visao} data={dataSelecionada} />
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/agenda?visao=dia&data=${dataAnterior}`} className="btn-ghost px-3 py-2">
              ←
            </Link>
            <Link href={`/dashboard/agenda?visao=dia&data=${hojeISO}`} className="btn-ghost">
              Hoje
            </Link>
            <Link href={`/dashboard/agenda?visao=dia&data=${dataSeguinte}`} className="btn-ghost px-3 py-2">
              →
            </Link>
          </div>
        </div>

        <h2 className="text-2xl text-wine capitalize">{formatDateLong(dataSelecionada)}</h2>

        <div className="card p-5">
          {!agendamentos || agendamentos.length === 0 ? (
            <p className="text-sm text-muted">Nenhum agendamento para esse dia.</p>
          ) : (
            <ul>
              {agendamentos.map((a: any) => (
                <AgendamentoItem
                  key={a.id}
                  id={a.id}
                  horario={a.horario}
                  data={a.data}
                  nomePaciente={a.pacientes?.nome ?? ""}
                  telefonePaciente={a.pacientes?.telefone ?? ""}
                  atendido={a.atendido}
                  pago={a.pago}
                  valorPago={a.valor_pago}
                  precoConsulta={a.pacientes?.preco_consulta ?? 0}
                  confirmadoWhatsapp={a.confirmado_whatsapp}
                />
              ))}
            </ul>
          )}
        </div>

        {pacientes && pacientes.length > 0 ? (
          <NovoAgendamentoForm pacientes={pacientes} dataSelecionada={dataSelecionada} />
        ) : (
          <p className="text-sm text-muted">
            Cadastre um <Link href="/dashboard/pacientes/novo" className="text-wine underline">paciente</Link> antes de criar agendamentos.
          </p>
        )}
      </div>
    );
  }

  // ---------- VISÃO SEMANA ----------
  if (visao === "semana") {
    const inicioSemana = startOfWeek(dataRef, { weekStartsOn: 0 });
    const fimSemana = endOfWeek(dataRef, { weekStartsOn: 0 });

    const { data: agendamentos } = await supabase
      .from("agendamentos")
      .select("*, pacientes(nome)")
      .gte("data", toISODate(inicioSemana))
      .lte("data", toISODate(fimSemana))
      .order("horario");

    const agendamentosPorDia = agruparPorDia(agendamentos ?? []);

    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(inicioSemana, i);
      const iso = toISODate(d);
      return {
        iso,
        diaSemana: diasSemanaLabel[d.getDay()],
        diaMes: d.getDate(),
        hoje: iso === hojeISO,
      };
    });

    const semanaAnterior = toISODate(addWeeks(dataRef, -1));
    const semanaSeguinte = toISODate(addWeeks(dataRef, 1));

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <VisaoTabs visaoAtual={visao} data={dataSelecionada} />
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/agenda?visao=semana&data=${semanaAnterior}`} className="btn-ghost px-3 py-2">
              ←
            </Link>
            <Link href={`/dashboard/agenda?visao=semana&data=${hojeISO}`} className="btn-ghost">
              Hoje
            </Link>
            <Link href={`/dashboard/agenda?visao=semana&data=${semanaSeguinte}`} className="btn-ghost px-3 py-2">
              →
            </Link>
          </div>
        </div>

        <h2 className="text-2xl text-wine capitalize">
          {format(inicioSemana, "d 'de' MMM", { locale: ptBR })} – {format(fimSemana, "d 'de' MMM", { locale: ptBR })}
        </h2>

        <SemanaView dias={dias} agendamentosPorDia={agendamentosPorDia} />
      </div>
    );
  }

  // ---------- VISÃO MÊS ----------
  const inicioMes = startOfMonth(dataRef);
  const fimMes = endOfMonth(dataRef);
  const inicioGrade = startOfWeek(inicioMes, { weekStartsOn: 0 });
  const fimGrade = endOfWeek(fimMes, { weekStartsOn: 0 });

  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select("*, pacientes(nome)")
    .gte("data", toISODate(inicioGrade))
    .lte("data", toISODate(fimGrade))
    .order("horario");

  const agendamentosPorDia = agruparPorDia(agendamentos ?? []);

  const totalDias = Math.round((fimGrade.getTime() - inicioGrade.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const todasAsCelulas = Array.from({ length: totalDias }, (_, i) => {
    const d = addDays(inicioGrade, i);
    return {
      iso: toISODate(d),
      diaMes: d.getDate(),
      doMesAtual: d.getMonth() === inicioMes.getMonth(),
    };
  });

  const semanas: typeof todasAsCelulas[] = [];
  for (let i = 0; i < todasAsCelulas.length; i += 7) {
    semanas.push(todasAsCelulas.slice(i, i + 7));
  }

  const mesAnterior = toISODate(addMonths(dataRef, -1));
  const mesSeguinte = toISODate(addMonths(dataRef, 1));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <VisaoTabs visaoAtual={visao} data={dataSelecionada} />
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/agenda?visao=mes&data=${mesAnterior}`} className="btn-ghost px-3 py-2">
            ←
          </Link>
          <Link href={`/dashboard/agenda?visao=mes&data=${hojeISO}`} className="btn-ghost">
            Hoje
          </Link>
          <Link href={`/dashboard/agenda?visao=mes&data=${mesSeguinte}`} className="btn-ghost px-3 py-2">
            →
          </Link>
        </div>
      </div>

      <h2 className="text-2xl text-wine capitalize">
        {format(inicioMes, "MMMM yyyy", { locale: ptBR })}
      </h2>

      <MesView
        semanas={semanas}
        mesAtual={inicioMes.getMonth()}
        hojeISO={hojeISO}
        agendamentosPorDia={agendamentosPorDia}
      />
    </div>
  );
}
