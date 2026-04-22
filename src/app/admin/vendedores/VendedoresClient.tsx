"use client";
import React, { useState } from 'react';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { DarkBtn } from '@/components/DarkBtn';
import { createSeller, updateSeller, deleteSeller } from '../actions';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Card = ({ children, style: s = {}, noPad }: any) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)', padding: noPad ? 0 : 20, overflow: noPad ? 'hidden' : undefined, ...s }}>
    {children}
  </div>
);

const SectionLabel = ({ children }: any) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>
);

const SellerModal = ({ seller, onSave, onClose }: any) => {
  const [form, setForm] = useState(seller || { name: '', whatsapp: '', photoUrl: '', active: true });
  const [focused, setFocused] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!seller;

  const inp = (field: string) => ({
    width: '100%', background: '#fff',
    border: `1px solid ${focused === field ? '#22c55e' : '#e5e7eb'}`,
    borderRadius: 7, padding: '9px 12px 9px 36px',
    color: '#111827', fontSize: 13, outline: 'none',
    boxShadow: focused === field ? '0 0 0 3px #dcfce7' : 'none',
    transition: 'all 0.15s',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    if (form.id) formData.append("id", form.id);
    formData.append("name", form.name);
    formData.append("whatsapp", form.whatsapp);
    if (form.photoUrl) formData.append("photoUrl", form.photoUrl);
    formData.append("active", form.active ? "true" : "false");

    try {
      if (isEdit) {
        await updateSeller(formData);
      } else {
        await createSeller(formData);
      }
      onSave(isEdit);
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,19,24,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 460, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>{isEdit ? 'Editar Vendedor' : 'Novo Vendedor'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex' }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18 }}>
              <Avatar name={form.name || 'N'} photoUrl={form.photoUrl} size={44} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: form.name ? '#111827' : '#9ca3af' }}>{form.name || 'Nome do vendedor'}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>Preview do card</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Badge label={form.active ? 'Ativo' : 'Inativo'} color={form.active ? 'green' : 'gray'} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { field: 'name', label: 'Nome Completo', icon: 'user', placeholder: 'Ex: Ana Costa' },
                { field: 'whatsapp', label: 'Número WhatsApp', icon: 'phone', placeholder: '5511999990000' },
                { field: 'photoUrl', label: 'URL da Foto (opcional)', icon: 'photo', placeholder: 'https://...' },
              ].map(({ field, label, icon, placeholder }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: focused === field ? '#22c55e' : '#9ca3af', transition: 'color 0.15s' }}>
                      <Icon name={icon} size={14} />
                    </div>
                    <input required={field !== 'photoUrl'} value={(form as any)[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                      onFocus={() => setFocused(field)} onBlur={() => setFocused('')}
                      placeholder={placeholder} style={inp(field)} />
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Vendedor ativo na página pública</span>
                <button type="button" onClick={() => setForm({ ...form, active: !form.active })} style={{
                  width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                  background: form.active ? '#22c55e' : '#d1d5db', transition: 'background 0.2s',
                  position: 'relative',
                }}>
                  <div style={{ position: 'absolute', top: 3, left: form.active ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, padding: '16px 20px', borderTop: '1px solid #e5e7eb', justifyContent: 'flex-end' }}>
            <DarkBtn variant="outline" onClick={onClose} type="button">Cancelar</DarkBtn>
            <DarkBtn type="submit" icon="check" style={{ opacity: loading ? 0.6 : 1 }}>{loading ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Cadastrar Vendedor')}</DarkBtn>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function VendedoresClient({ sellers }: { sellers: any[] }) {
  const [modal, setModal] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSave = (isEdit: boolean) => {
    showToast(isEdit ? 'Dados atualizados!' : 'Vendedor cadastrado com sucesso!');
    setModal(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoadingDelete(true);
    await deleteSeller(deleteId);
    setLoadingDelete(false);
    setDeleteId(null);
    showToast('Vendedor removido.');
  };

  return (
    <div style={{ position: 'relative', fontFamily: 'Inter, sans-serif' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 10000, background: '#111318', color: '#fff', borderRadius: 8, padding: '10px 16px', fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          <Icon name="check" size={14} color="#22c55e" /> {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 14 }}>
        <div>
          <SectionLabel>Gerenciamento</SectionLabel>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{sellers.length} vendedor{sellers.length !== 1 ? 'es' : ''} cadastrado{sellers.length !== 1 ? 's' : ''}</h2>
        </div>
        <DarkBtn icon="plus" onClick={() => setModal('new')}>Novo Vendedor</DarkBtn>
      </div>

      {/* Table */}
      <Card noPad style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 800 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 90px 90px 80px 72px', gap: 0, padding: '10px 18px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            {['Vendedor', 'WhatsApp', 'Últ. Clique', 'Cliques', 'Status', ''].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
            ))}
          </div>

        {sellers.map((seller, i) => (
          <div key={seller.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 1.5fr 90px 90px 80px 72px', gap: 0,
            alignItems: 'center', padding: '12px 18px',
            borderBottom: i < sellers.length - 1 ? '1px solid #e5e7eb' : 'none',
            background: 'transparent', transition: 'background 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={seller.name} photoUrl={seller.photoUrl} size={34} />
              <div>
                <div style={{ fontWeight: 500, fontSize: 13, color: '#111827' }}>{seller.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>ID #{seller.id.slice(0,6)}...</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
              <Icon name="whatsapp" size={13} color="#22c55e" />{seller.whatsapp}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {seller.lastClickAt ? format(new Date(seller.lastClickAt), "dd/MM HH:mm", { locale: ptBR }) : '-'}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{seller.clicks.toLocaleString('pt-BR')}</div>
            <div><Badge label={seller.active ? 'Ativo' : 'Inativo'} color={seller.active ? 'green' : 'gray'} /></div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setModal(seller)} title="Editar" style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                <Icon name="edit" size={13} />
              </button>
              <button onClick={() => setDeleteId(seller.id)} title="Excluir" style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                <Icon name="trash" size={13} />
              </button>
            </div>
          </div>
        ))}
        {sellers.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>Nenhum vendedor cadastrado ainda.</div>
        )}
        </div>
      </Card>

      {modal && <SellerModal seller={modal === 'new' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />}

      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,19,24,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setDeleteId(null)} />
          <Card style={{ position: 'relative', maxWidth: 360, width: '100%', textAlign: 'center', zIndex: 1, padding: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="trash" size={18} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: '#111827' }}>Excluir Vendedor?</h3>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>Esta ação não pode ser desfeita. O vendedor será removido permanentemente.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <DarkBtn variant="outline" onClick={() => setDeleteId(null)}>Cancelar</DarkBtn>
              <DarkBtn danger onClick={handleDelete} style={{ opacity: loadingDelete ? 0.6 : 1 }}>{loadingDelete ? 'Aguarde...' : 'Excluir'}</DarkBtn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
