import React, { useState, useEffect } from 'react';
import { PackagePlus, Search, Edit2, Trash2, X } from 'lucide-react';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    id: null,
    code: '',
    name: '',
    category: '',
    size: '',
    price: '',
    stock_quantity: ''
  });

  const loadProducts = () => {
    setLoading(true);
    fetch(`https://anamodas.onrender.com/api/products?search=${search}`)
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = formData.id ? `https://anamodas.onrender.com/api/products/${formData.id}` : 'https://anamodas.onrender.com/api/products';
    const method = formData.id ? 'PUT' : 'POST';

    const payload = { ...formData, price: parseFloat(formData.price), stock_quantity: parseInt(formData.stock_quantity, 10) };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
      loadProducts();
      handleCancel();
    });
  };

  const editProduct = (p) => {
    setFormData({
      id: p.id,
      code: p.code || '',
      name: p.name || '',
      category: p.category || '',
      size: p.size || '',
      price: p.price || '',
      stock_quantity: p.stock_quantity || ''
    });
    setShowForm(true);
  };

  const deleteProduct = (id) => {
    if (window.confirm('Tem certeza que deseja remover este produto?')) {
      fetch(`https://anamodas.onrender.com/api/products/${id}`, { method: 'DELETE' })
        .then(() => loadProducts());
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ id: null, code: '', name: '', category: '', size: '', price: '', stock_quantity: '' });
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <h1>Controle de Estoque</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <PackagePlus /> Novo Produto
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
            <h2>{formData.id ? 'Editar Produto' : 'Cadastrar Produto'}</h2>
            <button className="btn btn-icon-only btn-secondary" onClick={handleCancel}><X /></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
              <div className="form-group">
                <label className="form-label">Nome *</label>
                <input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Código</label>
                <input className="form-input" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <input className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Tamanho *</label>
                <input required className="form-input" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Preço (R$) *</label>
                <input required type="number" step="0.01" className="form-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Quantidade *</label>
                <input required type="number" className="form-input" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-4)' }}>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar Produto</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
            <input 
              className="form-input" 
              placeholder="Buscar por nome ou código..." 
              style={{ paddingLeft: '48px' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? <p>Carregando...</p> : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Produto</th>
                  <th>Tam.</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>Nenhum produto encontrado.</td></tr>
                ) : products.map(p => (
                  <tr key={p.id}>
                    <td>{p.code || '-'}</td>
                    <td>{p.name} <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{p.category}</div></td>
                    <td>{p.size}</td>
                    <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}</td>
                    <td>
                      <span className={`badge ${p.stock_quantity <= 5 ? 'badge-warning' : 'badge-success'}`}>
                        {p.stock_quantity} un
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                        <button className="btn btn-icon-only btn-secondary" onClick={() => editProduct(p)}><Edit2 size={18} /></button>
                        <button className="btn btn-icon-only btn-danger" onClick={() => deleteProduct(p.id)}><Trash2 size={18} /></button>
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
