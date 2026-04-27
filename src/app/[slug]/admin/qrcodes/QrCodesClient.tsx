'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import CopyLinkButton from '@/components/CopyLinkButton';
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton';

type RecentChoice = {
  id: string;
  sellerName: string;
  createdAtLabel: string;
};

type QrCodeCard = {
  id: string;
  name: string;
  slug: string;
  url: string;
  channel: 'qr' | 'bio';
  visits: number;
  clicks: number;
  conversion: string;
  topSellerName: string | null;
  recentChoices: RecentChoice[];
};

type Props = {
  qrCodes: QrCodeCard[];
  slug: string;
  deleteAction: (formData: FormData) => Promise<void>;
};

function downloadSVG(id: string, name: string) {
  const svg = document.getElementById(id);
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = svgUrl;
  downloadLink.download = `${name}.svg`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(svgUrl);
}

export default function QrCodesClient({ qrCodes, slug, deleteAction }: Props) {
  if (qrCodes.length === 0) {
    return (
      <div
        style={{
          background: 'var(--card-bg)',
          borderRadius: 20,
          padding: '40px 32px',
          border: '1px dashed var(--border)',
          color: 'var(--sidebar-text)',
          textAlign: 'center',
          display: 'grid',
          placeItems: 'center',
          gap: 12,
        }}
      >
        <div
          className="empty-campaign-icon"
          aria-hidden="true"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(23, 219, 78, 0.10)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 0,
          }}
        >
          📡
        </div>
        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
          Você ainda não criou campanhas
        </div>
        <div style={{ fontSize: 13, maxWidth: 420 }}>
          Gere seu primeiro QR Code ou link da bio acima para começar a rastrear acessos e escolhas de vendedores.
        </div>
      </div>
    );
  }

  return (
    <div className="kl-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20 }}>
      {qrCodes.map((qr) => (
        <div
          key={qr.id}
          className="kl-card kl-card-hover"
          style={{
            background: 'var(--card-bg)',
            borderRadius: 20,
            padding: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              marginBottom: 18,
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-main)' }}>{qr.name}</h3>
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--sidebar-text)' }}>
                /{slug}/{qr.channel === 'bio' ? 'bio' : 'go'}/{qr.slug}
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--sidebar-text)' }}>
                Codigo interno: {qr.slug}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div
                style={{
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: qr.channel === 'bio' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                  color: qr.channel === 'bio' ? '#2563eb' : '#16a34a',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {qr.channel === 'bio' ? 'Link da bio' : 'QR Code'}
              </div>
              <div
                style={{
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: 'rgba(15, 23, 42, 0.05)',
                  color: 'var(--text-main)',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {qr.conversion}% deste link
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
            {qr.channel === 'qr' ? (
              <div
                style={{
                  background: '#ffffff',
                  padding: 14,
                  borderRadius: 16,
                  border: '1px solid var(--border)',
                  minWidth: 120,
                }}
              >
                <QRCodeSVG id={`qr-${qr.id}`} value={qr.url} size={108} />
              </div>
            ) : (
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
                  padding: 18,
                  borderRadius: 16,
                  border: '1px solid #bfdbfe',
                  minWidth: 120,
                  maxWidth: 180,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: '#2563eb',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: 10,
                  }}
                >
                  Link da bio
                </div>
                <div style={{ fontSize: 12, color: '#1e293b', lineHeight: 1.45, wordBreak: 'break-word' }}>{qr.url}</div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(90px, 1fr))', gap: 12, flex: 1 }}>
              {[
                { label: 'Acessos', value: qr.visits },
                { label: 'Escolhas', value: qr.clicks },
                { label: 'Melhor vendedor', value: qr.topSellerName || 'Sem dados' },
                { label: 'Origem', value: qr.channel === 'bio' ? 'Instagram Bio' : 'QR Code' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: 'var(--bg-main)',
                    borderRadius: 14,
                    padding: '12px 14px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: 11, color: 'var(--sidebar-text)', textTransform: 'uppercase', marginBottom: 6 }}>
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: item.label === 'Melhor vendedor' || item.label === 'Origem' ? 13 : 22,
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      lineHeight: 1.15,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 10 }}>
              Histórico recente da campanha
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {qr.recentChoices.length > 0 ? (
                qr.recentChoices.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      paddingBottom: 10,
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{event.sellerName}</div>
                    <div style={{ fontSize: 12, color: 'var(--sidebar-text)' }}>{event.createdAtLabel}</div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: 'var(--sidebar-text)' }}>
                  Ainda não houve escolha de vendedor a partir desta campanha.
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {qr.channel === 'qr' ? (
              <button
                type="button"
                onClick={() => downloadSVG(`qr-${qr.id}`, qr.slug)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: 'var(--text-main)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: 40,
                }}
              >
                Baixar QR
              </button>
            ) : null}

            <CopyLinkButton value={qr.url} label="Copiar link" copiedLabel="Link copiado!" />

            <a
              href={`/${slug}/${qr.channel === 'bio' ? 'bio' : 'go'}/${qr.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                minHeight: 40,
              }}
            >
              {qr.channel === 'bio' ? 'Abrir link da bio' : 'Testar link'}
            </a>

            <form action={deleteAction}>
              <input type="hidden" name="id" value={qr.id} />
              <input type="hidden" name="slug" value={slug} />
              <ConfirmSubmitButton
                message={`Excluir a campanha "${qr.name}"? Esta ação não pode ser desfeita.`}
                ariaLabel={`Excluir campanha ${qr.name}`}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #fecaca',
                  background: '#fff1f2',
                  color: '#e11d48',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: 40,
                }}
              >
                Excluir
              </ConfirmSubmitButton>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
