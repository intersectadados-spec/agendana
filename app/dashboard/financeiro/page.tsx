import RecebimentoAvulsoForm from "@/components/RecebimentoAvulsoForm";
import RecebimentoAvulsoItem from "@/components/RecebimentoAvulsoItem";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDateBR, toISODate } from "@/lib/utils";
import { endOfWeek, startOfWeek } from "date-fns";
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

const NOMES_MES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: { mes?: string };
}) {
  const supabase = createClient();
  const mesSelecionado = searchParams.mes ?? mesAtualISO();
  const { inicio, fim } = limitesDoMes(mesSelecionado);

  const [ano, mes] = mesSelecionado.split("-").map(Number);
  const mesAnteriorISO = `${mes === 1 ? ano - 1 : ano}-${String(mes === 1 ? 12 : mes - 1).padStart(2, "0")}`;
  const mesSeguinte = `${mes === 12 ? ano + 1 : ano}-${String(mes === 12 ? 1 : mes + 1).padStart(2, "0")}`;

  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select("valor_pago, pago, atendido, data, pacientes(id, nome, preco_consulta, frequencia_pagamento)")
    .gte("data", inicio)
    .lt("data", fim);

  const { data: pacientes } = await supabase.from("pacientes").select("id, nome").order("nome");

  const { data: recebimentosAvulsos } = await supabase
    .from("recebimentos_avulsos")
    .select("id, valor, mes_referencia, data_recebimento, observacao, pacientes(nome)")
    .gte("data_recebimento", inicio)
    .lt("data_recebimento", fim)
    .order("data_recebimento", { ascending: false });

  // ---- Faturamento previsto da semana atual (independe do mês navegado) ----
  const hoje = new Date();
  const inicioSemana = toISODate(startOfWeek(hoje, { weekStartsOn: 0 }));
  const fimSemana = toISODate(endOfWeek(hoje, { weekStartsOn: 0 }));

  const { data: agendamentosSemana } = await supabase
    .from("agendamentos")
    .select("pacientes(preco_consulta)")
    .gte("data", inicioSemana)
    .lte("data", fimSemana);

  const previstoSemana = (agendamentosSemana ?? []).reduce(
    (soma: number, a: any) => soma + Number(a.pacientes?.preco_consulta ?? 0),
    0
  );

  // ---- Faturamento recebido no ano atual (consultas + avulsos) ----
  const anoAtual = hoje.getFullYear();
  const { data: agendamentosAno } = await supabase
    .from("agendamentos")
    .select("valor_pago, pago")
    .gte("data", `${anoAtual}-01-01`)
    .lt("data", `${anoAtual + 1}-01-01`);

  const { data: avulsosAno } = await supabase
    .from("recebimentos_avulsos")
    .select("valor")
    .gte("data_recebimento", `${anoAtual}-01-01`)
    .lt("data_recebimento", `${anoAtual + 1}-01-01`);

  const recebidoAno =
    (agendamentosAno ?? []).reduce((soma: number, a: any) => soma + (a.pago ? Number(a.valor_pago ?? 0) : 0), 0) +
    (avulsosAno ?? []).reduce((soma: number, r: any) => soma + Number(r.valor ?? 0), 0);

  // ---- Totais do mês selecionado (consultas) ----
  let previstoMes = 0;
  let recebidoMes = 0;
  for (const a of agendamentos ?? ([] as any[])) {
    const preco = Number((a as any).pacientes?.preco_consulta ?? 0);
    previstoMes += preco;
    if (a.pago) recebidoMes += Number(a.valor_pago ?? 0);
  }
  const pendenteMes = Math.max(previstoMes - recebidoMes, 0);

  // ---- Recebimentos avulsos do mês selecionado ----
  const listaAvulsos = recebimentosAvulsos ?? [];
  const recebidoAvulsoTotal = listaAvulsos.reduce((soma, r: any) => soma + Number(r.valor ?? 0), 0);
  const recebidoReferenteMesAnterior = listaAvulsos
    .filter((r: any) => r.mes_referencia === mesAnteriorISO)
    .reduce((soma, r: any) => soma + Number(r.valor ?? 0), 0);
  const totalRecebidoMesCompleto = recebidoMes + recebidoAvulsoTotal;

  const porPaciente = new Map<
    string,
    { nome: string; preco: number; frequencia: string; totalPago: number; sessoes: number; totalAgendado: number }
  >();

  for (const a of agendamentos ?? ([] as any[])) {
    const p = (a as any).pacientes;
    if (!p) continue;
    const atual = porPaciente.get(p.id) ?? {
      nome: p.nome,
      preco: p.preco_consulta,
      frequencia: p.frequencia_pagamento,
      totalPago: 0,
      sessoes: 0,
      totalAgendado: 0,
    };
    atual.totalAgendado += 1;
    if (a.atendido) atual.sessoes += 1;
    if (a.pago) atual.totalPago += Number(a.valor_pago ?? 0);
    porPaciente.set(p.id, atual);
  }

  const linhas = Array.from(porPaciente.values()).sort((a, b) => a.nome.localeCompare(b.nome));

  const nomeMes = `${NOMES_MES[mes - 1]} de ${ano}`;
  const nomeMesAnterior = (() => {
    const [a, m] = mesAnteriorISO.split("-").map(Number);
    return `${NOMES_MES[m - 1]} de ${a}`;
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl text-wine capitalize">{nomeMes}</h2>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/financeiro?mes=${mesAnteriorISO}`} className="btn-ghost px-3 py-2">
            ←
          </Link>
          <Link href={`/dashboard/financeiro?mes=${mesAtualISO()}`} className="btn-ghost">
            Mês atual
          </Link>
          <Link href={`/dashboard/financeiro?mes=${mesSeguinte}`} className="btn-ghost px-3 py-2">
            →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Previsto na semana</p>
          <p className="text-lg font-medium text-wine">{formatCurrency(previstoSemana)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Previsto no mês</p>
          <p className="text-lg font-medium text-wine">{formatCurrency(previstoMes)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Recebido no mês</p>
          <p className="text-lg font-medium text-sage">{formatCurrency(recebidoMes)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Pendente no mês</p>
          <p className="text-lg font-medium text-red-500">{formatCurrency(pendenteMes)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Faturamento em {anoAtual}</p>
          <p className="text-lg font-medium text-wine">{formatCurrency(recebidoAno)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1 capitalize">
            Recebido referente a {nomeMesAnterior}
          </p>
          <p className="text-lg font-medium text-wine">{formatCurrency(recebidoReferenteMesAnterior)}</p>
        </div>
        <div className="card p-4 md:col-span-2">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">
            Total recebido no mês (consultas + avulsos de outros meses)
          </p>
          <p className="text-lg font-medium text-sage">{formatCurrency(totalRecebidoMesCompleto)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg">Recebimentos avulsos (de outros meses)</h3>
        <div className="card divide-y divide-line">
          {listaAvulsos.length === 0 ? (
            <p className="p-4 text-sm text-muted">Nenhum lançamento avulso nesse mês.</p>
          ) : (
            listaAvulsos.map((r: any) => {
              const [aRef, mRef] = r.mes_referencia.split("-").map(Number);
              return (
                <RecebimentoAvulsoItem
                  key={r.id}
                  id={r.id}
                  nomePaciente={r.pacientes?.nome ?? ""}
                  valor={Number(r.valor)}
                  mesReferenciaLabel={`${NOMES_MES[mRef - 1]} de ${aRef}`}
                  dataRecebimentoFormatada={formatDateBR(r.data_recebimento)}
                  observacao={r.observacao}
                />
              );
            })
          )}
        </div>
        {pacientes && pacientes.length > 0 && <RecebimentoAvulsoForm pacientes={pacientes} />}
      </div>

      <div className="card p-5">
        <h3 className="text-lg mb-4">Detalhe por paciente (consultas do mês)</h3>

        {linhas.length === 0 ? (
          <p className="text-sm text-muted">Nenhum atendimento registrado nesse mês.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase border-b border-line">
                <th className="py-2 font-medium">Paciente</th>
                <th className="py-2 font-medium">Total do mês</th>
                <th className="py-2 font-medium">Pagamento</th>
                <th className="py-2 font-medium">Sessões atendidas</th>
                <th className="py-2 font-medium text-right">Total pago no mês</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.nome} className="border-b border-line last:border-0">
                  <td className="py-2.5">{l.nome}</td>
                  <td className="py-2.5">{formatCurrency(l.preco * l.totalAgendado)}</td>
                  <td className="py-2.5 capitalize">{l.frequencia}</td>
                  <td className="py-2.5">{l.sessoes}</td>
                  <td className="py-2.5 text-right font-medium">{formatCurrency(l.totalPago)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
