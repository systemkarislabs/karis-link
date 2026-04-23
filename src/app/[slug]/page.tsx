export const dynamic = 'force-dynamic';

export default async function PublicTenantPage(props: any) {
  const params = await props.params;
  const { slug } = params;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '40px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800 }}>Teste de Rota: {slug}</h1>
      <p style={{ color: '#94a3b8', marginTop: 20 }}>
        Se você está vendo esta tela, a rota <strong>/{slug}</strong> está funcionando corretamente na Vercel.
      </p>
      <p style={{ color: '#94a3b8' }}>
        Isso significa que o erro 500 anterior era causado pela consulta ao banco de dados.
      </p>
    </div>
  );
}
