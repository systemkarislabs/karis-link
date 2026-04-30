# Karis Link

Karis Link é uma plataforma multiempresa para criar páginas públicas de atendimento via WhatsApp e medir a origem dos leads por campanhas de QR Code e bio do Instagram.

## Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- PostgreSQL
- Supabase Storage para novos uploads de logos e fotos
- Resend para recuperação de senha por e-mail
- Railway como ambiente principal de deploy

## Fluxo principal

- Página pública da empresa: `/{slug}`
- Link rastreável de QR Code: `/{slug}/go/{codigo}`
- Link rastreável de bio: `/{slug}/bio/{codigo}`
- Admin da empresa: `/{slug}/admin`
- Super admin: `/super-admin`

O acesso direto em `/{slug}` exibe a página pública, mas não entra nas métricas rastreáveis. As métricas principais contam apenas visitas vindas de QR Code ou Bio Instagram e conversões quando o visitante escolhe um vendedor após entrar por um desses links.

## Comandos

```bash
npm install
npx prisma generate
npx prisma validate
npm run lint
npm run build
npm run dev
```

Para aplicar schema em ambiente de desenvolvimento:

```bash
npx prisma db push
```

## Variáveis de ambiente

Use `.env.example` como base. Em produção, configure no Railway:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_BASE_URL`
- `SUPER_ADMIN_USER`
- `SUPER_ADMIN_PASS` ou `SUPER_ADMIN_PASS_HASH`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

O bucket `SUPABASE_STORAGE_BUCKET` deve ser público, pois logos de empresas e fotos de vendedores aparecem na página pública.

## Deploy Railway

1. Configure as variáveis de ambiente.
2. Garanta que o banco PostgreSQL esteja acessível por `DATABASE_URL`.
3. Rode `npx prisma db push` ou a estratégia de migração adotada para produção.
4. Faça push para o repositório conectado ao Railway.

## Segurança de sessão

As áreas administrativas usam cookies `httpOnly`, `secure` em produção e `sameSite: strict`. Ao sair do painel ou restaurar página pelo botão voltar, o app valida a sessão no servidor e redireciona para login quando necessário.

## Uploads

Novos uploads de logo e foto são validados por MIME, tamanho e magic bytes, depois enviados para Supabase Storage. Campos antigos com `data:image/...` continuam renderizando para compatibilidade, mas novos cadastros devem salvar URLs do storage.
