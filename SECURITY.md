# Segurança - Karis Link

Este documento registra o estado atual das proteções do app e os cuidados operacionais para produção.

## Variáveis sensíveis

Nunca comite arquivos `.env`. Em caso de vazamento, rotacione imediatamente banco, `AUTH_SECRET`, Resend e Supabase.

| Variável | Uso |
| --- | --- |
| `AUTH_SECRET` | Assina cookies JWT de sessão e tracking |
| `DATABASE_URL` | Conexão principal com PostgreSQL |
| `DIRECT_URL` | Conexão direta para Prisma quando aplicável |
| `NEXT_PUBLIC_BASE_URL` | Domínio canônico dos links públicos |
| `RESEND_API_KEY` | Envio de recuperação de senha |
| `EMAIL_FROM` | Remetente, ex: `Karis Negocios <contatos@karisnegocios.com.br>` |
| `SUPABASE_URL` | Projeto Supabase usado no Storage |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave server-side para upload no Storage |
| `SUPABASE_STORAGE_BUCKET` | Bucket público de assets |

## Autenticação e sessão

- Senhas são armazenadas com bcrypt.
- Cookies administrativos são `httpOnly`, `secure` em produção e `sameSite: strict`.
- Super admin usa `kl_super`; admin da empresa usa `kl_session`.
- Áreas administrativas usam headers `no-store` para evitar cache sensível.
- Ao restaurar páginas pelo botão voltar ou bfcache, o client valida a sessão no servidor.
- Ao sair da área administrativa para fora do painel ou fechar a aba, o client tenta encerrar a sessão por `sendBeacon`.

## Recuperação de senha

- O envio é feito via Resend.
- Tokens são aleatórios, armazenados como hash e possuem expiração.
- Respostas públicas devem ser genéricas para evitar enumeração de contas.

## Upload de imagens

- Novos uploads são validados por MIME, tamanho máximo e magic bytes.
- Novas logos/fotos são salvas no Supabase Storage em bucket público.
- Campos antigos `data:image/...` continuam aceitos para compatibilidade.
- `SUPABASE_SERVICE_ROLE_KEY` deve existir apenas no servidor/Railway.

## Headers

O app aplica CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e HSTS via `next.config.ts`.

A CSP ainda permite `unsafe-inline` para estilos porque parte do app usa CSS inline. A remoção completa deve acontecer somente após migração visual validada.

## Auditoria e rate limit

Eventos críticos de login, logout, criação/alteração/exclusão de empresas, vendedores e campanhas são registrados em auditoria. Login e recuperação possuem rate limit com fallback, mas produção deve usar a tabela persistente.

## Checklist de produção

- `AUTH_SECRET` forte e único.
- Banco em PostgreSQL com TLS.
- Bucket Supabase `karis-link-assets` público para leitura.
- Service role configurada somente no Railway.
- Domínio `https://link.karisnegocios.com.br` configurado em `NEXT_PUBLIC_BASE_URL`.
- `npm run build`, `npm run lint` e `npx prisma validate` passando antes do deploy.
