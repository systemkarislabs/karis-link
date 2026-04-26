# Política de Segurança — Karis Link

Este documento descreve as práticas de segurança implementadas no projeto e as
ações operacionais necessárias quando o time de ops faz deploy ou rotação de
credenciais.

---

## 1. Variáveis de ambiente sensíveis

| Variável | Função | Onde usar |
|----------|--------|-----------|
| `AUTH_SECRET` | Assina os JWTs de sessão e o cookie de tracking | **Obrigatória** em produção |
| `DATABASE_URL` | URL do Postgres (com pooler em Supabase) | Obrigatória |
| `DIRECT_URL` | URL direta do Postgres para `prisma migrate` | Recomendada |
| `NEXT_PUBLIC_BASE_URL` | URL base da aplicação (gera links de QR/bio) | Obrigatória em produção |
| `RESEND_API_KEY` | Envio de e-mail de recuperação de senha | Obrigatória se usar recuperação |
| `EMAIL_FROM` | Remetente do e-mail (default `onboarding@resend.dev`) | Opcional |
| `SUPER_ADMIN_USER` / `SUPER_ADMIN_PASS` | Credenciais iniciais do super-admin (fallback) | Opcional após criar conta no DB |

> ⚠️ **Nunca** comite `.env`, `.env.local`, `.env.production` etc. O `.gitignore`
> já bloqueia esses arquivos. Em caso de vazamento, **rotacione todas as chaves**
> imediatamente.

---

## 2. Headers de segurança

Aplicados globalmente em `next.config.ts`:

- `Content-Security-Policy` (relaxada — ainda permite `unsafe-inline` em styles
  porque o app usa muitos `style` inline; migrar progressivamente para CSS).
- `X-Frame-Options: SAMEORIGIN` — bloqueia clickjacking.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` — bloqueia camera, microfone, geolocalização e FLoC.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` — força
  HTTPS por 1 ano em browsers que já visitaram o site.

Rotas administrativas (`/super-admin`, `/[slug]/admin`, login e recuperação)
recebem adicionalmente `X-Robots-Tag: noindex, nofollow`.

---

## 3. Autenticação

- **Senhas armazenadas como bcrypt** (cost factor 12). Hash legado (texto plano
  ou outros formatos) é detectado e atualizado automaticamente no próximo
  login bem-sucedido.
- **Sessões em JWT** assinado com HS256 (`jose`), TTL de 7 dias, cookies
  `httpOnly` + `secure` + `sameSite=lax`.
- **Super-admin** tem cookie separado (`kl_super`) do tenant (`kl_session`).
- **Tenant inativo** força logout no próximo `requireTenantAuth`.

### Recuperação de senha

- Token de 32 bytes (256 bits) gerado por `crypto.randomBytes`.
- Apenas o **hash SHA-256** é gravado no DB.
- Expiração de 30 minutos.
- Single-use: tokens anteriores do mesmo tenant são invalidados após uso.
- Resposta sempre genérica para não vazar quais e-mails estão cadastrados.

---

## 4. Rate limiting

Implementado em `src/lib/rate-limit.ts` com **store no Postgres** (tabela
`RateLimitBucket`) e **fallback em-memória** caso a tabela não exista.

| Escopo | Limite | Janela |
|--------|--------|--------|
| `super-login` | 8 tentativas | 10 min |
| `tenant-login` | 8 tentativas | 10 min |
| `tenant-recovery` | 5 solicitações | 30 min |

GC oportunista de buckets vencidos (5% das chamadas).

---

## 5. Trilha de auditoria

Eventos sensíveis registrados na tabela `AuditLog` via `logAuditEvent()`
(arquivo `src/lib/audit.ts`):

- `super_login_success` / `super_login_failure` / `super_logout`
- `super_credentials_update`
- `tenant_create` / `tenant_toggle` / `tenant_delete`
- `tenant_login_success` / `tenant_login_failure`
- `tenant_password_recovery_request` / `tenant_password_reset_success`
- `seller_create` / `seller_update` / `seller_delete`
- `qrcode_create` / `qrcode_delete`

Cada registro inclui IP da requisição, ator (username), tenant relacionado e
metadata em JSON. **Falha de auditoria nunca quebra a operação principal** —
apenas loga em console como fallback.

---

## 6. Cookies

| Nome | Tipo | TTL | Uso |
|------|------|-----|-----|
| `kl_session` | JWT HS256 (httpOnly, secure, lax) | 7 dias | Sessão de tenant |
| `kl_super` | JWT HS256 (httpOnly, secure, lax) | 7 dias | Sessão super-admin |
| `kl_tracking` | JWT HS256 (httpOnly, secure, lax) | 4 horas | Origem do clique (QR/bio) |

Todos usam o mesmo `AUTH_SECRET`.

---

## 7. Upload de imagens

`src/lib/image-validation.ts` valida:

- MIME types permitidos: `image/jpeg`, `image/png`, `image/webp`.
- Tamanho máximo: **2 MB**.

Imagens são gravadas como base64 no campo `Seller.image`. **Recomendação
futura**: migrar para Supabase Storage / S3 — base64 inflaciona o tamanho da
resposta da página pública e do banco.

---

## 8. Migração e deploy

### Antes do primeiro deploy com este commit

```bash
# Aplica novas tabelas: PasswordResetToken, RateLimitBucket, AuditLog
npx prisma migrate deploy
# (ou em dev:)
npx prisma migrate dev
```

Sem essa migração, o código continua funcionando porque os helpers
(`assertRateLimit`, `logAuditEvent`) caem para fallback em-memória/console — mas
você perde a proteção real de rate limiting e a trilha de auditoria.

### Em ambientes serverless (Vercel/Netlify Functions)

A tabela `RateLimitBucket` é **essencial**, porque buckets em-memória não
sobrevivem a cold-starts e o limite vira placebo.

---

## 9. Reportar vulnerabilidades

Envie um e-mail privado para `seguranca@karislabs.com` (ou abra um security
advisory no GitHub) descrevendo:

1. Como reproduzir.
2. Qual o impacto observado.
3. Sua sugestão de mitigação (se houver).

Não abra issues públicos para vulnerabilidades.
