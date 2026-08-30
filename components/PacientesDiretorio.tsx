"use client";

import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useMemo, useState } from "react";

type Paciente = {
  id: string;
  nome: string;
  telefone: string;
  preco_consulta: number;
  frequencia_pagamento: string;
};

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function PacientesDiretorio({ pacientes }: { pacientes: Paciente[] }) {
  const [busca, setBusca] = useState("");
  const [letraAtiva, setLetraAtiva] = useState<string | null>(null);

  const letrasDisponiveis = useMemo(() => {
    const set = new Set(pacientes.map((p) => normalizar(p.nome)[0]?.toUpperCase()));
    return set;
  }, [pacientes]);

  const filtrados = useMemo(() => {
    let lista = pacientes;

    if (busca.trim()) {
      const termo = normalizar(busca.trim());
      lista = lista.filter((p) => normalizar(p.nome).includes(termo));
    } else if (letraAtiva) {
      lista = lista.filter((p) => normalizar(p.nome)[0]?.toUpperCase() === letraAtiva);
    }

    return lista;
  }, [pacientes, busca, letraAtiva]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Buscar paciente pelo nome..."
        className="input"
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          if (e.target.value) setLetraAtiva(null);
        }}
      />

      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => {
            setLetraAtiva(null);
            setBusca("");
          }}
          className={`w-8 h-8 rounded-full text-xs font-medium ${
            !letraAtiva && !busca ? "bg-wine text-white" : "bg-white border border-line text-muted"
          }`}
        >
          Todos
        </button>
        {ALFABETO.map((letra) => {
          const disponivel = letrasDisponiveis.has(letra);
          return (
            <button
              key={letra}
              disabled={!disponivel}
              onClick={() => {
                setLetraAtiva(letra);
                setBusca("");
              }}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                letraAtiva === letra
                  ? "bg-wine text-white"
                  : disponivel
                  ? "bg-white border border-line text-ink hover:bg-cream"
                  : "bg-white border border-line text-line cursor-not-allowed"
              }`}
            >
              {letra}
            </button>
          );
        })}
      </div>

      <div className="card divide-y divide-line">
        {filtrados.length === 0 ? (
          <p className="p-5 text-sm text-muted">Nenhum paciente encontrado.</p>
        ) : (
          filtrados.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/pacientes/${p.id}`}
              className="flex items-center justify-between p-4 hover:bg-cream transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{p.nome}</p>
                <p className="text-xs text-muted">{p.telefone}</p>
              </div>
              <div className="text-right text-xs text-muted">
                <p>{formatCurrency(p.preco_consulta)}</p>
                <p className="capitalize">{p.frequencia_pagamento}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
