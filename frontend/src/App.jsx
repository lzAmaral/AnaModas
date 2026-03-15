import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, PlusCircle, ListOrdered } from 'lucide-react';
import DashboardScreen from './screens/DashboardScreen';
import ProductsScreen from './screens/ProductsScreen';
import OrdersScreen from './screens/OrdersScreen';
import NewOrderScreen from './screens/NewOrderScreen';

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/pedidos/novo', label: 'Novo Pedido', icon: PlusCircle },
    { path: '/pedidos', label: 'Histórico', icon: ListOrdered },
    { path: '/produtos', label: 'Estoque', icon: Package },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Ana Modas</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={24} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardScreen />} />
            <Route path="/pedidos/novo" element={<NewOrderScreen />} />
            <Route path="/pedidos" element={<OrdersScreen />} />
            <Route path="/produtos" element={<ProductsScreen />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
