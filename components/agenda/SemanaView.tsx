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

export default function SemanaView({
  dias,
  agendamentosPorDia,
}: {
  dias: { iso: string; diaSemana: string; diaMes: number; hoje: boolean }[];
  agendamentosPorDia: Record<string, Agendamento[]>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
      {dias.map((dia) => {
        const itens = agendamentosPorDia[dia.iso] ?? [];
        return (
          <div key={dia.iso} className="card p-3 min-h-[140px]">
            <div
              className={`text-center mb-2 pb-2 border-b border-line ${
                dia.hoje ? "text-wine" : "text-ink"
              }`}
            >
              <p className="text-[11px] uppercase text-muted tracking-wide">{dia.diaSemana}</p>
              <p className={`text-lg ${dia.hoje ? "font-semibold" : ""}`}>{dia.diaMes}</p>
            </div>
            {itens.length === 0 ? (
              <p className="text-[11px] text-muted text-center">—</p>
            ) : (
              <div className="space-y-0.5">
                {itens.map((a) => (
                  <AgendamentoResumo
                    key={a.id}
                    data={a.data}
                    horario={a.horario}
                    nomePaciente={a.pacientes?.nome ?? ""}
                    atendido={a.atendido}
                    pago={a.pago}
                    confirmadoWhatsapp={a.confirmado_whatsapp}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
