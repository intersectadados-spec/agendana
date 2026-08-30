# Guia de deploy — AgendAna

Este roteiro assume contas **novas** de Supabase, GitHub e Vercel (separadas do outro sistema).

## 1. Criar o projeto no Supabase

1. Acesse https://supabase.com e crie um novo projeto (nova conta ou organização separada).
2. Anote a senha do banco que você definir — vai precisar dela raramente, mas guarde em local seguro.
3. Espere o projeto terminar de provisionar (1–2 minutos).
4. Vá em **SQL Editor** → **New query**, cole todo o conteúdo do arquivo `supabase/schema.sql` e clique em **Run**.
   - Isso cria as tabelas `pacientes` e `agendamentos` já com a segurança (RLS) configurada.
5. Vá em **Authentication → Users → Add user** e crie o login da Ana Paula (e-mail + senha). É esse e-mail/senha que ela vai usar para entrar no sistema.
6. Vá em **Project Settings → API** e copie três valores, você vai usar no passo 3:
   - **Project URL**
   - **anon public key**
   - **service_role key** (mantenha em segredo, nunca exponha no navegador)

## 2. Subir o código para o GitHub

1. Crie um repositório novo e **vazio** no GitHub (ex: `agendana`), na conta que você quer usar para esse projeto.
2. Na pasta do projeto, no seu computador:

```bash
git init
git add .
git commit -m "primeira versão do AgendAna"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/agendana.git
git push -u origin main
```

## 3. Deploy na Vercel

1. Acesse https://vercel.com, entre com a conta que vai hospedar esse projeto (pode ser diferente da conta do outro sistema).
2. Clique em **Add New → Project** e importe o repositório `agendana` do GitHub.
3. Na tela de configuração, abra **Environment Variables** e adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` → a Project URL do passo 1.6
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → a anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` → a service_role key
4. Clique em **Deploy** e aguarde o build terminar (2–4 minutos).
5. Ao concluir, a Vercel te dá uma URL pública (ex: `agendana.vercel.app`) — é o endereço que a Ana Paula vai acessar e favoritar no celular/computador.

## 4. Primeiro acesso

1. Abra a URL da Vercel, entre com o e-mail e senha criados no passo 1.5.
2. Cadastre o primeiro paciente em **Pacientes → Novo paciente**.
3. Crie o primeiro agendamento em **Agenda → Novo agendamento** — se marcar recorrência semanal ou quinzenal, o sistema já gera as 12 próximas sessões automaticamente.

## 5. Sobre o número de WhatsApp

O telefone do paciente deve ser cadastrado só com números, com código do país e DDD (ex: `5551999998888`) para o botão **Confirmar WhatsApp** funcionar corretamente — ele monta um link `wa.me` com uma mensagem de confirmação já escrita.

## 6. Domínio próprio (opcional)

Se quiser um endereço tipo `agenda.psicotomacheski.com.br` em vez do `.vercel.app`, isso se configura em **Project Settings → Domains** na Vercel, apontando o DNS do domínio comprado (Registro.br, GoDaddy etc.) para a Vercel.

## Dúvidas comuns

- **Esqueceu a senha de login?** Redefina em Supabase → Authentication → Users → clique na usuária → Reset password.
- **Precisa trocar a cor rosa?** É a variável `blush` em `tailwind.config.ts` (`#FFC2D1`).
- **Quer adicionar uma segunda profissional?** Hoje o sistema assume uma única usuária; dá pra evoluir depois com papéis (como no outro sistema), mas não faz parte deste escopo.
