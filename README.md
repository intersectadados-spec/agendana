# AgendAna

Sistema de agenda e financeiro para o consultório da psicóloga **Ana Paula Koch Tomacheski**.

Stack: Next.js 14 (App Router) + Supabase (Auth + Postgres) + Tailwind CSS.

## Funcionalidades

- Agenda de pacientes com marcação por dia
- Marcação recorrente (semanal ou quinzenal) — gera 12 sessões futuras de uma vez
- Controle financeiro mensal: preço da consulta, forma de pagamento (mensal/semanal), atendido e pago (valor manual), total recebido por paciente no mês
- Lembrete de aniversário dos pacientes (próximos 30 dias) no resumo
- Confirmação de consulta via WhatsApp com mensagem pronta (link `wa.me`)

## Rodando localmente

```bash
npm install
cp .env.local.example .env.local   # preencha com as chaves do seu projeto Supabase
npm run dev
```

Veja o passo a passo completo de configuração e deploy em **DEPLOY.md**.
