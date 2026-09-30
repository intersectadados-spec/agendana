"use client";

import { excluirRecebimentoAvulso } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";
import { useTransition } from "react";

type Props = {
  id: string;
  nomePaciente: string;
  valor: number;
  mesReferenciaLabel: string;
  dataRecebimentoFormatada: string;
  observacao: string | null;
};

export default function RecebimentoAvulsoItem({
  id,
  nomePaciente,
  valor,
  mesReferenciaLabel,
  dataRecebimentoFormatada,
  observacao,
}: Props) {
  const [pendente, startTransition] = useTransition();

  function handleExcluir() {
    if (!window.confirm("Excluir esse lançamento?")) return;
    startTransition(() => {
      excluirRecebimentoAvulso(id);
    });
  }

  return (
    <div className="flex items-center justify-between p-3 text-sm">
      <div>
        <p className="font-medium">{nomePaciente}</p>
        <p className="text-xs text-muted">
          Referente a {mesReferenciaLabel} · recebido em {dataRecebimentoFormatada}
          {observacao ? ` · ${observacao}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium text-wine">{formatCurrency(valor)}</span>
        <button
          onClick={handleExcluir}
          disabled={pendente}
          className="text-xs text-muted hover:text-red-600"
          title="Excluir lançamento"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
