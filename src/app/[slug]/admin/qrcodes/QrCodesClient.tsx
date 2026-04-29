'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import CopyLinkButton from '@/components/CopyLinkButton';
import ConfirmSubmitButton from '@/components/ConfirmSubmitButton';
import { Icon } from '@/components/Icon';

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
  const a = document.createElement('a');
  a.href = svgUrl;
  a.download = `${name}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(svgUrl);
}

export default function QrCodesClient({ qrCodes, slug, deleteAction }: Props) {
  const [tab, setTab] = useState<'qr' | 'bio'>('qr');

  const qrList = qrCodes.filter((c) => c.channel === 'qr');
  const bioList = qrCodes.filter((c) => c.channel === 'bio');
  const filtered = tab === 'qr' ? qrList : bioList;

  const tabs = [
    { t: 'qr' as const, label: 'QR Code', icon: 'qrcode', color: '#16a34a', count: qrList.length },
    { t: 'bio' as const, label: 'Bio Link', icon: 'link', color: '#3b82f6', count: bioList.length },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="kl-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {tabs.map(({ t, label, icon, color, count }) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '13px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: tab === t ? `2px solid ${color}` : '2px solid transparent',
                color: tab === t ? color : 'var(--text-soft)',
                fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                transition: 'color .15s', marginBottom: -1,
              }}
            >
              <Icon name={icon} size={14} color="currentColor" />
              {label}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 20, height: 20, padding: '0 6px',
                borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: tab === t ? color + '18' : 'var(--border)',
                color: tab === t ? color : 'var(--text-soft)',
              }}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Campaign grid */}
        {filtered.length === 0 ? (
          <div style={{ padding: '52px 24px', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: tab === 'qr' ? '#f0fdf4' : '#eff6ff',
              border: `1px solid ${tab === 'qr' ? '#bbf7d0' : '#bfdbfe'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <Icon name={tab === 'qr' ? 'qrcode' : 'link'} size={22} color={tab === 'qr' ? '#16a34a' : '#3b82f6'} />
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft)' }}>
              Nenhuma campanha {tab === 'qr' ? 'QR Code' : 'Bio Link'} criada ainda.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 14,
            padding: 16,
          }}>
            {filtered.map((qr) => (
              <CampaignCard key={qr.id} qr={qr} slug={slug} deleteAction={deleteAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignCard({ qr, slug, deleteAction }: { qr: QrCodeCard; slug: string; deleteAction: (fd: FormData) => Promise<void> }) {
  const isQr = qr.channel === 'qr';
  const accent = isQr ? '#16a34a' : '#3b82f6';

  return (
    <div className="kl-card" style={{ padding: '18px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 8,
          background: isQr ? '#f0fdf4' : '#eff6ff',
          border: `1px solid ${isQr ? '#bbf7d0' : '#bfdbfe'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name={isQr ? 'qrcode' : 'link'} size={22} color={accent} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{qr.name}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 7px',
              borderRadius: 6, fontSize: 10, fontWeight: 700,
              background: accent + '15', color: accent,
            }}>
              {isQr ? 'QR' : 'Bio'}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-soft)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {qr.url}
          </div>
        </div>
      </div>

      {/* QR preview (only for QR type) */}
      {isQr && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ background: '#fff', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}>
            <QRCodeSVG id={`qr-${qr.id}`} value={qr.url} size={96} />
          </div>
        </div>
      )}

      {/* Metrics row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8, padding: '12px 0',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        marginBottom: 12,
      }}>
        {[
          { l: 'Visitas', v: qr.visits },
          { l: 'Escolhas', v: qr.clicks },
          { l: 'Conversão', v: qr.conversion !== '0' ? qr.conversion + '%' : '—' },
        ].map(({ l, v }) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>{v}</div>
            <div style={{ fontSize: 10, color: 'var(--text-soft)', fontWeight: 600 }}>{l}</div>
          </div>
        ))}
      </div>

      {qr.topSellerName && (
        <div style={{ fontSize: 11, color: 'var(--text-soft)', marginBottom: 10 }}>
          Top vendedor: <strong style={{ color: 'var(--text-main)' }}>{qr.topSellerName}</strong>
        </div>
      )}

      {/* Recent choices */}
      {qr.recentChoices.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8 }}>
            Histórico recente
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {qr.recentChoices.map((event) => (
              <div key={event.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{event.sellerName}</span>
                <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>{event.createdAtLabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        {isQr && (
          <button
            type="button"
            onClick={() => downloadSVG(`qr-${qr.id}`, qr.slug)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 36, padding: '0 12px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--card-bg)',
              color: 'var(--text-main)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Icon name="download" size={13} />
            QR
          </button>
        )}
        <CopyLinkButton value={qr.url} label="Copiar link" copiedLabel="Copiado!" />
        <a
          href={qr.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 36, padding: '0 12px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--card-bg)',
            color: 'var(--text-main)', fontSize: 12, fontWeight: 600, textDecoration: 'none',
          }}
        >
          <Icon name="link" size={13} />
          Testar
        </a>
        <form action={deleteAction} style={{ marginLeft: 'auto' }}>
          <input type="hidden" name="id" value={qr.id} />
          <input type="hidden" name="slug" value={slug} />
          <ConfirmSubmitButton
            message={`Excluir a campanha "${qr.name}"? Esta ação não pode ser desfeita.`}
            ariaLabel={`Excluir campanha ${qr.name}`}
            style={{
              height: 36, padding: '0 12px', borderRadius: 8,
              border: '1px solid #fecaca', background: '#fff1f2',
              color: '#e11d48', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Icon name="trash" size={13} />
            Excluir
          </ConfirmSubmitButton>
        </form>
      </div>
    </div>
  );
}
