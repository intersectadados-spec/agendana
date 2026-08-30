"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ResultadoAcao = { ok: boolean; error?: string };

type Paciente = {
  nome?: string;
  telefone?: string;
  data_nascimento?: string | null;
  preco_consulta?: number;
  frequencia_pagamento?: string;
  observacoes?: string | null;
};

export default function PacienteForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => Promise<ResultadoAcao>;
  defaultValues?: Paciente;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    if (enviando) return; // trava contra duplo clique
    setEnviando(true);
    setErro(null);

    const resultado = await action(formData);

    if (!resultado.ok) {
      setErro(resultado.error ?? "Não foi possível salvar o paciente.");
      setEnviando(false);
      return;
    }

    router.push("/dashboard/pacientes");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="card p-6 space-y-4 max-w-lg">
      <div>
        <label className="label">Nome completo</label>
        <input name="nome" required className="input" defaultValue={defaultValues?.nome} />
      </div>

      <div>
        <label className="label">Telefone (WhatsApp)</label>
        <input
          name="telefone"
          required
          placeholder="55519xxxxxxxx"
          className="input"
          defaultValue={defaultValues?.telefone}
        />
        <p className="text-xs text-muted mt-1">
          Formato com DDI e DDD, só números — ex: 5551999998888
        </p>
      </div>

      <div>
        <label className="label">Data de nascimento</label>
        <input
          type="date"
          name="data_nascimento"
          className="input"
          defaultValue={defaultValues?.data_nascimento ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Preço da consulta</label>
          <input
            type="number"
            step="0.01"
            name="preco_consulta"
            className="input"
            defaultValue={defaultValues?.preco_consulta}
          />
        </div>
        <div>
          <label className="label">Pagamento</label>
          <select
            name="frequencia_pagamento"
            className="input"
            defaultValue={defaultValues?.frequencia_pagamento ?? "mensal"}
          >
            <option value="mensal">Mensal</option>
            <option value="semanal">Semanal</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Observações</label>
        <textarea
          name="observacoes"
          rows={3}
          className="input"
          defaultValue={defaultValues?.observacoes ?? ""}
        />
      </div>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {erro}
        </p>
      )}

      <button type="submit" disabled={enviando} className="btn-primary w-full disabled:opacity-60">
        {enviando ? "Salvando..." : "Salvar paciente"}
      </button>
    </form>
  );
}
