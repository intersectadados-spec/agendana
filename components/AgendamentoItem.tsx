"use client";

import { atualizarStatusAgendamento, excluirAgendamento } from "@/lib/actions";
import { formatCurrency, linkConfirmacaoWhatsapp } from "@/lib/utils";
import { useState, useTransition } from "react";

type Props = {
  id: string;
  horario: string;
  data: string;
  nomePaciente: string;
  telefonePaciente: string;
  atendido: boolean;
  pago: boolean;
  valorPago: number | null;
  precoConsulta: number;
  confirmadoWhatsapp: boolean;
};

export default function AgendamentoItem({
  id,
  horario,
  data,
  nomePaciente,
  telefonePaciente,
  atendido: atendidoInicial,
  pago: pagoInicial,
  valorPago,
  precoConsulta,
  confirmadoWhatsapp: confirmadoInicial,
}: Props) {
  const [atendido, setAtendido] = useState(atendidoInicial);
  const [pago, setPago] = useState(pagoInicial);
  const [valor, setValor] = useState(valorPago ?? precoConsulta);
  const [confirmado, setConfirmado] = useState(confirmadoInicial);
  const [, startTransition] = useTransition();

  function salvar(campos: Parameters<typeof atualizarStatusAgendamento>[1]) {
    startTransition(() => {
      atualizarStatusAgendamento(id, campos);
    });
  }

  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-line last:border-0 py-3 text-sm">
      <span className="font-medium w-14">{horario.slice(0, 5)}</span>
      <span className="flex-1 min-w-[120px]">{nomePaciente}</span>

      <label className="flex items-center gap-1.5 text-xs text-muted">
        <input
          type="checkbox"
          checked={atendido}
          onChange={(e) => {
            setAtendido(e.target.checked);
            salvar({ atendido: e.target.checked });
          }}
        />
        Atendido
      </label>

      <label className="flex items-center gap-1.5 text-xs text-muted">
        <input
          type="checkbox"
          checked={pago}
          onChange={(e) => {
            setPago(e.target.checked);
            salvar({ pago: e.target.checked, valor_pago: valor });
          }}
        />
        Pago
      </label>

      <input
        type="number"
        step="0.01"
        className="input w-24 py-1.5"
        value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
        onBlur={() => salvar({ valor_pago: valor })}
        title="Valor pago"
      />

      <a
        href={linkConfirmacaoWhatsapp(telefonePaciente, nomePaciente, data, horario)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          setConfirmado(true);
          salvar({ confirmado_whatsapp: true });
        }}
        className={`text-xs px-3 py-1.5 rounded-full ${
          confirmado ? "bg-sage/20 text-sage" : "bg-blush text-wine hover:bg-blush-dark"
        }`}
      >
        {confirmado ? "Confirmado ✓" : "Confirmar WhatsApp"}
      </a>

      <button
        onClick={() => excluirAgendamento(id)}
        className="text-xs text-muted hover:text-red-600"
        title="Excluir"
      >
        ✕
      </button>
    </li>
  );
}
