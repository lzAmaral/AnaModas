import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, User, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewOrderScreen() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  const addItem = () => {
    setOrderItems([...orderItems, {
      productId: '',
      productName: '',
      size: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      stockAvailable: 0
    }]);
  };

  const removeItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...orderItems];
    const item = newItems[index];

    if (field === 'productId') {
      const selectedProduct = products.find(p => p.id.toString() === value);
      if (selectedProduct) {
        item.productId = value;
        item.productName = selectedProduct.name;
        item.size = selectedProduct.size;
        item.unitPrice = selectedProduct.price;
        item.stockAvailable = selectedProduct.stock_quantity;
        item.totalPrice = item.unitPrice * item.quantity;
      } else {
        item.productId = '';
        item.unitPrice = 0;
        item.totalPrice = 0;
        item.stockAvailable = 0;
      }
    } else if (field === 'quantity') {
      const qty = parseInt(value, 10) || 0;
      item.quantity = qty;
      item.totalPrice = item.unitPrice * qty;
    }

    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (orderItems.length === 0 || !orderItems[0].productId) {
      setError('Adicione pelo menos um produto ao pedido.');
      return;
    }

    // Validate stock
    const isStockValid = orderItems.every(item => item.quantity <= item.stockAvailable && item.quantity > 0);
    if (!isStockValid) {
      setError('Verifique as quantidades. Algum item excede o estoque disponível ou tem quantidade inválida.');
      return;
    }

    const payload = {
      client_name: clientName || 'Cliente Balcão',
      client_phone: clientPhone,
      items: orderItems.map(item => ({
        product_id: parseInt(item.productId, 10),
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice
      }))
    };

    setLoading(true);
    fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json().then(data => ({ status: res.status, body: data })))
      .then(res => {
        setLoading(false);
        if (res.status >= 400) {
          setError(res.body.error || 'Erro ao salvar pedido.');
        } else {
          alert('Pedido salvo com sucesso! Estoque atualizado.');
          navigate('/pedidos');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Erro de conexão ao salvar pedido.');
        setLoading(false);
      });
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
        <button className="btn btn-icon-only btn-secondary" onClick={() => navigate(-1)}><ArrowLeft /></button>
        <h1>Lançar Novo Pedido</h1>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-6)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid-cards" style={{ marginBottom: 'var(--spacing-6)' }}>
          {/* Cliente Info Side */}
          <div className="card">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
              <User /> Dados do Cliente
            </h2>
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input className="form-input" placeholder="" value={clientName} onChange={e => setClientName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone </label>
              <input className="form-input" placeholder="(00) 00000-0000" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
            </div>
          </div>

          {/* Resumo Side */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--color-primary)', color: 'white' }}>
            <div style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9 }}>Total do Pedido</div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal())}
            </div>
            <button
              type="submit"
              className="btn btn-secondary"
              style={{ marginTop: 'var(--spacing-6)', width: '100%', color: 'var(--color-primary)' }}
              disabled={loading}
            >
              {loading ? 'Salvando...' : <><Save /> Finalizar Venda</>}
            </button>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}><ShoppingCart /> Itens do Pedido</h2>
            <button type="button" className="btn btn-secondary" onClick={addItem}>
              <Plus /> Adicionar Produto
            </button>
          </div>

          {orderItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-6)', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              Nenhum produto adicionado. Clique no botão acima para adicionar.
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Produto</th>
                    <th>Preço Un.</th>
                    <th>Qtd.</th>
                    <th>Total Item</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          className="form-select"
                          required
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        >
                          <option value="">Selecione um produto...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>
                              {p.name} {p.size && `(Tam: ${p.size})`} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)} (Estoque: {p.stock_quantity})
                            </option>
                          ))}
                        </select>
                        {item.productId && item.stockAvailable <= 5 && (
                          <div style={{ color: 'var(--color-warning)', fontSize: '12px', marginTop: '4px' }}>Estoque baixo! ({item.stockAvailable} disp.)</div>
                        )}
                      </td>
                      <td>
                        <input className="form-input" disabled value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)} />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-input"
                          min="1"
                          max={item.stockAvailable}
                          required
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        />
                      </td>
                      <td>
                        <input className="form-input" disabled value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalPrice)} />
                      </td>
                      <td>
                        <button type="button" className="btn btn-icon-only btn-danger" onClick={() => removeItem(index)}>
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
