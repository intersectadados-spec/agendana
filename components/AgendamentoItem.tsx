"use client";

import { atualizarStatusAgendamento, excluirAgendamento, remarcarAgendamento } from "@/lib/actions";
import { linkConfirmacaoWhatsapp } from "@/lib/utils";
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

  const [remarcando, setRemarcando] = useState(false);
  const [novaData, setNovaData] = useState(data);
  const [novoHorario, setNovoHorario] = useState(horario.slice(0, 5));
  const [erroRemarcacao, setErroRemarcacao] = useState<string | null>(null);
  const [salvandoRemarcacao, setSalvandoRemarcacao] = useState(false);

  function salvar(campos: Parameters<typeof atualizarStatusAgendamento>[1]) {
    startTransition(() => {
      atualizarStatusAgendamento(id, campos);
    });
  }

  async function confirmarRemarcacao() {
    setSalvandoRemarcacao(true);
    setErroRemarcacao(null);
    const resultado = await remarcarAgendamento(id, novaData, novoHorario);
    setSalvandoRemarcacao(false);

    if (!resultado.ok) {
      setErroRemarcacao(resultado.error ?? "Não foi possível remarcar.");
      return;
    }
    setRemarcando(false);
  }

  return (
    <li className="border-b border-line last:border-0 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
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

        {pago && (
          <input
            type="number"
            step="0.01"
            className="input w-24 py-1.5"
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
            onBlur={() => salvar({ valor_pago: valor })}
            title="Valor pago"
          />
        )}

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
          onClick={() => {
            setRemarcando((v) => !v);
            setErroRemarcacao(null);
          }}
          className="text-xs px-3 py-1.5 rounded-full border border-line text-ink hover:bg-cream"
        >
          Remarcar
        </button>

        <button
          onClick={() => excluirAgendamento(id)}
          className="text-xs text-muted hover:text-red-600"
          title="Excluir"
        >
          ✕
        </button>
      </div>

      {remarcando && (
        <div className="mt-3 ml-14 flex flex-wrap items-end gap-3 bg-cream rounded-lg p-3">
          <div>
            <label className="label">Nova data</label>
            <input
              type="date"
              className="input py-1.5"
              value={novaData}
              onChange={(e) => setNovaData(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Novo horário</label>
            <input
              type="time"
              min="07:00"
              max="21:00"
              className="input py-1.5"
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
            />
          </div>
          <button
            onClick={confirmarRemarcacao}
            disabled={salvandoRemarcacao}
            className="btn-primary py-1.5 text-xs"
          >
            {salvandoRemarcacao ? "Salvando..." : "Confirmar remarcação"}
          </button>
          <button
            onClick={() => setRemarcando(false)}
            className="btn-ghost py-1.5 text-xs"
          >
            Cancelar
          </button>
          {erroRemarcacao && (
            <p className="w-full text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {erroRemarcacao}
            </p>
          )}
        </div>
      )}
    </li>
  );
}
