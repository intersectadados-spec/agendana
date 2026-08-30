"use server";

import { createClient } from "@/lib/supabase/server";
import { gerarDatasRecorrencia } from "@/lib/utils";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// PACIENTES -------------------------------------------------------------

export async function criarPaciente(formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.from("pacientes").insert({
    nome: formData.get("nome") as string,
    telefone: formData.get("telefone") as string,
    data_nascimento: (formData.get("data_nascimento") as string) || null,
    preco_consulta: Number(formData.get("preco_consulta")) || 0,
    frequencia_pagamento: formData.get("frequencia_pagamento") as string,
    observacoes: (formData.get("observacoes") as string) || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/pacientes");
  redirect("/dashboard/pacientes");
}

export async function atualizarPaciente(id: string, formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase
    .from("pacientes")
    .update({
      nome: formData.get("nome") as string,
      telefone: formData.get("telefone") as string,
      data_nascimento: (formData.get("data_nascimento") as string) || null,
      preco_consulta: Number(formData.get("preco_consulta")) || 0,
      frequencia_pagamento: formData.get("frequencia_pagamento") as string,
      observacoes: (formData.get("observacoes") as string) || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/pacientes");
  redirect("/dashboard/pacientes");
}

export async function excluirPaciente(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("pacientes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/pacientes");
  redirect("/dashboard/pacientes");
}

// AGENDAMENTOS ------------------------------------------------------------

export async function criarAgendamento(formData: FormData) {
  const supabase = createClient();

  const paciente_id = formData.get("paciente_id") as string;
  const data = formData.get("data") as string;
  const horario = formData.get("horario") as string;
  const recorrencia = formData.get("recorrencia") as
    | "nenhuma"
    | "semanal"
    | "quinzenal";

  if (recorrencia === "nenhuma") {
    const { error } = await supabase.from("agendamentos").insert({
      paciente_id,
      data,
      horario,
      recorrencia: "nenhuma",
    });
    if (error) throw new Error(error.message);
  } else {
    // gera 12 sessões futuras a partir da data escolhida, agrupadas
    const grupo_recorrencia = randomUUID();
    const datas = gerarDatasRecorrencia(data, recorrencia, 12);
    const linhas = datas.map((d) => ({
      paciente_id,
      data: d,
      horario,
      recorrencia,
      grupo_recorrencia,
    }));
    const { error } = await supabase.from("agendamentos").insert(linhas);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard");
}

export async function atualizarStatusAgendamento(
  id: string,
  campos: Partial<{
    atendido: boolean;
    pago: boolean;
    valor_pago: number | null;
    status: string;
    confirmado_whatsapp: boolean;
  }>
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("agendamentos")
    .update(campos)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard/financeiro");
}

export async function excluirAgendamento(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("agendamentos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/agenda");
}

// AUTH --------------------------------------------------------------------

export async function sair() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
