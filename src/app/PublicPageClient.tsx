'use client';

import React from 'react';

interface Seller {
  id: string;
  name: string;
  phone: string;
  image?: string | null;
}

interface PublicPageClientProps {
  tenantName: string;
  sellers: Seller[];
  slug: string;
  source: string;
  campaign: string;
}

export default function PublicPageClient({ tenantName, sellers, slug, source, campaign }: PublicPageClientProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#020617',
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%),
        radial-gradient(at 50% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%)
      `,
      color: '#fff',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '80px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflowX: 'hidden'
    }}>
      {/* Container Principal com Animação */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        animation: 'fadeIn 1s ease-out'
      }}>
        
        {/* Header de Alto Nível */}
        <header style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            borderRadius: '100px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            color: '#38bdf8',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '16px'
          }}>
            Plataforma Karis
          </div>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 900, 
            marginBottom: '16px',
            letterSpacing: '-0.04em',
            lineHeight: 1
          }}>
            {tenantName}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.125rem', fontWeight: 400 }}>
            Escolha um consultor para atendimento imediato.
          </p>
        </header>

        {/* Lista de Vendedores Estilo Premium */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sellers.map((seller, index) => (
            <a
              key={seller.id}
              href={`/api/redirect?sellerId=${seller.id}&source=${source}&campaign=${campaign}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                textDecoration: 'none',
                color: '#fff',
                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                animation: `slideIn 0.6s ease-out ${index * 0.1}s both`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Avatar com Borda Gradiente */}
              <div style={{ 
                position: 'relative',
                padding: '3px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
                marginRight: '20px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '17px',
                  overflow: 'hidden',
                  background: '#0f172a'
                }}>
                  {seller.image ? (
                    <img src={seller.image} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
                  )}
                </div>
                {/* Badge de Online */}
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '18px',
                  height: '18px',
                  background: '#10b981',
                  borderRadius: '50%',
                  border: '3px solid #020617',
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)'
                }} />
              </div>

              {/* Informações */}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                  {seller.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>Online via WhatsApp</span>
                </div>
              </div>

              {/* Ícone de Ação */}
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.03)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* Footer Minimalista */}
        <footer style={{ marginTop: '80px', textAlign: 'center', opacity: 0.3 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em' }}>
            Powered by <strong>KARIS LINK</strong>
          </p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        body { margin: 0; background: #020617; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
