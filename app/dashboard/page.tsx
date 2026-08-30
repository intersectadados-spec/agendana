import { createClient } from "@/lib/supabase/server";
import { aniversarioProximo, formatDateLong, toISODate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResumoPage() {
  const supabase = createClient();
  const hoje = toISODate(new Date());

  const { data: agendaHoje } = await supabase
    .from("agendamentos")
    .select("id, horario, status, pacientes(nome)")
    .eq("data", hoje)
    .order("horario");

  const { data: pacientes } = await supabase
    .from("pacientes")
    .select("id, nome, data_nascimento")
    .not("data_nascimento", "is", null);

  const aniversariantes = (pacientes ?? [])
    .map((p) => ({ ...p, ...aniversarioProximo(p.data_nascimento!, 30) }))
    .filter((p) => p.proximo)
    .sort((a, b) => a.emQuantosDias - b.emQuantosDias);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl text-wine capitalize">{formatDateLong(hoje)}</h2>
        <p className="text-muted text-sm mt-1">Aqui está o seu dia, Ana Paula.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="text-lg mb-4">Agenda de hoje</h3>
          {!agendaHoje || agendaHoje.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma consulta marcada para hoje.</p>
          ) : (
            <ul className="space-y-2">
              {agendaHoje.map((a: any) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between text-sm border-b border-line last:border-0 pb-2 last:pb-0"
                >
                  <span className="font-medium">{a.horario.slice(0, 5)}</span>
                  <span className="flex-1 px-3">{a.pacientes?.nome}</span>
                  <span className="text-xs text-muted capitalize">{a.status}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/dashboard/agenda" className="inline-block mt-4 text-sm text-wine font-medium">
            Ver agenda completa →
          </Link>
        </div>

        <div className="card p-5">
          <h3 className="text-lg mb-4">Aniversários próximos</h3>
          {aniversariantes.length === 0 ? (
            <p className="text-sm text-muted">Nenhum aniversário nos próximos 30 dias.</p>
          ) : (
            <ul className="space-y-2">
              {aniversariantes.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between text-sm border-b border-line last:border-0 pb-2 last:pb-0"
                >
                  <span>{p.nome}</span>
                  <span className="text-xs text-muted">
                    {p.emQuantosDias === 0 ? "hoje 🎂" : `em ${p.emQuantosDias} dias`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
