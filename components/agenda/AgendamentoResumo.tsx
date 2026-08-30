import Link from "next/link";

export default function AgendamentoResumo({
  data,
  horario,
  nomePaciente,
  atendido,
  pago,
  confirmadoWhatsapp,
  compacto = false,
}: {
  data: string;
  horario: string;
  nomePaciente: string;
  atendido: boolean;
  pago: boolean;
  confirmadoWhatsapp: boolean;
  compacto?: boolean;
}) {
  return (
    <Link
      href={`/dashboard/agenda?visao=dia&data=${data}`}
      className={`flex items-center gap-1.5 rounded-md hover:bg-cream transition-colors ${
        compacto ? "px-1.5 py-1 text-[11px]" : "px-2 py-1.5 text-xs"
      }`}
      title={`${nomePaciente} às ${horario.slice(0, 5)}`}
    >
      <span className="font-medium text-wine shrink-0">{horario.slice(0, 5)}</span>
      <span className="truncate flex-1">{nomePaciente}</span>
      <span className="flex gap-0.5 shrink-0">
        {atendido && <span title="Atendido">✓</span>}
        {pago && <span className="text-sage" title="Pago">$</span>}
        {confirmadoWhatsapp && <span title="Confirmado no WhatsApp">💬</span>}
      </span>
    </Link>
  );
}
