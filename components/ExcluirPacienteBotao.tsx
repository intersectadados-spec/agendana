"use client";

import { excluirPaciente } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function ExcluirPacienteBotao({ id }: { id: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function handleClick() {
    const confirmado = window.confirm(
      "Tem certeza que deseja excluir esse paciente? Isso também apaga todos os agendamentos dele. Essa ação não pode ser desfeita."
    );
    if (!confirmado) return;

    setErro(null);
    startTransition(async () => {
      const resultado = await excluirPaciente(id);
      if (!resultado.ok) {
        setErro(resultado.error ?? "Não foi possível excluir o paciente.");
        return;
      }
      router.push("/dashboard/pacientes");
      router.refresh();
    });
  }

  return (
    <div className="max-w-lg">
      <button
        onClick={handleClick}
        disabled={pendente}
        className="text-sm text-red-600 hover:underline disabled:opacity-60"
      >
        {pendente ? "Excluindo..." : "Excluir paciente"}
      </button>
      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
          {erro}
        </p>
      )}
    </div>
  );
}
