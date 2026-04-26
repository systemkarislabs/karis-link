import prisma from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import SellerImageField from '@/components/SellerImageField';
import Link from 'next/link';
import { updateSeller } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditSellerPage(props: any) {
  const params = await props.params;
  const { slug, sellerId } = params;
  const { tenantId } = await requireTenantAuth(slug);

  const [tenant, seller] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.seller.findFirst({
      where: { id: sellerId, tenantId },
    }),
  ]);

  if (!seller) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
        <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

        <main className="main-content">
          <div
            style={{
              background: 'var(--card-bg)',
              borderRadius: 20,
              padding: 32,
              border: '1px solid var(--border)',
              maxWidth: 560,
            }}
          >
            <h1 style={{ margin: '0 0 12px', fontSize: 24, color: 'var(--text-main)' }}>Vendedor não encontrado</h1>
            <p style={{ margin: '0 0 20px', color: 'var(--sidebar-text)' }}>
              Esse cadastro não existe mais ou não pertence a esta empresa.
            </p>
            <Link
              href={`/${slug}/admin/vendedores`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 18px',
                borderRadius: 12,
                textDecoration: 'none',
                background: 'var(--sidebar-active-text)',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              Voltar para vendedores
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex' }}>
      <AdminSidebar slug={slug} tenantName={tenant?.name} isSuper={false} />

      <main className="main-content">
        <header style={{ marginBottom: 28 }}>
          <Link
            href={`/${slug}/admin/vendedores`}
            style={{
              display: 'inline-flex',
              marginBottom: 16,
              color: 'var(--sidebar-active-text)',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Voltar para vendedores
          </Link>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>Editar vendedor</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--sidebar-text)' }}>
            Atualize o nome, o WhatsApp e a foto para manter a página pública sempre correta.
          </p>
        </header>

        <section
          style={{
            background: 'var(--card-bg)',
            borderRadius: 22,
            padding: 32,
            border: '1px solid var(--border)',
            maxWidth: 760,
          }}
        >
          <form action={updateSeller} style={{ display: 'grid', gap: 20 }}>
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={seller.id} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>Nome do vendedor</label>
                <input
                  name="name"
                  defaultValue={seller.name}
                  required
                  style={{
                    padding: '13px 16px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>WhatsApp</label>
                <input
                  name="phone"
                  defaultValue={seller.phone}
                  required
                  style={{
                    padding: '13px 16px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>Foto do vendedor</div>

              {seller.image ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <img
                    src={seller.image}
                    alt={seller.name}
                    style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border)' }}
                  />
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--sidebar-text)', fontSize: 14 }}>
                    <input type="checkbox" name="removeImage" />
                    Remover foto atual
                  </label>
                </div>
              ) : (
                <div style={{ fontSize: 14, color: 'var(--sidebar-text)' }}>Esse vendedor ainda não possui foto cadastrada.</div>
              )}

              <SellerImageField
                label="Nova foto (opcional)"
                helperText="Envie e ajuste uma nova imagem antes de salvar para substituir a foto atual."
              />
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="submit"
                style={{
                  background: 'var(--sidebar-active-text)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 20px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Salvar alterações
              </button>
              <Link
                href={`/${slug}/admin/vendedores`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  padding: '12px 20px',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Cancelar
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
