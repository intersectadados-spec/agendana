"use client";

import { criarAgendamento } from "@/lib/actions";
import { useRef, useState } from "react";

type Paciente = { id: string; nome: string };

export default function NovoAgendamentoForm({
  pacientes,
  dataSelecionada,
}: {
  pacientes: Paciente[];
  dataSelecionada: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setErro(null);
    setEnviando(true);
    const resultado = await criarAgendamento(formData);
    setEnviando(false);

    if (!resultado.ok) {
      setErro(resultado.error ?? "Não foi possível criar o agendamento.");
      return;
    }

    formRef.current?.reset();
    setAberto(false);
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="btn-secondary">
        + Novo agendamento
      </button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="card p-5 space-y-4">
      <div>
        <label className="label">Paciente</label>
        <select name="paciente_id" required className="input">
          {pacientes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Data</label>
          <input type="date" name="data" required defaultValue={dataSelecionada} className="input" />
        </div>
        <div>
          <label className="label">Horário</label>
          <input type="time" name="horario" required min="07:00" max="21:00" className="input" />
        </div>
      </div>

      <div>
        <label className="label">Recorrência</label>
        <select name="recorrencia" className="input" defaultValue="nenhuma">
          <option value="nenhuma">Sessão única</option>
          <option value="semanal">Semanal (gera 12 sessões)</option>
          <option value="quinzenal">Quinzenal (gera 12 sessões)</option>
        </select>
      </div>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {erro}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={enviando} className="btn-primary">
          {enviando ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => {
            setAberto(false);
            setErro(null);
          }}
          className="btn-ghost"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
