"use client";
import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/Badge";
import { createQrCode, deleteQrCode, toggleQrCode } from "./actions";

const Card = ({ children, style: s = {}, noPad }: any) => (
  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", padding: noPad ? 0 : 20, overflow: noPad ? "hidden" : undefined, ...s }}>
    {children}
  </div>
);

const SectionLabel = ({ children }: any) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{children}</div>
);

function QrModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const handleSlug = (v: string) => setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));

  const inp = (field: string): React.CSSProperties => ({
    width: "100%", background: "#f9fafb",
    border: `1px solid ${focused === field ? "#17DB4E" : "#e5e7eb"}`,
    borderRadius: 7, padding: "10px 14px",
    color: "#111827", fontSize: 13, outline: "none",
    boxShadow: focused === field ? "0 0 0 3px rgba(23,219,78,0.10)" : "none",
    transition: "all 0.15s", boxSizing: "border-box",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("slug", slug);
    await createQrCode(fd);
    setLoading(false);
    onSave();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(17,19,24,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ position: "relative", width: "100%", maxWidth: 420, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>Novo QR Code</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 7 }}>Nome da campanha</label>
              <input value={name} onChange={e => setName(e.target.value)}
                onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                placeholder="Ex: Panfleto da loja" style={inp("name")} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 7 }}>Identificador (slug)</label>
              <input value={slug} onChange={e => handleSlug(e.target.value)}
                onFocus={() => setFocused("slug")} onBlur={() => setFocused("")}
                placeholder="panfleto-loja" style={inp("slug")} required />
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>Apenas letras, números e traços. Será usado na URL de rastreamento.</p>
            </div>

            {slug && (
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, display: "flex", gap: 12, alignItems: "center" }}>
                <QRCodeSVG value={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://10.0.0.133:3001'}/?source=qr&campaign=${slug}`} size={80} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Preview do QR Code</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", wordBreak: "break-all" }}>
                    {`${process.env.NEXT_PUBLIC_BASE_URL || '10.0.0.133:3001'}/?source=qr&campaign=${slug}`}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, padding: "16px 20px", borderTop: "1px solid #e5e7eb", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#374151" }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ padding: "8px 16px", borderRadius: 7, border: "none", background: loading ? "#9ca3af" : "#111318", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "default" : "pointer" }}>
              {loading ? "Criando..." : "Criar QR Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QrCodeCard({ qr, onDelete, onToggle }: { qr: any; onDelete: () => void; onToggle: () => void }) {
  const svgRef = useRef<HTMLDivElement>(null);

  const downloadQr = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `qr-${qr.slug}.svg`;
    a.click(); URL.revokeObjectURL(url);
  };

  const convRate = qr.visits > 0 ? Math.round((qr.clicks / qr.visits) * 100) : 0;

  return (
    <Card>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* QR Code */}
        <div ref={svgRef} style={{ background: "#f9fafb", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", flexShrink: 0 }}>
          <QRCodeSVG value={qr.url} size={110} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{qr.name}</span>
            <Badge label={qr.active ? "Ativo" : "Pausado"} color={qr.active ? "green" : "gray"} />
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12, wordBreak: "break-all" }}>{qr.url}</div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#3b82f6" }}>{qr.visits}</div>
              <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase" }}>Visitas via QR</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }}>{qr.clicks}</div>
              <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase" }}>Cliques vendedor</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#8b5cf6" }}>{convRate}%</div>
              <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase" }}>Conversão</div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <button onClick={downloadQr} title="Baixar QR Code" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", color: "#374151" }}>
            <Icon name="external" size={13} /> Baixar
          </button>
          <button onClick={onToggle} title={qr.active ? "Pausar" : "Ativar"} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", color: "#374151" }}>
            <Icon name="eye" size={13} /> {qr.active ? "Pausar" : "Ativar"}
          </button>
          <button onClick={onDelete} title="Excluir" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 7, border: "1px solid #fecaca", background: "#fef2f2", fontSize: 12, fontWeight: 500, cursor: "pointer", color: "#ef4444" }}>
            <Icon name="trash" size={13} /> Excluir
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function QrCodesClient({ qrCodes: initial }: { qrCodes: any[] }) {
  const [qrCodes, setQrCodes] = useState(initial);
  const [showModal, setShowModal] = useState(false);

  const refresh = () => window.location.reload();

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 20 }}>
        <div>
          <SectionLabel>Rastreamento</SectionLabel>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 4 }}>QR Codes</h2>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Gere QR codes para campanhas físicas e meça quantas visitas e vendas vieram de cada um.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 8, border: "none", background: "#111318", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          <Icon name="plus" size={14} color="#fff" /> Novo QR Code
        </button>
      </div>

      {/* Banner explicativo */}
      <Card style={{ marginBottom: 16, background: "linear-gradient(135deg, #f0fdf4, #f9fafb)", border: "1px solid #d1fae5" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(23,219,78,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="trending" size={18} color="#17DB4E" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#111827", marginBottom: 4 }}>Como funciona o rastreamento por QR Code?</div>
            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
              Cada QR Code leva para a sua Árvore de Links com um código de identificação único. Quando alguém escaneia o QR e visita a página, a visita é registrada. Se essa pessoa clicar em um vendedor, o clique também é atribuído ao QR Code — mostrando exatamente a taxa de conversão de cada campanha.
            </div>
          </div>
        </div>
      </Card>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {qrCodes.length === 0 && (
          <Card>
            <div style={{ textAlign: "center", padding: "32px 20px", color: "#9ca3af" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#374151", marginBottom: 6 }}>Nenhum QR Code criado ainda</div>
              <div style={{ fontSize: 13 }}>Clique em "Novo QR Code" para criar sua primeira campanha rastreável.</div>
            </div>
          </Card>
        )}
        {qrCodes.map(qr => (
          <QrCodeCard
            key={qr.id}
            qr={qr}
            onDelete={async () => { await deleteQrCode(qr.id); refresh(); }}
            onToggle={async () => { await toggleQrCode(qr.id, !qr.active); refresh(); }}
          />
        ))}
      </div>

      {showModal && <QrModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); refresh(); }} />}
    </div>
  );
}
