"use client";
import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/Badge";

/* ─── CARD ───────────────────────────────────── */
const Card = ({ children, style: s = {}, noPad }: any) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)', padding: noPad ? 0 : 20, overflow: noPad ? 'hidden' : undefined, ...s }}>
    {children}
  </div>
);

/* ─── STAT CARD ──────────────────────────────── */
const StatCard = ({ icon, label, value, delta, color, hint }: any) => {
  const [showHint, setShowHint] = useState(false);
  return (
    <Card style={{ flex: 1, minWidth: 160, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={16} color={color} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {delta > 0 && <Badge label={`+${delta}%`} color="green" />}
          {hint && (
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setShowHint(true)}
              onMouseLeave={() => setShowHint(false)}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'help' }}>
                <Icon name="info" size={10} color="#9ca3af" />
              </div>
              {showHint && (
                <div style={{
                  position: 'absolute', right: 0, top: 22, zIndex: 99,
                  background: '#111827', color: '#fff', fontSize: 12,
                  padding: '10px 14px', borderRadius: 8, width: 220,
                  lineHeight: 1.6, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                }}>
                  {hint}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1, marginBottom: 4 }}>{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
    </Card>
  );
};

const SectionLabel = ({ children }: any) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>
);

const BarChartSVG = ({ data }: { data: any[] }) => {
  const [tooltip, setTooltip] = useState<any>(null);
  const W = 540, H = 200, padL = 34, padR = 10, padT = 8, padB = 28;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const maxVal = Math.max(1, ...data.flatMap(d => [d.visitas, d.cliques]));
  const barGroup = plotW / Math.max(1, data.length);
  const barW = Math.min(18, barGroup * 0.32);
  const gap = 4;
  const yTicks = [0, 0.5, 1].map(t => Math.round(t * maxVal));
  const toY = (v: number) => padT + plotH - (v / maxVal) * plotH;
  const toXa = (i: number) => padL + i * barGroup + barGroup / 2 - barW - gap / 2;
  const toXb = (i: number) => padL + i * barGroup + barGroup / 2 + gap / 2;

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
        {yTicks.map(t => <line key={t} x1={padL} x2={W - padR} y1={toY(t)} y2={toY(t)} stroke="#f3f4f6" strokeWidth="1" />)}
        {yTicks.map(t => <text key={t} x={padL - 5} y={toY(t) + 4} textAnchor="end" fill="#9ca3af" fontSize={10}>{t}</text>)}
        {data.map((d, i) => {
          const xa = toXa(i), xb = toXb(i);
          const ha = (d.visitas / maxVal) * plotH, hb = (d.cliques / maxVal) * plotH;
          const hov = tooltip?.i === i;
          return (
            <g key={i} onMouseEnter={() => setTooltip({ i, d })} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'pointer' }}>
              <rect x={xa} y={toY(d.visitas)} width={barW} height={ha} rx={3} fill={hov ? '#2563eb' : '#93c5fd'} style={{ transition: 'fill 0.15s' }} />
              <rect x={xb} y={toY(d.cliques)} width={barW} height={hb} rx={3} fill={hov ? '#16a34a' : '#86efac'} style={{ transition: 'fill 0.15s' }} />
              <text x={padL + i * barGroup + barGroup / 2} y={H - 6} textAnchor="middle" fill="#9ca3af" fontSize={10}>{d.day}</text>
            </g>
          );
        })}
        {tooltip && (() => {
          const { i, d } = tooltip;
          const tx = Math.min(toXa(i) - 4, W - 128);
          const ty = toY(Math.max(d.visitas, d.cliques)) - 56;
          return (
            <g>
              <rect x={tx} y={ty} width={120} height={48} rx={6} fill="#111318" />
              <text x={tx + 10} y={ty + 16} fill="#fff" fontSize={11} fontWeight="600">{d.day}</text>
              <circle cx={tx + 14} cy={ty + 28} r={3} fill="#93c5fd" />
              <text x={tx + 22} y={ty + 32} fill="#d1d5db" fontSize={10}>Visitas: {d.visitas}</text>
              <circle cx={tx + 14} cy={ty + 40} r={3} fill="#86efac" />
              <text x={tx + 22} y={ty + 44} fill="#d1d5db" fontSize={10}>Cliques: {d.cliques}</text>
            </g>
          );
        })()}
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
        {[['#93c5fd','Visitas'],['#86efac','Cliques']].map(([c, l]) => (
          <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c as string }} />{l as string}
          </div>
        ))}
      </div>
    </div>
  );
};

const PIE_COLORS = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b','#ef4444'];
const PieChartSVG = ({ data }: { data: any[] }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const cx = 80, cy = 80, r = 66, ri = 42;
  const total = Math.max(1, data.reduce((s, d) => s + d.value, 0));
  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * Math.PI * 2;
    const a0 = angle, a1 = angle + sweep; angle = a1;
    const mid = (a0 + a1) / 2;
    const sc = hovered === i ? 1.06 : 1;
    const ox = (sc - 1) * Math.cos(mid) * r * 0.15;
    const oy = (sc - 1) * Math.sin(mid) * r * 0.15;
    const rx = cx + ox, ry = cy + oy;
    const x0 = rx + r * Math.cos(a0), y0 = ry + r * Math.sin(a0);
    const x1 = rx + r * Math.cos(a1), y1 = ry + r * Math.sin(a1);
    const ix0 = rx + ri * Math.cos(a0), iy0 = ry + ri * Math.sin(a0);
    const ix1 = rx + ri * Math.cos(a1), iy1 = ry + ri * Math.sin(a1);
    const large = sweep > Math.PI ? 1 : 0;
    const path = `M ${ix0} ${iy0} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${ix1} ${iy1} A ${ri} ${ri} 0 ${large} 0 ${ix0} ${iy0} Z`;
    return { ...d, path, color: PIE_COLORS[i % PIE_COLORS.length], pct: Math.round(d.value / total * 100) };
  });
  const active = hovered !== null ? slices[hovered] : null;

  if (total === 1 && data.length === 0) return <div style={{color:'#9ca3af', fontSize:13}}>Sem dados</div>;

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <svg viewBox="0 0 160 160" width={140} style={{ flexShrink: 0, overflow: 'visible' }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color}
            style={{ cursor: 'pointer', opacity: hovered !== null && hovered !== i ? 0.4 : 1, transition: 'opacity 0.2s' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
        ))}
        <text x={cx} y={cy - 7} textAnchor="middle" fill="#111827" fontSize={18} fontWeight="700">{active ? active.pct + '%' : data.reduce((s, d) => s + d.value, 0)}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af" fontSize={9}>{active ? active.name : 'total'}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, opacity: hovered !== null && hovered !== i ? 0.35 : 1, transition: 'opacity 0.2s', cursor: 'pointer' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ color: '#6b7280' }}>{s.name}</span>
            </div>
            <span style={{ fontWeight: 600, color: '#111827' }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardView({ data }: { data: any }) {
  const weekData = useMemo(() => {
    const dates: Record<string, { day: string, visitas: number, cliques: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = format(d, "dd/MM");
      dates[dateStr] = { day: format(d, "EEE"), visitas: 0, cliques: 0 };
    }
    data.rawPageEvents.forEach((ev: any) => {
      const dateStr = format(new Date(ev.createdAt), "dd/MM");
      if (dates[dateStr]) dates[dateStr].visitas++;
    });
    data.rawSellerEvents.forEach((ev: any) => {
      const dateStr = format(new Date(ev.createdAt), "dd/MM");
      if (dates[dateStr]) dates[dateStr].cliques++;
    });
    return Object.values(dates);
  }, [data]);

  const pieData = useMemo(() => {
    return data.sellers
      .filter((s: any) => s.clicks > 0)
      .map((s: any) => ({ name: s.name.split(' ')[0], value: s.clicks }));
  }, [data]);

  const totalVisits = weekData.reduce((s, d) => s + d.visitas, 0);
  const totalClicks = weekData.reduce((s, d) => s + d.cliques, 0);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <StatCard icon="eye" label="Visitas na página (7 dias)" value={totalVisits} delta={12} color="#3b82f6"
          hint="Pessoas que clicaram no link do Instagram (ou outra rede) e chegaram até a sua página de links."
        />
        <StatCard icon="mouse" label="Cliques em vendedores (7 dias)" value={totalClicks} delta={8} color="#22c55e"
          hint="Quantas dessas visitas realmente clicaram no botão de WhatsApp de algum vendedor."
        />
        <StatCard
          icon="trending"
          label="Taxa de conversão do link"
          value={`${totalVisits ? Math.round(totalClicks / totalVisits * 100) : 0}%`}
          delta={3}
          color="#8b5cf6"
          hint="De cada 100 pessoas que chegaram pelo link do Instagram, quantas clicaram em um vendedor. Quanto maior, melhor!"
        />
        <StatCard icon="users" label="Vendedores ativos" value={data.sellers.filter((s:any) => s.active).length} delta={0} color="#f59e0b" />
      </div>

      {/* Funil explicativo */}
      <Card style={{ marginBottom: 16, background: '#f9fafb' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
          {[
            { icon: 'external', label: 'Link no Instagram', sub: 'Visitante clica', color: '#3b82f6', value: '—' },
            { icon: 'eye',      label: 'Visita à página',   sub: `${totalVisits} visitas`, color: '#6366f1', value: totalVisits },
            { icon: 'mouse',    label: 'Clique no vendedor', sub: `${totalClicks} cliques`, color: '#22c55e', value: totalClicks },
            { icon: 'whatsapp', label: 'Conversa iniciada', sub: 'WhatsApp aberto', color: '#17DB4E', value: '—' },
          ].map((step, i, arr) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 130 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '8px 4px' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: `${step.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                  <Icon name={step.icon} size={15} color={step.color} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{step.label}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{step.sub}</div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ fontSize: 18, color: '#d1d5db', flexShrink: 0, padding: '0 4px' }}>›</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 10, paddingTop: 10, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
          Funil de conversão · Do link do Instagram até o contato com o vendedor
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        <Card>
          <div style={{ marginBottom: 16 }}>
            <SectionLabel>Atividade dos últimos 7 dias</SectionLabel>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Visitas vs Cliques</h3>
          </div>
          <BarChartSVG data={weekData} />
        </Card>
        <Card>
          <div style={{ marginBottom: 16 }}>
            <SectionLabel>Distribuição</SectionLabel>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Cliques por vendedor</h3>
          </div>
          <PieChartSVG data={pieData} />
        </Card>
      </div>
    </div>
  );
}
