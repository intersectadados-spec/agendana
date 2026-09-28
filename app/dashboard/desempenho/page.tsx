import GraficoFaturamento from "@/components/GraficoFaturamento";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MESES_ABREV = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

type LinhaRanking = { nome: string; valor: number };

function Ranking({
  titulo,
  descricao,
  itens,
  formato,
}: {
  titulo: string;
  descricao: string;
  itens: LinhaRanking[];
  formato: "moeda" | "numero";
}) {
  return (
    <div className="card p-5">
      <h3 className="text-lg mb-0.5">{titulo}</h3>
      <p className="text-xs text-muted mb-4">{descricao}</p>
      {itens.length === 0 ? (
        <p className="text-sm text-muted">Sem dados ainda.</p>
      ) : (
        <ol className="space-y-2">
          {itens.map((item, i) => (
            <li key={item.nome} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cream text-wine text-[11px] font-medium flex items-center justify-center">
                  {i + 1}
                </span>
                {item.nome}
              </span>
              <span className="font-medium text-wine">
                {formato === "moeda" ? formatCurrency(item.valor) : item.valor}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default async function DesempenhoPage() {
  const supabase = createClient();
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const inicioMesAtual = `${anoAtual}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;
  const proximoMes = hoje.getMonth() === 11 ? 1 : hoje.getMonth() + 2;
  const anoProximoMes = hoje.getMonth() === 11 ? anoAtual + 1 : anoAtual;
  const fimMesAtual = `${anoProximoMes}-${String(proximoMes).padStart(2, "0")}-01`;

  // busca todo o histórico (com paciente) para os rankings gerais + o ano atual pro gráfico
  const { data: todosAgendamentos } = await supabase
    .from("agendamentos")
    .select("data, atendido, pago, valor_pago, status, confirmado_whatsapp, pacientes(id, nome)");

  const lista = todosAgendamentos ?? [];

  // ---- Ranking: maior faturamento (histórico, pago = true) ----
  const ganhoPorPaciente = new Map<string, number>();
  // ---- Ranking: mais assíduos (histórico, atendido = true) ----
  const atendidosPorPaciente = new Map<string, number>();
  // ---- Ranking: mais desmarcaram (histórico, status = cancelado) ----
  const canceladosPorPaciente = new Map<string, number>();
  // ---- Ranking: mais consultas confirmadas no mês atual ----
  const confirmadasMesPorPaciente = new Map<string, number>();
  // ---- Gráfico: faturamento recebido por mês, no ano atual ----
  const faturamentoPorMes = new Array(12).fill(0);

  for (const a of lista as any[]) {
    const nome = a.pacientes?.nome;
    if (!nome) continue;

    if (a.pago) {
      ganhoPorPaciente.set(nome, (ganhoPorPaciente.get(nome) ?? 0) + Number(a.valor_pago ?? 0));
    }
    if (a.atendido) {
      atendidosPorPaciente.set(nome, (atendidosPorPaciente.get(nome) ?? 0) + 1);
    }
    if (a.status === "cancelado") {
      canceladosPorPaciente.set(nome, (canceladosPorPaciente.get(nome) ?? 0) + 1);
    }
    if (a.confirmado_whatsapp && a.data >= inicioMesAtual && a.data < fimMesAtual) {
      confirmadasMesPorPaciente.set(nome, (confirmadasMesPorPaciente.get(nome) ?? 0) + 1);
    }

    if (a.pago && a.data.startsWith(String(anoAtual))) {
      const mesIndex = Number(a.data.slice(5, 7)) - 1;
      faturamentoPorMes[mesIndex] += Number(a.valor_pago ?? 0);
    }
  }

  function top5(mapa: Map<string, number>): LinhaRanking[] {
    return Array.from(mapa.entries())
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }

  const dadosGrafico = faturamentoPorMes.map((valor, i) => ({
    mesLabel: MESES_ABREV[i],
    valor,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl text-wine">Desempenho</h2>

      <div className="card p-5">
        <h3 className="text-lg mb-1">Faturamento mensal em {anoAtual}</h3>
        <p className="text-xs text-muted mb-4">Valores recebidos (pagos), mês a mês</p>
        <GraficoFaturamento dados={dadosGrafico} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Ranking
          titulo="Pacientes que mais geram ganho"
          descricao="Total recebido, histórico completo"
          itens={top5(ganhoPorPaciente)}
          formato="moeda"
        />
        <Ranking
          titulo="Mais consultas confirmadas no mês"
          descricao="Confirmações pelo WhatsApp neste mês"
          itens={top5(confirmadasMesPorPaciente)}
          formato="numero"
        />
        <Ranking
          titulo="Pacientes mais assíduos"
          descricao="Mais sessões atendidas, histórico completo"
          itens={top5(atendidosPorPaciente)}
          formato="numero"
        />
        <Ranking
          titulo="Pacientes que mais desmarcaram"
          descricao="Consultas marcadas como canceladas, histórico completo"
          itens={top5(canceladosPorPaciente)}
          formato="numero"
        />
      </div>
    </div>
  );
}
