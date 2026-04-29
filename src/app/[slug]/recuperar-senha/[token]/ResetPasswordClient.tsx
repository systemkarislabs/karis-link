'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { resetTenantPassword } from '../actions';

type Props = {
  slug: string;
  token: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="kl-auth-submit">
      {pending ? 'Salvando...' : 'Criar nova senha'}
    </button>
  );
}

export default function ResetPasswordClient({ slug, token }: Props) {
  const [state, action] = useActionState(resetTenantPassword, null);

  return (
    <main className="kl-auth-shell">
      <section className="kl-auth-card">
        <div className="kl-auth-mark">K</div>
        <h1>Nova senha</h1>
        <p>Crie uma nova senha para acessar o painel da empresa.</p>

        {state?.error ? <div className="kl-auth-alert kl-auth-alert-error">{state.error}</div> : null}
        {state?.success ? <div className="kl-auth-alert kl-auth-alert-success">{state.success}</div> : null}

        <form action={action} className="kl-auth-form">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="token" value={token} />
          <label>
            Nova senha
            <input name="password" type="password" minLength={8} required autoComplete="new-password" />
          </label>
          <label>
            Confirmar nova senha
            <input name="confirmPassword" type="password" minLength={8} required autoComplete="new-password" />
          </label>
          <SubmitButton />
        </form>

        <Link href={`/${slug}/login`} className="kl-auth-link">
          Ir para o login
        </Link>
      </section>
    </main>
  );
}
