'use client';

import React from 'react';

type Option = { value: string; label: string };

type Props = {
  name: string;
  defaultValue?: string;
  options: Option[];
  ariaLabel?: string;
  style?: React.CSSProperties;
};

/**
 * Select que auto-submite o formulário pai ao mudar.
 * UX melhor que exigir clique em "Atualizar".
 */
export default function AutoSubmitSelect({
  name,
  defaultValue,
  options,
  ariaLabel,
  style,
}: Props) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      aria-label={ariaLabel}
      onChange={(event) => {
        event.currentTarget.form?.requestSubmit();
      }}
      style={{
        padding: '10px 16px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'var(--card-bg)',
        color: 'var(--text-main)',
        outline: 'none',
        cursor: 'pointer',
        minHeight: 40,
        ...style,
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
