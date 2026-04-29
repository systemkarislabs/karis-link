import Link from 'next/link';
import { requireSuperAuth } from '@/lib/auth';
import { ensureTenantLogoColumn } from '@/lib/db-compat';
import prisma from '@/lib/prisma';
import { createTenant, deleteTenant, toggleTenant, updateTenantAdminPassword, updateTenantLogo } from './actions';
import AdminSidebar from '@/components/AdminSidebar';
import CompanyLogoField from '@/components/CompanyLogoField';
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton';
import { Icon } from '@/components/Icon';
import { buildTenantPublicUrl } from '@/lib/public-url';

export const dynamic = 'force-dynamic';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function SuperAdminPage() {
  await requireSuperAuth();
  await ensureTenantLogoColumn();

  const tenants = await prisma.tenant.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      adminUser: true,
      logo: true,
      active: true,
      _count: { select: { sellers: true } },
    },
  });

  const activeCount = tenants.filter((t) => t.active).length;
  const totalSellers = tenants.reduce((sum, t) => sum + t._count.sellers, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar isSuper />

      <main className="main-content kl-page-enter">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
            Dashboard Gerencial
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-soft)' }}>
            Visão geral de todas as empresas integradas ao ecossistema.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stat cards */}
          <div className="kl-kpi-grid">
            {[
              { label: 'Empresas', value: String(tenants.length), icon: 'building' as const, color: '#0f1c3f', bg: 'rgba(15,28,63,0.08)' },
              { label: 'Ativas', value: String(activeCount), icon: 'power' as const, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Vendedores', value: String(totalSellers), icon: 'users' as const, color: '#3b82f6', bg: '#eff6ff' },
              { label: 'Inativas', value: String(tenants.length - activeCount), icon: 'lock' as const, color: '#f59e0b', bg: '#fffbeb' },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '18px 20px',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                    {card.label}
                  </span>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={card.icon} size={14} color={card.color} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Companies table + Add form */}
          <div className="kl-main-form-grid">
            {/* Companies table */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Empresas Cadastradas
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 600 }}>
                  {tenants.length} {tenants.length === 1 ? 'empresa' : 'empresas'}
                </span>
              </div>

              {tenants.length === 0 ? (
                <div style={{ padding: '48px 22px', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Icon name="building" size={26} color="#16a34a" />
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-soft)' }}>Nenhuma empresa cadastrada ainda.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Empresa', 'Slug', 'Admin', 'Vendedores', 'Status', 'Ações'].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '10px 16px',
                              textAlign: h === 'Vendedores' || h === 'Status' ? 'center' : 'left',
                              fontWeight: 700,
                              fontSize: 11,
                              color: 'var(--text-soft)',
                              letterSpacing: '.03em',
                              textTransform: 'uppercase',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant) => (
                        <tr key={tenant.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {tenant.logo ? (
                                <img
                                  src={tenant.logo}
                                  alt={tenant.name}
                                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, opacity: tenant.active ? 1 : 0.5 }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: tenant.active ? '#0f1c3f22' : '#f1f5f9',
                                    color: tenant.active ? '#0f1c3f' : '#94a3b8',
                                    border: `1.5px solid ${tenant.active ? '#0f1c3f44' : '#e2e8f0'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  {initials(tenant.name)}
                                </div>
                              )}
                              <span style={{ fontWeight: 700, color: 'var(--text-main)', opacity: tenant.active ? 1 : 0.6 }}>
                                {tenant.name}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontSize: 12,
                                color: 'var(--text-soft)',
                                background: 'var(--bg-main)',
                                padding: '2px 6px',
                                borderRadius: 4,
                              }}
                            >
                              /{tenant.slug}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-soft)', fontSize: 12 }}>{tenant.adminUser}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-main)' }}>
                            {tenant._count.sellers}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                background: tenant.active ? '#f0fdf4' : '#f1f5f9',
                                color: tenant.active ? '#15803d' : '#475569',
                                border: `1px solid ${tenant.active ? '#bbf7d0' : '#e2e8f0'}`,
                              }}
                            >
                              {tenant.active ? 'Ativa' : 'Inativa'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Link
                                href={buildTenantPublicUrl(tenant.slug)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Acessar página pública"
                                style={{
                                  width: 30,
                                  height: 30,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid var(--border)',
                                  borderRadius: 7,
                                  background: 'var(--card-bg)',
                                  color: 'var(--text-soft)',
                                  textDecoration: 'none',
                                }}
                              >
                                <Icon name="external" size={13} />
                              </Link>

                              <form action={toggleTenant.bind(null, tenant.id, tenant.active)} style={{ margin: 0 }}>
                                <button
                                  type="submit"
                                  title={tenant.active ? 'Desativar' : 'Ativar'}
                                  style={{
                                    width: 30,
                                    height: 30,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--border)',
                                    borderRadius: 7,
                                    background: 'var(--card-bg)',
                                    color: tenant.active ? '#f59e0b' : '#16a34a',
                                    cursor: 'pointer',
                                    padding: 0,
                                  }}
                                >
                                  <Icon name="power" size={13} />
                                </button>
                              </form>

                              <form action={deleteTenant} style={{ margin: 0 }}>
                                <input type="hidden" name="id" value={tenant.id} />
                                <ConfirmSubmitButton
                                  message={`Excluir definitivamente a empresa "${tenant.name}"? Todos os vendedores, campanhas e cliques serão removidos. Esta ação é irreversível.`}
                                  ariaLabel={`Excluir empresa ${tenant.name}`}
                                  style={{
                                    width: 30,
                                    height: 30,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #fecdd3',
                                    borderRadius: 7,
                                    background: '#fff1f2',
                                    color: '#be123c',
                                    cursor: 'pointer',
                                    padding: 0,
                                  }}
                                >
                                  <Icon name="trash" size={13} />
                                </ConfirmSubmitButton>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right column: add company + per-tenant management */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 22px', boxShadow: 'var(--shadow-soft)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Cadastrar Empresa
                </h3>
                <form action={createTenant} style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Nome da empresa</label>
                    <input name="name" placeholder="Ex: Karis Labs" required className="kl-soft-field" />
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: 11, lineHeight: 1.5 }}>
                    O link é gerado automaticamente. Ex: Texpar Malhas → /texparmalhas
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Usuário administrador</label>
                    <input name="adminUser" placeholder="admin" required className="kl-soft-field" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Senha inicial</label>
                    <input name="adminPass" type="password" placeholder="••••••••" required className="kl-soft-field" />
                  </div>
                  <CompanyLogoField label="Logo da empresa" />
                  <button
                    type="submit"
                    style={{
                      height: 40,
                      background: '#16a34a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    <Icon name="plus" size={14} color="#fff" />
                    Cadastrar empresa
                  </button>
                </form>
              </div>

              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '16px 18px',
                    boxShadow: 'var(--shadow-soft)',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12 }}>
                    {tenant.name}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <form action={updateTenantLogo} style={{ display: 'grid', gap: 8 }}>
                      <input type="hidden" name="id" value={tenant.id} />
                      <CompanyLogoField currentLogo={tenant.logo ?? undefined} label="Logo" compact />
                      <button type="submit" className="kl-ghost-button kl-press" style={{ width: '100%', fontSize: 12 }}>
                        <Icon name="photo" size={13} />
                        Atualizar logo
                      </button>
                    </form>
                    <form action={updateTenantAdminPassword} style={{ position: 'relative' }}>
                      <input type="hidden" name="id" value={tenant.id} />
                      <input
                        name="adminPass"
                        type="password"
                        placeholder="Nova senha"
                        required
                        minLength={8}
                        className="kl-soft-field"
                        style={{ paddingRight: 42, fontSize: 13 }}
                      />
                      <button
                        type="submit"
                        aria-label={`Atualizar senha de ${tenant.name}`}
                        className="kl-press"
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: 7,
                          width: 30,
                          height: 30,
                          display: 'grid',
                          placeItems: 'center',
                          border: 0,
                          borderRadius: 7,
                          background: 'transparent',
                          color: 'var(--brand-accent)',
                          cursor: 'pointer',
                        }}
                      >
                        <Icon name="key" size={15} />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
