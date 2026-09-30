"use client";

import { atualizarStatusAgendamento } from "@/lib/actions";
import { useState, useTransition } from "react";

type Props = {
  id: string;
  dataFormatada: string;
  horario: string;
  atendido: boolean;
  pago: boolean;
  status: string;
};

export default function ConsultaPacienteItem({
  id,
  dataFormatada,
  horario,
  atendido,
  pago,
  status: statusInicial,
}: Props) {
  const [status, setStatus] = useState(statusInicial);
  const [, startTransition] = useTransition();

  function alternarCancelado() {
    const novoStatus = status === "cancelado" ? "agendado" : "cancelado";
    setStatus(novoStatus);
    startTransition(() => {
      atualizarStatusAgendamento(id, { status: novoStatus });
    });
  }

  return (
    <div className="flex items-center justify-between p-3 text-sm">
      <div>
        <p className={`font-medium ${status === "cancelado" ? "line-through text-muted" : ""}`}>
          {dataFormatada} às {horario.slice(0, 5)}
        </p>
        <p className="text-xs text-muted capitalize">{status}</p>
      </div>
      <div className="flex items-center gap-2 text-xs">
        {atendido && <span className="text-sage">Atendido</span>}
        {pago && <span className="text-wine">Pago</span>}
        <button
          onClick={alternarCancelado}
          className={`px-2.5 py-1 rounded-full border ${
            status === "cancelado"
              ? "border-line text-ink hover:bg-cream"
              : "border-red-200 text-red-500 hover:bg-red-50"
          }`}
        >
          {status === "cancelado" ? "Reabrir" : "Desmarcar"}
        </button>
      </div>
    </div>
  );
}
