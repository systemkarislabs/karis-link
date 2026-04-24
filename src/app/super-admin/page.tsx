import { requireSuperAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createTenant, deleteTenant, toggleTenant } from './actions';
import AdminSidebar from '@/components/AdminSidebar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  try {
    await requireSuperAuth();
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        active: true,
        createdAt: true,
        _count: { select: { sellers: true } },
      },
    });

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
        <AdminSidebar isSuper={true} />

        <main className="main-content">
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <header style={{ marginBottom: 40 }}>
              <img src="/karis-link-logo.png" alt="Karis Link" style={{ width: 176, marginBottom: 18, objectFit: 'contain' }} />
              <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Dashboard Gerencial</h1>
              <p style={{ color: 'var(--sidebar-text)', marginTop: 6 }}>Visão geral de todas as empresas integradas.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(360px, 0.95fr)', gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tenants.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: 'var(--card-bg)',
                      borderRadius: 18,
                      padding: '20px 24px',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 16,
                      boxShadow: 'var(--shadow-soft)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background: t.active ? '#f0fdf4' : '#f8fafc',
                          color: t.active ? '#16a34a' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--sidebar-text)' }}>
                          /{t.slug} · {t._count.sellers} vendedores
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <form action={toggleTenant.bind(null, t.id, t.active)}>
                        <button
                          type="submit"
                          style={{
                            fontSize: 12,
                            color: t.active ? '#b45309' : '#16a34a',
                            padding: '7px 12px',
                            borderRadius: 10,
                            background: t.active ? '#fef3c7' : '#dcfce7',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {t.active ? 'Desativar' : 'Ativar'}
                        </button>
                      </form>
                      <Link
                        href={`/${t.slug}`}
                        target="_blank"
                        style={{
                          fontSize: 12,
                          color: 'var(--sidebar-text)',
                          textDecoration: 'none',
                          padding: '7px 12px',
                          borderRadius: 10,
                          background: 'var(--bg-main)',
                          fontWeight: 700,
                        }}
                      >
                        Site
                      </Link>
                      <form action={deleteTenant}>
                        <input type="hidden" name="id" value={t.id} />
                        <button
                          type="submit"
                          style={{
                            fontSize: 12,
                            color: '#e11d48',
                            padding: '7px 12px',
                            borderRadius: 10,
                            background: '#fff1f2',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Excluir empresa
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: 32, border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)' }}>
                <img src="/karis-link-logo.png" alt="Karis Link" style={{ width: 164, marginBottom: 22, objectFit: 'contain' }} />
                <h3 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700, color: 'var(--text-main)' }}>Cadastrar empresa</h3>
                <p style={{ margin: '0 0 24px', color: 'var(--sidebar-text)', fontSize: 14 }}>
                  Cadastre uma nova operação no Karis Link e defina as credenciais iniciais da empresa.
                </p>

                <form action={createTenant} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <input
                    name="name"
                    placeholder="Nome da empresa"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      fontSize: 14,
                      outline: 'none',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <input
                    name="slug"
                    placeholder="Slug da empresa"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      fontSize: 14,
                      outline: 'none',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <input
                    name="adminUser"
                    placeholder="Usuário administrador"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      fontSize: 14,
                      outline: 'none',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <input
                    name="adminPass"
                    type="password"
                    placeholder="Senha inicial"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      fontSize: 14,
                      outline: 'none',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <input
                    name="recoveryEmail"
                    type="email"
                    placeholder="E-mail para recuperação de senha"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      fontSize: 14,
                      outline: 'none',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '14px',
                      borderRadius: 12,
                      background: 'var(--sidebar-active-text)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Cadastrar empresa
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (e: any) {
    if (e.message?.includes('NEXT_REDIRECT') || e.digest?.includes('NEXT_REDIRECT')) throw e;

    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#e11d48' }}>Erro Técnico Detectado</h2>
        <p>Por favor, envie este código para o suporte:</p>
        <pre style={{ background: '#f1f5f9', padding: 20, borderRadius: 8, overflow: 'auto' }}>
          {e.message || 'Erro desconhecido'}
        </pre>
      </div>
    );
  }
}
