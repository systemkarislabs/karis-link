'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

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
          padding: 32,
          border: '1px solid var(--border)',
          color: 'var(--sidebar-text)',
        }}
      >
        Nenhuma campanha criada ainda. Gere o primeiro QR Code para começar a rastrear scans e escolhas de vendedores.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
      {qrCodes.map((qr) => (
        <div
          key={qr.id}
          style={{
            background: 'var(--card-bg)',
            borderRadius: 20,
            padding: 24,
            border: '1px solid var(--border)',
            boxShadow: '0 10px 24px rgba(148, 163, 184, 0.12)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-main)' }}>{qr.name}</h3>
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--sidebar-text)' }}>/{slug}/go/{qr.slug}</div>
            </div>
            <div
              style={{
                padding: '6px 10px',
                borderRadius: 999,
                background: 'rgba(34, 197, 94, 0.08)',
                color: '#16a34a',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {qr.conversion}% conversão
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(90px, 1fr))', gap: 12, flex: 1 }}>
              {[
                { label: 'Scans', value: qr.visits },
                { label: 'Escolhas', value: qr.clicks },
                { label: 'Melhor vendedor', value: qr.topSellerName || 'Sem dados' },
                { label: 'Destino', value: 'WhatsApp' },
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
                      fontSize: item.label === 'Melhor vendedor' ? 13 : 22,
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
              }}
            >
              Baixar QR
            </button>

            <a
              href={`/${slug}/go/${qr.slug}`}
              target="_blank"
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Testar link
            </a>

            <form action={deleteAction}>
              <input type="hidden" name="id" value={qr.id} />
              <input type="hidden" name="slug" value={slug} />
              <button
                type="submit"
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #fecaca',
                  background: '#fff1f2',
                  color: '#e11d48',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Excluir
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
