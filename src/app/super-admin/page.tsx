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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar isSuper />

      <main className="main-content kl-page-enter">
        <div className="kl-admin-wide">
          <header style={{ marginBottom: 36 }}>
            <h1 className="kl-panel-title">Dashboard Gerencial</h1>
            <p className="kl-panel-subtitle">Visão geral de todas as empresas integradas ao ecossistema.</p>
          </header>

          <div className="kl-dashboard-grid">
            <section className="kl-card super-admin-form-card" style={{ padding: 32 }}>
              <div className="kl-card-header">
                <span className="kl-card-icon">
                  <Icon name="home" size={20} />
                </span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, letterSpacing: '-0.04em' }}>
                    Cadastrar Empresa
                  </h2>
                  <p style={{ margin: '2px 0 0', color: '#71717a', fontSize: 12 }}>
                    Nova operação no Karis Link
                  </p>
                </div>
              </div>

              <form action={createTenant} style={{ display: 'grid', gap: 13 }}>
                <input name="name" placeholder="Nome da empresa" required className="kl-soft-field" />
                <p style={{ margin: '-4px 0 2px', color: 'var(--text-soft)', fontSize: 12, lineHeight: 1.45 }}>
                  O link sera gerado automaticamente pelo nome junto. Ex: Texpar Malhas vira /texparmalhas.
                </p>
                <input name="adminUser" placeholder="Usuário administrador" required className="kl-soft-field" />
                <input name="adminPass" type="password" placeholder="Senha inicial" required className="kl-soft-field" />
                <CompanyLogoField label="Logo da empresa" />
                <button type="submit" className="kl-green-button kl-press" style={{ marginTop: 4 }}>
                  Cadastrar empresa
                </button>
              </form>
            </section>

            <section>
              <h2 style={{ margin: '0 0 16px 2px', fontSize: 15, fontWeight: 900, letterSpacing: '-0.035em' }}>
                Empresas Ativas
              </h2>

              <div className="kl-tenant-list">
                {tenants.map((tenant) => (
                  <article key={tenant.id} className="kl-card kl-card-hover kl-tenant-card super-admin-tenant-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      {tenant.logo ? (
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '999px',
                            border: '1px solid #e4e4e7',
                            background: '#ffffff',
                            overflow: 'hidden',
                            flexShrink: 0,
                            opacity: tenant.active ? 1 : 0.58,
                          }}
                        >
                          <img
                            src={tenant.logo}
                            alt={`Logo ${tenant.name}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div className="kl-mini-avatar" style={!tenant.active ? { background: '#f4f4f5', borderColor: '#e4e4e7', color: '#a1a1aa' } : undefined}>
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.05em' }}>
                          {tenant.name}
                        </h3>
                        <p style={{ margin: '2px 0 0', color: '#71717a', fontSize: 12 }}>
                          /{tenant.slug} · {tenant._count.sellers} vendedores
                        </p>
                        <p style={{ margin: '2px 0 0', color: '#71717a', fontSize: 12 }}>
                          Admin: {tenant.adminUser}
                        </p>
                      </div>
                    </div>

                    <div className="kl-tenant-actions super-admin-tenant-actions">
                      <form action={updateTenantLogo} style={{ gridColumn: '1 / -1', display: 'grid', gap: 10 }}>
                        <input type="hidden" name="id" value={tenant.id} />
                        <CompanyLogoField currentLogo={tenant.logo} label="Logo da empresa" compact />
                        <button type="submit" className="kl-ghost-button kl-press" style={{ width: '100%' }}>
                          <Icon name="photo" size={14} />
                          Atualizar logo
                        </button>
                      </form>

                      <form action={toggleTenant.bind(null, tenant.id, tenant.active)}>
                        <button type="submit" className={`kl-ghost-button kl-press ${tenant.active ? 'kl-warning-button' : ''}`} style={{ width: '100%' }}>
                          <Icon name="power" size={14} />
                          {tenant.active ? 'Desativar' : 'Ativar'}
                        </button>
                      </form>

                      <Link href={buildTenantPublicUrl(tenant.slug)} target="_blank" className="kl-ghost-button kl-press">
                        <Icon name="arrowRight" size={14} />
                        Acessar
                      </Link>

                      <form action={updateTenantAdminPassword} style={{ gridColumn: '1 / -1', position: 'relative' }}>
                        <input type="hidden" name="id" value={tenant.id} />
                        <input
                          name="adminPass"
                          type="password"
                          placeholder="Nova senha do cliente"
                          required
                          minLength={8}
                          className="kl-soft-field"
                          style={{ paddingRight: 42 }}
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
                            borderRadius: 9,
                            background: 'transparent',
                            color: 'var(--brand-accent)',
                            cursor: 'pointer',
                          }}
                        >
                          <Icon name="key" size={16} />
                        </button>
                      </form>

                      <form action={deleteTenant} style={{ gridColumn: '1 / -1' }}>
                        <input type="hidden" name="id" value={tenant.id} />
                        <ConfirmSubmitButton
                          message={`Excluir definitivamente a empresa "${tenant.name}"? Todos os vendedores, campanhas e cliques serão removidos. Esta ação é irreversível.`}
                          ariaLabel={`Excluir empresa ${tenant.name}`}
                          className="kl-ghost-button kl-danger-button kl-press"
                          style={{ width: '100%' }}
                        >
                          <Icon name="trash" size={14} />
                          Excluir empresa
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
