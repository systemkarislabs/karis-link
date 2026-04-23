import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PublicTenantPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ source?: string; campaign?: string }>;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function WhatsAppIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.56 0 .28 5.28.28 11.79c0 2.08.54 4.11 1.57 5.91L0 24l6.48-1.7a11.8 11.8 0 0 0 5.59 1.42h.01c6.5 0 11.79-5.28 11.79-11.79 0-3.15-1.23-6.1-3.35-8.45Z"
        fill={color}
      />
      <path
        d="M17.03 13.93c-.27-.14-1.6-.79-1.85-.88-.25-.09-.44-.14-.62.14-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.14-1.13-.42-2.15-1.35-.8-.71-1.33-1.58-1.49-1.85-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.46.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.05-.22-.54-.45-.47-.62-.48h-.53c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.66 1.11 2.84c.14.18 1.92 2.94 4.66 4.12.65.28 1.16.44 1.56.56.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.27.23-.61.23-1.13.16-1.24-.06-.11-.25-.18-.52-.32Z"
        fill={color === '#ffffff' ? '#050816' : '#ffffff'}
      />
    </svg>
  );
}

export default async function PublicTenantPage({ params, searchParams }: PublicTenantPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slug = resolvedParams.slug;
  const source = resolvedSearchParams.source || 'direct';
  const campaign = resolvedSearchParams.campaign || 'none';

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) notFound();

  const sellers = await prisma.seller.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'asc' },
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, rgba(255,255,255,0.98) 0%, rgba(247,249,252,1) 38%, rgba(242,245,249,1) 100%)',
        color: '#0f172a',
        fontFamily: "'Inter', sans-serif",
        padding: '36px 20px 72px',
      }}
    >
      <title>{`DESIGN CLEAN ATIVO - ${tenant.name}`}</title>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto 10px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <a
          href={`/${slug}/login`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            borderRadius: '999px',
            textDecoration: 'none',
            background: 'rgba(255,255,255,0.55)',
            color: '#64748b',
            border: '1px solid rgba(219, 227, 238, 0.9)',
            boxShadow: '0 6px 14px rgba(148, 163, 184, 0.08)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}
        >
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '999px',
              background: 'rgba(226, 232, 240, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
            }}
          >
            ⚙
          </span>
          Acesso da empresa
        </a>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '999px',
            background: '#050816',
            border: '2px solid #22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '32px',
            fontWeight: 800,
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.16)',
            marginBottom: '22px',
          }}
        >
          {tenant.name.charAt(0).toUpperCase()}
        </div>

        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1
            style={{
              fontSize: '24px',
              lineHeight: 1.15,
              fontWeight: 800,
              color: '#172033',
              margin: '0 0 10px',
            }}
          >
            Fale com um Especialista
          </h1>
          <p
            style={{
              color: '#64748b',
              maxWidth: '360px',
              margin: '0 auto',
              fontSize: '15px',
              lineHeight: 1.35,
            }}
          >
            Escolha um consultor disponível e inicie sua conversa agora mesmo.
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {sellers.map((seller, index) => {
            const featured = index === 0;

            return (
              <a
                key={seller.id}
                href={`/api/redirect?sellerId=${seller.id}&source=${source}&campaign=${campaign}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '18px',
                  padding: '14px 18px',
                  background: featured ? '#050816' : '#ffffff',
                  color: featured ? '#ffffff' : '#172033',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  border: featured ? '1px solid #050816' : '1px solid #dbe3ee',
                  boxShadow: featured
                    ? '0 12px 26px rgba(5, 8, 22, 0.22)'
                    : '0 10px 24px rgba(148, 163, 184, 0.14)',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '999px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: featured
                        ? 'linear-gradient(135deg, #334155 0%, #94a3b8 100%)'
                        : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: featured ? '#ffffff' : '#334155',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  >
                    {seller.image ? (
                      <img
                        src={seller.image}
                        alt={seller.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      getInitials(seller.name)
                    )}
                  </div>

                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '16px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {seller.name}
                  </span>
                </div>

                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: featured ? 'rgba(255,255,255,0.08)' : 'rgba(34,197,94,0.08)',
                    flexShrink: 0,
                  }}
                >
                  <WhatsAppIcon color={featured ? '#ffffff' : '#22c55e'} />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
