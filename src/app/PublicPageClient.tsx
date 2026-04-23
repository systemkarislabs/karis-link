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
      background: '#f8fafc',
      color: '#1e293b',
      fontFamily: "'Inter', sans-serif",
      padding: '60px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      
      {/* Logo Circular */}
      <div style={{
        width: '80px',
        height: '80px',
        background: '#000',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '32px',
        fontWeight: 800,
        marginBottom: '24px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        {tenantName.charAt(0).toUpperCase()}
      </div>

      {/* Header Centralizado */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
          Fale com um Especialista
        </h1>
        <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto', fontSize: '15px', lineHeight: 1.5 }}>
          Escolha um consultor disponível e inicie sua conversa agora mesmo.
        </p>
      </header>

      {/* Lista de Vendedores Estilo Card Clean */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        maxWidth: '420px'
      }}>
        {sellers.map((seller) => (
          <a
            key={seller.id}
            href={`/api/redirect?sellerId=${seller.id}&source=${source}&campaign=${campaign}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 24px',
              background: '#fff',
              borderRadius: '16px',
              textDecoration: 'none',
              color: '#1e293b',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              justifyContent: 'space-between'
            }}
            className="seller-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Foto ou Placeholder */}
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', background: '#f1f5f9' }}>
                {seller.image ? (
                  <img src={seller.image} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                )}
              </div>
              <span style={{ fontWeight: 600, fontSize: '16px' }}>{seller.name}</span>
            </div>

            {/* Ícone WhatsApp */}
            <div className="whatsapp-icon" style={{ color: '#22c55e' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.38 8.38 0 0 1 3.9.9L22 4z"/>
              </svg>
            </div>
          </a>
        ))}
      </div>

      {/* Estilos Globais para o Hover (Mudança de Cor) */}
      <style jsx global>{`
        .seller-card:hover {
          background: #020617 !important;
          color: #fff !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
        }
        .seller-card:hover .whatsapp-icon {
          color: #fff !important;
        }
        body { margin: 0; background: #f8fafc; }
      `}</style>
    </div>
  );
}
