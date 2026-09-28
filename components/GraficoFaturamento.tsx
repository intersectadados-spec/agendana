import { formatCurrency } from "@/lib/utils";

type PontoMensal = { mesLabel: string; valor: number };

export default function GraficoFaturamento({ dados }: { dados: PontoMensal[] }) {
  const maximo = Math.max(...dados.map((d) => d.valor), 1);
  const largura = 760;
  const altura = 220;
  const margemInferior = 32;
  const larguraBarra = largura / dados.length;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="w-full min-w-[600px]"
        style={{ maxHeight: 260 }}
      >
        {dados.map((d, i) => {
          const alturaBarra = (d.valor / maximo) * (altura - margemInferior - 20);
          const x = i * larguraBarra + larguraBarra * 0.2;
          const largura2 = larguraBarra * 0.6;
          const y = altura - margemInferior - alturaBarra;

          return (
            <g key={d.mesLabel}>
              <rect
                x={x}
                y={y}
                width={largura2}
                height={alturaBarra}
                rx={4}
                fill="#FFC2D1"
              />
              {d.valor > 0 && (
                <text
                  x={x + largura2 / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#5B2A3D"
                >
                  {formatCurrency(d.valor).replace("R$", "").trim()}
                </text>
              )}
              <text
                x={x + largura2 / 2}
                y={altura - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#8C7078"
              >
                {d.mesLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
