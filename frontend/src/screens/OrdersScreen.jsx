import React, { useState, useEffect } from 'react';
import { Search, ListOrdered, Calendar, User, Eye, CheckCircle, Package, Clock, Trash2 } from 'lucide-react';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);
    if (dateFilter) params.append('date', dateFilter);

    fetch(`http://localhost:3001/api/orders?${params.toString()}`)
      .then(res => res.json())
      .then(data => { setOrders(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    loadOrders();
  }, [search, statusFilter, dateFilter]);

  const updateStatus = (id, newStatus) => {
    fetch(`http://localhost:3001/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(() => loadOrders());
  };

  const updatePaymentStatus = (id, newPaymentStatus) => {
    fetch(`http://localhost:3001/api/orders/${id}/payment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status: newPaymentStatus })
    })
    .then(res => res.json())
    .then(() => loadOrders());
  };

  const deleteOrder = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido? Os itens retornarão ao estoque.')) {
      fetch(`http://localhost:3001/api/orders/${id}`, {
        method: 'DELETE'
      })
      .then(res => res.json())
      .then(() => loadOrders())
      .catch(err => console.error('Error deleting order:', err));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendente': return <span className="badge badge-warning"><Clock size={14} style={{ marginRight: 4 }}/> Pendente</span>;
      case 'separado': return <span className="badge badge-primary" style={{ backgroundColor: 'var(--color-primary-hover)', color: 'white' }}><Package size={14} style={{ marginRight: 4 }}/> Separado</span>;
      case 'entregue': return <span className="badge badge-success"><CheckCircle size={14} style={{ marginRight: 4 }}/> Entregue</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <h1>Histórico de Pedidos</h1>
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
           
           <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
             <Search style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
             <input 
               className="form-input" 
               placeholder="Busca cliente, telefone ou ID..." 
               style={{ paddingLeft: '48px' }}
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
           </div>

           <div className="form-group" style={{ marginBottom: 0 }}>
             <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
               <option value="">Todos os Status</option>
               <option value="pendente">Pendente</option>
               <option value="separado">Separado</option>
               <option value="entregue">Entregue</option>
             </select>
           </div>

           <div className="form-group" style={{ marginBottom: 0 }}>
             <input type="date" className="form-input" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
           </div>

         </div>

         {loading ? <p>Carregando pedidos...</p> : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Pedido #</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Pagamento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>Nenhum pedido encontrado.</td></tr>
                ) : orders.map(o => (
                  <tr key={o.id}>
                    <td><strong>#{o.id.toString().padStart(5, '0')}</strong></td>
                    <td>
                      <div>{o.client_name || 'Cliente Balcão'}</div>
                      {o.client_phone && <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{o.client_phone}</div>}
                    </td>
                    <td>{new Date(o.order_date).toLocaleDateString('pt-BR')} {new Date(o.order_date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</td>
                    <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(o.total_amount)}</td>
                    <td>{getStatusBadge(o.status)}</td>
                    <td>
                      <select 
                        className="form-select" 
                        style={{ minHeight: '36px', padding: '4px 8px', fontSize: '14px', width: 'auto', outline: 'none', border: o.payment_status === 'pago' ? '1px solid var(--color-success)' : '1px solid var(--color-border)' }}
                        value={o.payment_status || 'não pago'}
                        onChange={(e) => updatePaymentStatus(o.id, e.target.value)}
                      >
                        <option value="não pago">❌ Não Pago</option>
                        <option value="pago">✅ Pago</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                        <select 
                          className="form-select" 
                          style={{ minHeight: '36px', padding: '4px 8px', fontSize: '14px', width: 'auto' }}
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="separado">Separado</option>
                          <option value="entregue">Entregue</option>
                        </select>
                        <button 
                          className="btn btn-icon-only btn-danger" 
                          onClick={() => deleteOrder(o.id)}
                          title="Excluir Pedido"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
         )}
      </div>
    </div>
  );
}
