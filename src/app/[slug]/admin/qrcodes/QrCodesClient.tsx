'use client';
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QrCodesClient({ qrCodes, slug, deleteAction }: { qrCodes: any[], slug: string, deleteAction: any }) {
  const downloadSVG = (id: string, name: string) => {
    const svg = document.getElementById(id);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `${name}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
      {qrCodes.map(qr => (
        <div key={qr.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>{qr.name}</div>
          <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, display: 'inline-block', marginBottom: 12 }}>
            <QRCodeSVG id={`qr-${qr.id}`} value={qr.url} size={150} />
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16, wordBreak: 'break-all' }}>{qr.url}</div>
          
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button 
              onClick={() => downloadSVG(`qr-${qr.id}`, qr.name)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #17DB4E', background: '#fff', color: '#17DB4E', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Baixar SVG
            </button>
            <form action={deleteAction.bind(null, slug, qr.id)}>
              <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>Excluir</button>
            </form>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-around' }}>
             <div>
               <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' }}>Visitas</div>
               <div style={{ fontWeight: 700 }}>{qr.visits}</div>
             </div>
             <div>
               <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' }}>Cliques</div>
               <div style={{ fontWeight: 700 }}>{qr.clicks}</div>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}
