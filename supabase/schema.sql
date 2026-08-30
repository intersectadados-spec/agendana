-- AgendAna · Ana Paula Koch Tomacheski
-- Rode este script inteiro no SQL Editor do seu novo projeto Supabase

create extension if not exists "pgcrypto";

-- PACIENTES -----------------------------------------------------------
create table if not exists pacientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null, -- formato: 55DDDNUMERO (ex: 5551999998888) para link do WhatsApp
  data_nascimento date,
  preco_consulta numeric(10,2) not null default 0,
  frequencia_pagamento text not null default 'mensal' check (frequencia_pagamento in ('semanal', 'mensal')),
  observacoes text,
  criado_em timestamptz not null default now()
);

-- AGENDAMENTOS ----------------------------------------------------------
create table if not exists agendamentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  data date not null,
  horario time not null,
  recorrencia text not null default 'nenhuma' check (recorrencia in ('nenhuma', 'semanal', 'quinzenal')),
  grupo_recorrencia uuid, -- agrupa sessões geradas pela mesma recorrência
  status text not null default 'agendado' check (status in ('agendado', 'atendido', 'cancelado')),
  atendido boolean not null default false,
  pago boolean not null default false,
  valor_pago numeric(10,2),
  confirmado_whatsapp boolean not null default false,
  criado_em timestamptz not null default now()
);

create index if not exists idx_agendamentos_data on agendamentos(data);
create index if not exists idx_agendamentos_paciente on agendamentos(paciente_id);

-- SEGURANÇA (RLS) -------------------------------------------------------
-- Sistema de usuária única (a psicóloga). Qualquer usuário autenticado
-- no projeto Supabase tem acesso total às tabelas.
alter table pacientes enable row level security;
alter table agendamentos enable row level security;

create policy "acesso total autenticado - pacientes"
  on pacientes for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "acesso total autenticado - agendamentos"
  on agendamentos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- USUÁRIA -----------------------------------------------------------
-- Depois de rodar este script, crie a usuária (Ana Paula) em:
-- Authentication > Users > Add user (no painel do Supabase)
-- Use o e-mail e senha que ela vai usar para logar no sistema.
