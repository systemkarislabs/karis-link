"use client";
import React from 'react';
import './public.css';
import { Icon } from '@/components/Icon';

export const PublicPageClient = ({ sellers, sourceProp = 'direct', campaignProp = '' }: { sellers: any[], sourceProp?: string, campaignProp?: string }) => {
  return (
    <div className="public-body" style={{ position: 'relative' }}>
      {/* Botão Admin */}
      <a href="/admin" title="Acessar Painel" style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', boxShadow: 'var(--shadow-soft)', color: '#9ca3af', textDecoration: 'none', zIndex: 10 }}>
        <Icon name="lock" size={16} />
      </a>
      
      <div className="links-container">
        
        {/* Header/Perfil */}
        <div className="profile-section">
          <div className="profile-logo">K</div>
          <h1>Fale com um Especialista</h1>
          <p>Escolha um consultor disponível e inicie sua conversa agora mesmo.</p>
        </div>

        {/* Os Links (Buttons) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sellers.map((seller, idx) => {
            // Pode colocar o primeiro como "featured" ou algo assim se quiser, ou apenas renderizar
            const isFeatured = idx === 0 && sellers.length > 1; // Exemplo de destaque para o primeiro da fila
            
            return (
              <a 
                key={seller.id} 
                href={`/api/redirect?sellerId=${seller.id}&source=${sourceProp}${campaignProp ? `&campaign=${campaignProp}` : ''}`} 
                target="_blank" 
                className={`link-item ${isFeatured ? 'featured' : ''}`}
              >
                {/* Avatar (opcional no novo design, mas fica bom manter a foto ou ícone) */}
                {seller.photoUrl ? (
                  <img 
                    src={seller.photoUrl} 
                    alt={seller.name} 
                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ 
                    width: 36, height: 36, borderRadius: '50%', 
                    background: isFeatured ? '#ffffff33' : '#f3f4f6', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isFeatured ? '#fff' : '#6b7280', fontWeight: 'bold'
                  }}>
                    {seller.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <span style={{ flex: 1, textAlign: 'left', marginLeft: 8 }}>
                  {seller.name}
                </span>

                <Icon name="whatsapp" size={18} color={isFeatured ? "#fff" : "var(--accent-color)"} />
              </a>
            );
          })}
        </div>

        {/* Rodapé */}
        <div className="footer-brand" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Com tecnologia</span>
          <img src="/karis-labs-logo.png" alt="Karis Labs" style={{ height: '60px', objectFit: 'contain' }} />
        </div>

      </div>
    </div>
  );
};
