'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { requestTenantPasswordRecovery } from './actions';

type Props = {
  slug: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="kl-auth-submit">
      {pending ? 'Enviando...' : 'Enviar recuperacao'}
    </button>
  );
}

export default function RecoveryRequestClient({ slug }: Props) {
  const [state, action] = useActionState(requestTenantPasswordRecovery, null);

  return (
    <main className="kl-auth-shell">
      <section className="kl-auth-card">
        <div className="kl-auth-mark">K</div>
        <h1>Recuperar senha</h1>
        <p>Informe o e-mail cadastrado para receber o link de redefinicao.</p>

        {state?.error ? <div className="kl-auth-alert kl-auth-alert-error">{state.error}</div> : null}
        {state?.success ? <div className="kl-auth-alert kl-auth-alert-success">{state.success}</div> : null}

        <form action={action} className="kl-auth-form">
          <input type="hidden" name="slug" value={slug} />
          <label>
            E-mail de recuperacao
            <input name="email" type="email" placeholder="email@empresa.com.br" required autoComplete="email" />
          </label>
          <SubmitButton />
        </form>

        <Link href={`/${slug}/login`} className="kl-auth-link">
          Voltar para o login
        </Link>
      </section>
    </main>
  );
}
