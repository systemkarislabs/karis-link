'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Icon } from './Icon';

type ToastVariant = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  ttl: number;
};

type ToastContextValue = {
  notify: (message: string, options?: { variant?: ToastVariant; ttl?: number }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLE: Record<
  ToastVariant,
  { bg: string; color: string; border: string; icon: 'check' | 'x' | 'info' }
> = {
  success: { bg: '#ecfdf5', color: '#047857', border: '#bbf7d0', icon: 'check' },
  error: { bg: '#fff1f2', color: '#be123c', border: '#fecdd3', icon: 'x' },
  info: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: 'info' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback<ToastContextValue['notify']>((message, options) => {
    counter.current += 1;
    const id = `t-${Date.now()}-${counter.current}`;
    const ttl = options?.ttl ?? 4000;
    const variant = options?.variant ?? 'success';

    setToasts((current) => [...current, { id, message, variant, ttl }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, ttl);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: 'max(20px, env(safe-area-inset-top))',
          right: 20,
          left: 20,
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const style = VARIANT_STYLE[toast.variant];
          return (
            <div
              key={toast.id}
              role="status"
              style={{
                pointerEvents: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
                borderRadius: 12,
                boxShadow: '0 18px 44px rgba(15, 23, 42, 0.15)',
                fontSize: 14,
                fontWeight: 600,
                maxWidth: 380,
                animation: 'kl-toast-in 180ms ease-out',
              }}
            >
              <Icon name={style.icon} size={16} color={style.color} />
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Fechar notificação"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: style.color,
                  padding: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <Icon name="x" size={14} color={style.color} />
              </button>
            </div>
          );
        })}
      </div>
      <style jsx global>{`
        @keyframes kl-toast-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast precisa estar dentro de <ToastProvider>.');
  }
  return ctx;
}

/**
 * Hook utilitário: lê `?notice=algo` do searchParams, mostra um toast e
 * limpa o parâmetro da URL. Útil para confirmar ações que terminam em
 * redirect (server actions).
 */
export function useNoticeFromQuery() {
  const { notify } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const notice = url.searchParams.get('notice');
    const variant = url.searchParams.get('noticeVariant') as ToastVariant | null;

    if (!notice) return;

    notify(decodeURIComponent(notice), {
      variant: variant && ['success', 'error', 'info'].includes(variant) ? variant : 'success',
    });

    url.searchParams.delete('notice');
    url.searchParams.delete('noticeVariant');
    window.history.replaceState({}, '', url.toString());
  }, [notify]);
}
