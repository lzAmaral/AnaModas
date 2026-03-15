import React, { useEffect, useState } from 'react';
import { TrendingUp, Package, AlertTriangle, ListOrdered } from 'lucide-react';

export default function DashboardScreen() {
  const [data, setData] = useState({
    total_orders: 0,
    total_revenue: 0,
    low_stock_products: [],
    top_products: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://anamodas.onrender.com/api/dashboard')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="animate-fade-in">
      <h1>Dashboard</h1>
      
      <div className="grid-cards" style={{ marginTop: 'var(--spacing-6)' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-lg)' }}><ListOrdered size={32} /></div>
            <div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Total de Pedidos</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>{data.total_orders}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-success)', color: 'white', borderRadius: 'var(--radius-lg)' }}><TrendingUp size={32} /></div>
            <div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Valor Vendido</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.total_revenue)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-6)', marginTop: 'var(--spacing-6)' }}>
        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)', color: 'var(--color-warning)' }}>
            <AlertTriangle /> Estoque Baixo
          </h2>
          {data.low_stock_products.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Produto</th><th>Estoque</th></tr></thead>
                <tbody>
                  {data.low_stock_products.map(p => (
                    <tr key={p.id}>
                      <td>{p.name} {p.size && `(${p.size})`}</td>
                      <td><span className="badge badge-warning">{p.stock_quantity} un</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <p style={{ color: 'var(--color-text-muted)' }}>Nenhum produto com estoque baixo.</p>
          )}
        </div>

        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)', color: 'var(--color-primary)' }}>
            <Package /> Mais Vendidos
          </h2>
          {data.top_products.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Produto</th><th>Qtd. Vendida</th></tr></thead>
                <tbody>
                  {data.top_products.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.sold_quantity} un</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma venda registrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
