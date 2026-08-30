import Link from "next/link";
import AgendamentoResumo from "./AgendamentoResumo";

type Agendamento = {
  id: string;
  data: string;
  horario: string;
  atendido: boolean;
  pago: boolean;
  confirmado_whatsapp: boolean;
  pacientes: { nome: string } | null;
};

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MAX_VISIVEL = 3;

export default function MesView({
  semanas,
  mesAtual,
  hojeISO,
  agendamentosPorDia,
}: {
  semanas: { iso: string; diaMes: number; doMesAtual: boolean }[][];
  mesAtual: number;
  hojeISO: string;
  agendamentosPorDia: Record<string, Agendamento[]>;
}) {
  return (
    <div className="card p-3 overflow-x-auto">
      <div className="grid grid-cols-7 min-w-[700px]">
        {diasSemana.map((d) => (
          <div key={d} className="text-center text-[11px] uppercase text-muted tracking-wide py-2">
            {d}
          </div>
        ))}

        {semanas.flatMap((semana) =>
          semana.map((dia) => {
            const itens = agendamentosPorDia[dia.iso] ?? [];
            const visiveis = itens.slice(0, MAX_VISIVEL);
            const restantes = itens.length - visiveis.length;

            return (
              <Link
                href={`/dashboard/agenda?visao=dia&data=${dia.iso}`}
                key={dia.iso}
                className={`border border-line min-h-[100px] p-1.5 hover:bg-cream transition-colors ${
                  dia.doMesAtual ? "bg-white" : "bg-cream/50"
                }`}
              >
                <p
                  className={`text-xs mb-1 ${
                    dia.iso === hojeISO
                      ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-wine text-white"
                      : dia.doMesAtual
                      ? "text-ink"
                      : "text-muted"
                  }`}
                >
                  {dia.diaMes}
                </p>
                <div className="space-y-0.5">
                  {visiveis.map((a) => (
                    <AgendamentoResumo
                      key={a.id}
                      data={a.data}
                      horario={a.horario}
                      nomePaciente={a.pacientes?.nome ?? ""}
                      atendido={a.atendido}
                      pago={a.pago}
                      confirmadoWhatsapp={a.confirmado_whatsapp}
                      compacto
                    />
                  ))}
                  {restantes > 0 && (
                    <p className="text-[10px] text-wine px-1.5">+{restantes} mais</p>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
