import { requireSuperAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createTenant, deleteTenant, toggleTenant, updateTenantAdminPassword } from './actions';
import AdminSidebar from '@/components/AdminSidebar';
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  await requireSuperAuth();
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      adminUser: true,
      active: true,
      createdAt: true,
      _count: { select: { sellers: true } },
    },
  });

  return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
        <AdminSidebar isSuper={true} />

        <main className="main-content kl-page-enter">
          <div className="super-admin-shell" style={{ maxWidth: 1240, width: '100%', margin: '0 auto' }}>
            <header className="super-admin-header" style={{ marginBottom: 40 }}>
              <Image
                src="/karis-link-logo.png"
                alt="Karis Link"
                width={176}
                height={50}
                priority
                style={{ width: 176, maxWidth: '100%', height: 'auto', marginBottom: 18, objectFit: 'contain' }}
              />
              <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Dashboard Gerencial
              </h1>
              <p style={{ color: 'var(--sidebar-text)', marginTop: 6 }}>
                Visao geral de todas as empresas integradas.
              </p>
            </header>

            <div
              className="super-admin-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '320px minmax(0, 1fr)',
                gap: 24,
                alignItems: 'start',
              }}
            >
              <div
                className="super-admin-list"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 16,
                  minWidth: 0,
                  order: 2,
                }}
              >
                <h3
                  style={{
                    gridColumn: '1 / -1',
                    fontSize: 14,
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    margin: '0 0 2px 2px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Empresas Ativas
                </h3>
                {tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="super-admin-tenant-card kl-card kl-card-hover"
                    style={{
                      background: 'var(--card-bg)',
                      borderRadius: 16,
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: 18,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 14,
                          background: tenant.active ? '#ecfdf5' : '#f4f4f5',
                          color: tenant.active ? 'var(--brand-accent)' : '#a1a1aa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: 20,
                          border: tenant.active ? '1.5px solid #d1fae5' : '1.5px solid #e4e4e7',
                          flexShrink: 0,
                        }}
                      >
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', wordBreak: 'break-word', letterSpacing: '-0.03em' }}>
                          {tenant.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-soft)', wordBreak: 'break-word', marginTop: 2 }}>
                          /{tenant.slug} - {tenant._count.sellers} vendedores
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}>
                          Usuario admin: {tenant.adminUser}
                        </div>
                      </div>
                    </div>

                    <div
                      className="super-admin-tenant-actions"
                      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'center' }}
                    >
                      <form action={toggleTenant.bind(null, tenant.id, tenant.active)}>
                        <button
                          type="submit"
                          style={{
                            fontSize: 12,
                            color: tenant.active ? '#f59e0b' : '#10b981',
                            padding: 10,
                            width: '100%',
                            borderRadius: 10,
                            background: tenant.active ? '#fffbeb' : '#ecfdf5',
                            fontWeight: 700,
                            border: tenant.active ? '1px solid rgba(245,158,11,.3)' : '1px solid #d1fae5',
                            cursor: 'pointer',
                          }}
                        >
                          {tenant.active ? 'Desativar' : 'Ativar'}
                        </button>
                      </form>

                      <Link
                        href={`/${tenant.slug}`}
                        target="_blank"
                        style={{
                          fontSize: 12,
                          color: 'var(--sidebar-text)',
                          textDecoration: 'none',
                          padding: 10,
                          borderRadius: 10,
                          background: '#f4f4f5',
                          fontWeight: 700,
                          border: '1px solid var(--border)',
                          textAlign: 'center',
                        }}
                      >
                        Site
                      </Link>

                      <form action={deleteTenant}>
                        <input type="hidden" name="id" value={tenant.id} />
                        <ConfirmSubmitButton
                          message={`Excluir definitivamente a empresa "${tenant.name}"? Todos os vendedores, campanhas e cliques serão removidos. Esta ação é IRREVERSÍVEL.`}
                          ariaLabel={`Excluir empresa ${tenant.name}`}
                        style={{
                            fontSize: 12,
                            color: '#e11d48',
                            padding: 10,
                            width: '100%',
                            borderRadius: 10,
                            background: '#fff1f2',
                            fontWeight: 700,
                            border: '1px solid #fecdd3',
                            cursor: 'pointer',
                          }}
                        >
                          Excluir empresa
                        </ConfirmSubmitButton>
                      </form>

                      <form
                        action={updateTenantAdminPassword}
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          width: '100%',
                          marginTop: 4,
                          gridColumn: '1 / -1',
                        }}
                      >
                        <input type="hidden" name="id" value={tenant.id} />
                        <input
                          name="adminPass"
                          type="password"
                          placeholder="Nova senha do cliente"
                          required
                          minLength={8}
                          style={{
                            flex: '1 1 220px',
                            minWidth: 0,
                            padding: '9px 12px',
                            borderRadius: 10,
                            border: '1px solid var(--border)',
                            fontSize: 12,
                            outline: 'none',
                            background: 'var(--bg-main)',
                            color: 'var(--text-main)',
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            fontSize: 12,
                            color: '#fff',
                            padding: '9px 12px',
                            borderRadius: 10,
                            background: 'var(--sidebar-active-text)',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Atualizar senha
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="super-admin-form-card kl-surface"
                style={{
                  background: 'var(--card-bg)',
                  borderRadius: 16,
                  padding: 24,
                  minWidth: 0,
                  order: 1,
                }}
              >
                <Image
                  src="/karis-link-logo.png"
                  alt="Karis Link"
                  width={164}
                  height={46}
                  style={{ width: 164, maxWidth: '100%', height: 'auto', marginBottom: 22, objectFit: 'contain' }}
                />
                <h3 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700, color: 'var(--text-main)' }}>
                  Cadastrar empresa
                </h3>
                <p style={{ margin: '0 0 24px', color: 'var(--sidebar-text)', fontSize: 14 }}>
                  Cadastre uma nova operacao no Karis Link e defina as credenciais iniciais da empresa.
                </p>

                <form action={createTenant} style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
                  <input
                    name="name"
                    placeholder="Nome da empresa"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 14,
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
                      borderRadius: 14,
                      border: '1px solid var(--border)',
                      fontSize: 14,
                      outline: 'none',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <input
                    name="adminUser"
                    placeholder="Usuario administrador"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 14,
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
                      borderRadius: 14,
                      border: '1px solid var(--border)',
                      fontSize: 14,
                      outline: 'none',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <button
                    type="submit"
                    className="kl-action kl-action-primary kl-press"
                    style={{
                      padding: '14px',
                      border: 'none',
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
}
