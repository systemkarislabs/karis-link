type RecoveryEmailParams = {
  to: string;
  tenantName: string;
  username: string;
  resetUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendPasswordRecoveryEmail({ to, tenantName, username, resetUrl }: RecoveryEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Karis Negocios <contatos@karisnegocios.com.br>';

  if (!apiKey) {
    throw new Error('Envio de e-mail nao configurado. Configure RESEND_API_KEY no Railway.');
  }

  const safeTenantName = escapeHtml(tenantName);
  const safeUsername = escapeHtml(username);
  const safeResetUrl = escapeHtml(resetUrl);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Recuperacao de senha - ${tenantName}`,
      text: [
        `Ola, ${tenantName}.`,
        '',
        `Usuario: ${username}`,
        `Acesse este link para criar uma nova senha: ${resetUrl}`,
        '',
        'O link expira em 1 hora. Se voce nao solicitou a recuperacao, ignore esta mensagem.',
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h2 style="margin: 0 0 12px;">Recuperacao de senha</h2>
          <p>Ola, <strong>${safeTenantName}</strong>.</p>
          <p>Recebemos uma solicitacao para redefinir a senha do painel da empresa.</p>
          <p><strong>Usuario:</strong> ${safeUsername}</p>
          <p>
            <a href="${safeResetUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;">
              Criar nova senha
            </a>
          </p>
          <p style="font-size:13px;color:#64748b;">Este link expira em 1 hora. Se voce nao solicitou a recuperacao, ignore esta mensagem.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel enviar o e-mail agora. Verifique o remetente configurado no Resend e tente novamente.');
  }
}
