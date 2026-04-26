import React from 'react';

type Props = {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: React.CSSProperties;
  className?: string;
};

/**
 * Bloco de skeleton com animação de shimmer.
 * Usado em loading.tsx das rotas pesadas.
 */
export default function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
  style,
  className,
}: Props) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, var(--border, #e2e8f0) 0%, rgba(255,255,255,0.65) 50%, var(--border, #e2e8f0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'kl-skeleton 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}
