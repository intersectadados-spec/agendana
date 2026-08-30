"use server";

import { createClient } from "@/lib/supabase/server";
import { gerarDatasRecorrencia } from "@/lib/utils";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function revalidarAgendaEPaciente() {
  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard/pacientes/[id]", "page");
}

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

type ResultadoAgendamento = { ok: boolean; error?: string };

/** Verifica se já existe agendamento para essa data+horário. Retorna o nome do paciente conflitante, se houver. */
async function verificarConflito(
  supabase: ReturnType<typeof createClient>,
  data: string,
  horario: string,
  ignorarId?: string
): Promise<string | null> {
  let query = supabase
    .from("agendamentos")
    .select("id, pacientes(nome)")
    .eq("data", data)
    .eq("horario", horario);

  if (ignorarId) query = query.neq("id", ignorarId);

  const { data: conflitos } = await query;
  if (conflitos && conflitos.length > 0) {
    return (conflitos[0] as any).pacientes?.nome ?? "outro paciente";
  }
  return null;
}

export async function criarAgendamento(formData: FormData): Promise<ResultadoAgendamento> {
  const supabase = createClient();

  const paciente_id = formData.get("paciente_id") as string;
  const data = formData.get("data") as string;
  const horario = formData.get("horario") as string;
  const recorrencia = formData.get("recorrencia") as
    | "nenhuma"
    | "semanal"
    | "quinzenal";

  if (recorrencia === "nenhuma") {
    const nomeConflitante = await verificarConflito(supabase, data, horario);
    if (nomeConflitante) {
      return {
        ok: false,
        error: `Horário já ocupado pela paciente "${nomeConflitante}".`,
      };
    }

    const { error } = await supabase.from("agendamentos").insert({
      paciente_id,
      data,
      horario,
      recorrencia: "nenhuma",
    });
    if (error) return { ok: false, error: error.message };
  } else {
    const datas = gerarDatasRecorrencia(data, recorrencia, 12);

    // confere conflito em todas as datas antes de criar qualquer uma
    for (const d of datas) {
      const nomeConflitante = await verificarConflito(supabase, d, horario);
      if (nomeConflitante) {
        return {
          ok: false,
          error: `Horário já ocupado pela paciente "${nomeConflitante}" em ${d.split("-").reverse().join("/")}. Nenhuma sessão da recorrência foi criada — ajuste o horário e tente de novo.`,
        };
      }
    }

    const grupo_recorrencia = randomUUID();
    const linhas = datas.map((d) => ({
      paciente_id,
      data: d,
      horario,
      recorrencia,
      grupo_recorrencia,
    }));
    const { error } = await supabase.from("agendamentos").insert(linhas);
    if (error) return { ok: false, error: error.message };
  }

  revalidarAgendaEPaciente();
  return { ok: true };
}

export async function remarcarAgendamento(
  id: string,
  novaData: string,
  novoHorario: string
): Promise<ResultadoAgendamento> {
  const supabase = createClient();

  const nomeConflitante = await verificarConflito(supabase, novaData, novoHorario, id);
  if (nomeConflitante) {
    return {
      ok: false,
      error: `Horário já ocupado pela paciente "${nomeConflitante}".`,
    };
  }

  const { error } = await supabase
    .from("agendamentos")
    .update({ data: novaData, horario: novoHorario, confirmado_whatsapp: false })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidarAgendaEPaciente();
  return { ok: true };
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
  revalidarAgendaEPaciente();
}

export async function excluirAgendamento(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("agendamentos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidarAgendaEPaciente();
}

// AUTH --------------------------------------------------------------------

export async function sair() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
