import React from 'react';

export const Avatar = ({ name, photoUrl, size = 36 }: { name: string, photoUrl?: string | null, size?: number }) => {
  const colors = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];
  const color = colors[name.charCodeAt(0) % colors.length];
  if (photoUrl) return <img src={photoUrl} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38, color: '#fff', flexShrink: 0, fontFamily: 'Inter' }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};
