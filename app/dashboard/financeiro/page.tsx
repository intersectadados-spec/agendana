import { createClient } from "@/lib/supabase/server";
import { formatCurrency, toISODate } from "@/lib/utils";
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

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: { mes?: string };
}) {
  const supabase = createClient();
  const mesSelecionado = searchParams.mes ?? mesAtualISO();
  const { inicio, fim } = limitesDoMes(mesSelecionado);

  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select("valor_pago, pago, atendido, data, pacientes(id, nome, preco_consulta, frequencia_pagamento)")
    .gte("data", inicio)
    .lt("data", fim);

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

  // ---- Totais do mês selecionado ----
  let previstoMes = 0;
  let recebidoMes = 0;
  for (const a of agendamentos ?? ([] as any[])) {
    const preco = Number((a as any).pacientes?.preco_consulta ?? 0);
    previstoMes += preco;
    if (a.pago) recebidoMes += Number(a.valor_pago ?? 0);
  }
  const pendenteMes = Math.max(previstoMes - recebidoMes, 0);

  const porPaciente = new Map<
    string,
    { nome: string; preco: number; frequencia: string; totalPago: number; sessoes: number }
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
    };
    if (a.atendido) atual.sessoes += 1;
    if (a.pago) atual.totalPago += Number(a.valor_pago ?? 0);
    porPaciente.set(p.id, atual);
  }

  const linhas = Array.from(porPaciente.values()).sort((a, b) => a.nome.localeCompare(b.nome));

  const [ano, mes] = mesSelecionado.split("-").map(Number);
  const mesAnterior = `${mes === 1 ? ano - 1 : ano}-${String(mes === 1 ? 12 : mes - 1).padStart(2, "0")}`;
  const mesSeguinte = `${mes === 12 ? ano + 1 : ano}-${String(mes === 12 ? 1 : mes + 1).padStart(2, "0")}`;

  const nomeMes = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl text-wine capitalize">{nomeMes}</h2>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/financeiro?mes=${mesAnterior}`} className="btn-ghost px-3 py-2">
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
      </div>

      <div className="card p-5">
        <h3 className="text-lg mb-4">Detalhe por paciente</h3>

        {linhas.length === 0 ? (
          <p className="text-sm text-muted">Nenhum atendimento registrado nesse mês.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase border-b border-line">
                <th className="py-2 font-medium">Paciente</th>
                <th className="py-2 font-medium">Preço consulta</th>
                <th className="py-2 font-medium">Pagamento</th>
                <th className="py-2 font-medium">Sessões atendidas</th>
                <th className="py-2 font-medium text-right">Total pago no mês</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.nome} className="border-b border-line last:border-0">
                  <td className="py-2.5">{l.nome}</td>
                  <td className="py-2.5">{formatCurrency(l.preco)}</td>
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
