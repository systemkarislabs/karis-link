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
      background: 'radial-gradient(circle at top left, #1e293b, #0f172a)',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
      padding: '60px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Header Premium */}
      <header style={{ textAlign: 'center', marginBottom: 48, maxWidth: 600 }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 900, 
          marginBottom: 12, 
          background: 'linear-gradient(to right, #60a5fa, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>
          {tenantName}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Escolha um consultor abaixo para iniciar seu atendimento personalizado via WhatsApp.
        </p>
      </header>

      {/* Grid de Vendedores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '20px',
        width: '100%',
        maxWidth: '480px'
      }}>
        {sellers.map((seller, index) => (
          <a
            key={seller.id}
            href={`/api/redirect?sellerId=${seller.id}&source=${source}&campaign=${campaign}`}
            style={{
              textDecoration: 'none',
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)';
              e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(0, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              {seller.image ? (
                <img 
                  src={seller.image} 
                  alt={seller.name} 
                  style={{ width: '64px', height: '64px', borderRadius: '20px', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '20px', 
                  background: 'linear-gradient(135deg, #334155, #1e293b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  👤
                </div>
              )}
              <div style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                width: '16px',
                height: '16px',
                background: '#10b981',
                borderRadius: '50%',
                border: '3px solid #0f172a',
                boxShadow: '0 0 10px #10b981'
              }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc', marginBottom: '4px' }}>
                {seller.name}
              </div>
              <div style={{ 
                fontSize: '0.85rem', 
                color: '#10b981', 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center',
                gap: '6px' 
              }}>
                <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }} />
                Disponível agora
              </div>
            </div>

            {/* Seta */}
            <div style={{ opacity: 0.4 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </a>
        ))}
      </div>

      {/* Footer Branding */}
      <footer style={{ marginTop: 'auto', paddingTop: '60px', opacity: 0.5, fontSize: '0.8rem', textAlign: 'center' }}>
        <p>Desenvolvido por <strong>Karis Link</strong></p>
      </footer>

      {/* Estilos Globais de Animação */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
