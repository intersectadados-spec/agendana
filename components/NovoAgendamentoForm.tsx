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
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await criarAgendamento(formData);
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
          <input type="time" name="horario" required className="input" />
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

      <div className="flex gap-3">
        <button type="submit" className="btn-primary">
          Salvar
        </button>
        <button type="button" onClick={() => setAberto(false)} className="btn-ghost">
          Cancelar
        </button>
      </div>
    </form>
  );
}
