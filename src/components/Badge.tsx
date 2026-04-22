import React from 'react';

export const Badge = ({ label, color = 'green', size = 'sm' }: { label: string, color?: 'green'|'gray'|'blue'|'yellow'|'red', size?: 'sm'|'md' }) => {
  const colors = {
    green:  { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
    gray:   { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
    blue:   { bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
    yellow: { bg: '#fef9c3', text: '#a16207', dot: '#eab308' },
    red:    { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444' },
  };
  const c = colors[color] || colors.green;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: c.bg, color: c.text, borderRadius: 20, padding: size === 'sm' ? '2px 8px' : '3px 10px', fontSize: size === 'sm' ? 11 : 12, fontWeight: 500 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
      {label}
    </span>
  );
};
