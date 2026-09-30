"use client";

import { registrarRecebimentoAvulso } from "@/lib/actions";
import { toISODate } from "@/lib/utils";
import { useRef, useState } from "react";

type Paciente = { id: string; nome: string };

function mesAnteriorISO() {
  const d = new Date();
  const mes = d.getMonth(); // 0-indexado: mês atual - 1
  const ano = mes === 0 ? d.getFullYear() - 1 : d.getFullYear();
  const mesAnterior = mes === 0 ? 12 : mes;
  return `${ano}-${String(mesAnterior).padStart(2, "0")}`;
}

export default function RecebimentoAvulsoForm({ pacientes }: { pacientes: Paciente[] }) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setErro(null);
    setEnviando(true);
    const resultado = await registrarRecebimentoAvulso(formData);
    setEnviando(false);

    if (!resultado.ok) {
      setErro(resultado.error ?? "Não foi possível registrar.");
      return;
    }
    formRef.current?.reset();
    setAberto(false);
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="btn-secondary">
        + Registrar recebimento de outro mês
      </button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="card p-5 space-y-4 max-w-lg">
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
          <label className="label">Valor recebido</label>
          <input type="number" step="0.01" name="valor" required className="input" />
        </div>
        <div>
          <label className="label">Referente ao mês</label>
          <input
            type="month"
            name="mes_referencia"
            required
            defaultValue={mesAnteriorISO()}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label">Data em que recebeu</label>
        <input
          type="date"
          name="data_recebimento"
          defaultValue={toISODate(new Date())}
          className="input"
        />
      </div>

      <div>
        <label className="label">Observação (opcional)</label>
        <input type="text" name="observacao" className="input" placeholder="Ex: pacote de 4 sessões" />
      </div>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {erro}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={enviando} className="btn-primary">
          {enviando ? "Salvando..." : "Registrar"}
        </button>
        <button type="button" onClick={() => setAberto(false)} className="btn-ghost">
          Cancelar
        </button>
      </div>
    </form>
  );
}
