import { addDays, addWeeks, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatCurrency(value: number | null | undefined) {
  return (value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDateBR(date: string) {
  // date vem como "yyyy-MM-dd" do Postgres
  const [y, m, d] = date.split("-").map(Number);
  return format(new Date(y, m - 1, d), "dd/MM/yyyy");
}

export function formatDateLong(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return format(new Date(y, m - 1, d), "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function toISODate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

/**
 * Gera as próximas datas de uma recorrência (semanal ou quinzenal),
 * incluindo a data inicial. quantidade = número total de sessões a criar.
 */
export function gerarDatasRecorrencia(
  dataInicial: string,
  recorrencia: "semanal" | "quinzenal",
  quantidade: number
): string[] {
  const [y, m, d] = dataInicial.split("-").map(Number);
  const inicio = new Date(y, m - 1, d);
  const passoSemanas = recorrencia === "semanal" ? 1 : 2;

  const datas: string[] = [];
  for (let i = 0; i < quantidade; i++) {
    datas.push(toISODate(addWeeks(inicio, i * passoSemanas)));
  }
  return datas;
}

/** Monta o link wa.me com mensagem pré-preenchida de confirmação */
export function linkConfirmacaoWhatsapp(
  telefone: string,
  nomePaciente: string,
  data: string,
  horario: string
) {
  const numero = telefone.replace(/\D/g, "");
  const dataFormatada = formatDateBR(data);
  const mensagem = `Olá, ${nomePaciente}! Aqui é do consultório da Ana Paula Koch Tomacheski. Confirmando sua consulta em ${dataFormatada} às ${horario.slice(
    0,
    5
  )}. Pode confirmar presença, por favor? 💗`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

/** true se a data de nascimento cai nos próximos `dias` dias (ignorando o ano) */
export function aniversarioProximo(
  dataNascimento: string,
  dias: number
): { proximo: boolean; emQuantosDias: number } {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const [, m, d] = dataNascimento.split("-").map(Number);

  let proximoAniversario = new Date(hoje.getFullYear(), m - 1, d);
  if (proximoAniversario < hoje) {
    proximoAniversario = new Date(hoje.getFullYear() + 1, m - 1, d);
  }
  const diffDias = Math.round(
    (proximoAniversario.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );
  return { proximo: diffDias <= dias, emQuantosDias: diffDias };
}
