"use client";

import React, { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { LayoutDashboard, Users, Link as LinkIcon, LogOut, Search, Menu, Settings, Bell, Mail, Plus, Trash2, Edit2 } from "lucide-react";
import { createSeller, deleteSeller, updateSeller } from "./actions";

const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardClient({ data, onLogout }: { data: any, onLogout: () => void }) {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [showForm, setShowForm] = React.useState(false);
  const [editingSeller, setEditingSeller] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  // Process chart data
  const chartData = useMemo(() => {
    const dates: Record<string, { date: string, pageViews: number, sellerClicks: number }> = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = format(d, "dd/MM");
      dates[dateStr] = { date: dateStr, pageViews: 0, sellerClicks: 0 };
    }

    data.rawPageEvents.forEach((ev: any) => {
      const dateStr = format(new Date(ev.createdAt), "dd/MM");
      if (dates[dateStr]) dates[dateStr].pageViews++;
    });

    data.rawSellerEvents.forEach((ev: any) => {
      const dateStr = format(new Date(ev.createdAt), "dd/MM");
      if (dates[dateStr]) dates[dateStr].sellerClicks++;
    });

    return Object.values(dates);
  }, [data]);

  const pieData = useMemo(() => {
    return data.sellers
      .filter((s: any) => s.clicks > 0)
      .map((s: any) => ({ name: s.name, value: s.clicks }));
  }, [data]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#e2e8f0", color: "#1e293b", fontFamily: "sans-serif" }}>
      
      {/* Sidebar */}
      <aside style={{ width: "250px", backgroundColor: "#1e1b4b", color: "#cbd5e1", padding: "1.5rem 0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 1.5rem", marginBottom: "2rem", color: "#f8fafc", fontSize: "1.5rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <LayoutDashboard size={24} color="#f59e0b" />
          <span>Painel</span>
        </div>
        
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li 
              onClick={() => setActiveTab('dashboard')}
              style={{ padding: "1rem 1.5rem", backgroundColor: activeTab === 'dashboard' ? "rgba(255,255,255,0.05)" : "transparent", borderLeft: activeTab === 'dashboard' ? "4px solid #f59e0b" : "4px solid transparent", color: activeTab === 'dashboard' ? "#f59e0b" : "#cbd5e1", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "all 0.2s" }}>
              <LayoutDashboard size={20} /> Dashboard
            </li>
            <li 
              onClick={() => setActiveTab('vendedores')}
              style={{ padding: "1rem 1.5rem", backgroundColor: activeTab === 'vendedores' ? "rgba(255,255,255,0.05)" : "transparent", borderLeft: activeTab === 'vendedores' ? "4px solid #f59e0b" : "4px solid transparent", color: activeTab === 'vendedores' ? "#f59e0b" : "#cbd5e1", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "all 0.2s" }}>
              <Users size={20} /> Vendedores
            </li>
          </ul>
        </nav>

        <div style={{ padding: "0 1.5rem" }}>
          <button onClick={() => onLogout()} style={{ background: "none", border: "none", color: "#ef4444", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "1rem", opacity: 0.8 }}>
            <LogOut size={20} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Topbar */}
        <header style={{ height: "70px", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Menu size={24} color="#64748b" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "#e2e8f0", padding: "0.5rem 1rem", borderRadius: "2rem" }}>
            <Search size={18} color="#64748b" />
            <input type="text" placeholder="Buscar..." style={{ background: "transparent", border: "none", outline: "none", color: "#334155" }} />
          </div>
        </header>

        {/* Dashboard Content */}
        <div style={{ padding: "2rem", flex: 1, overflowY: "auto" }}>
          
          {activeTab === 'dashboard' && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ color: "#64748b", fontSize: "0.9rem", textTransform: "uppercase" }}>Total de Visitas</h3>
                    <LinkIcon color="#14b8a6" size={20} />
                  </div>
                  <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b" }}>{data.pageViewsCount}</p>
                </div>
                
                <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ color: "#64748b", fontSize: "0.9rem", textTransform: "uppercase" }}>Cliques nos Vendedores</h3>
                    <Users color="#3b82f6" size={20} />
                  </div>
                  <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b" }}>{data.sellerClicksCount}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                
                {/* Bar Chart */}
                <div style={{ backgroundColor: "#1e1b4b", padding: "1.5rem", borderRadius: "1rem", color: "#fff", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Atividade (Últimos 7 dias)</h3>
                  <div style={{ height: "250px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="date" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "0.5rem", color: "#fff" }} />
                        <Legend />
                        <Bar dataKey="pageViews" name="Visitas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="sellerClicks" name="Cliques Vendedores" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart */}
                <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ marginBottom: "1.5rem", fontSize: "1.1rem", color: "#1e293b" }}>Distribuição por Vendedor</h3>
                  <div style={{ height: "250px" }}>
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                        Nenhum clique registrado ainda.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'vendedores' && (
            <div style={{ backgroundColor: "#1e1b4b", padding: "1.5rem", borderRadius: "1rem", color: "#fff", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem" }}>Vendedores Cadastrados</h3>
              <button 
                onClick={() => {
                  setEditingSeller(null);
                  setShowForm(!showForm);
                }}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f59e0b", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "bold" }}
              >
                <Plus size={18} /> {showForm && !editingSeller ? "Cancelar" : "Novo Vendedor"}
              </button>
            </div>

            {showForm && (
              <form 
                style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "1.5rem", borderRadius: "0.5rem", marginBottom: "2rem" }}
                action={async (formData) => {
                  setLoading(true);
                  try {
                    if (editingSeller) {
                      await updateSeller(formData);
                    } else {
                      await createSeller(formData);
                    }
                    setShowForm(false);
                    setEditingSeller(null);
                  } catch (err: any) {
                    alert(err.message);
                  }
                  setLoading(false);
                }}
              >
                {editingSeller && <input type="hidden" name="id" value={editingSeller.id} />}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#cbd5e1" }}>Nome do Vendedor *</label>
                    <input type="text" name="name" defaultValue={editingSeller?.name || ""} required style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #334155", background: "#0f172a", color: "#fff" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#cbd5e1" }}>Número do WhatsApp *</label>
                    <input type="text" name="whatsapp" defaultValue={editingSeller?.whatsapp || ""} placeholder="Ex: 5511999999999" required style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #334155", background: "#0f172a", color: "#fff" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#cbd5e1" }}>Link da Foto (Opcional)</label>
                    <input type="url" name="photoUrl" defaultValue={editingSeller?.photoUrl || ""} placeholder="https://exemplo.com/foto.jpg" style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #334155", background: "#0f172a", color: "#fff" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button type="submit" disabled={loading} style={{ background: "#14b8a6", color: "#fff", border: "none", padding: "0.75rem 2rem", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "bold", opacity: loading ? 0.7 : 1 }}>
                    {loading ? "Salvando..." : (editingSeller ? "Atualizar Vendedor" : "Salvar Vendedor")}
                  </button>
                  {editingSeller && (
                    <button type="button" onClick={() => { setEditingSeller(null); setShowForm(false); }} disabled={loading} style={{ background: "transparent", color: "#94a3b8", border: "1px solid #334155", padding: "0.75rem 2rem", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "bold" }}>
                      Cancelar Edição
                    </button>
                  )}
                </div>
              </form>
            )}
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1" }}>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "normal" }}>Nome</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "normal" }}>WhatsApp</th>
                    <th style={{ padding: "1rem", textAlign: "right", fontWeight: "normal" }}>Cliques</th>
                    <th style={{ padding: "1rem", textAlign: "center", fontWeight: "normal", width: "80px" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sellers.length > 0 ? data.sellers.map((seller: any) => (
                    <tr key={seller.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                        {seller.photoUrl ? (
                          <img src={seller.photoUrl} alt={seller.name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                            {seller.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {seller.name}
                      </td>
                      <td style={{ padding: "1rem", color: "#cbd5e1" }}>{seller.whatsapp}</td>
                      <td style={{ padding: "1rem", textAlign: "right", fontWeight: "bold", color: "#f59e0b" }}>{seller.clicks}</td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        <button 
                          onClick={() => {
                            setEditingSeller(seller);
                            setShowForm(true);
                          }}
                          style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", opacity: 0.8, marginRight: "0.75rem" }}
                          title="Editar Vendedor"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm("Tem certeza que deseja excluir este vendedor?")) {
                              await deleteSeller(seller.id);
                            }
                          }}
                          style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", opacity: 0.8 }}
                          title="Excluir Vendedor"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>Nenhum vendedor cadastrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}

        </div>
      </main>
    </div>
  );
}
