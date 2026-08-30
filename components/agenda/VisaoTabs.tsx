import Link from "next/link";

const opcoes = [
  { valor: "dia", label: "Dia" },
  { valor: "semana", label: "Semana" },
  { valor: "mes", label: "Mês" },
] as const;

export default function VisaoTabs({
  visaoAtual,
  data,
}: {
  visaoAtual: string;
  data: string;
}) {
  return (
    <div className="inline-flex rounded-full border border-line bg-white p-1">
      {opcoes.map((o) => (
        <Link
          key={o.valor}
          href={`/dashboard/agenda?visao=${o.valor}&data=${data}`}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            visaoAtual === o.valor ? "bg-blush text-wine" : "text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
