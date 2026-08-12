import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { StoreProvider } from './context/StoreContext';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Sales from './pages/sales/Sales';
import NewSale from './pages/sales/NewSale';
import Products from './pages/products/Products';
import Categories from './pages/categories/Categories';
import Inventory from './pages/inventory/Inventory';
import RestockOrders from './pages/restock/RestockOrders';
import Suppliers from './pages/suppliers/Suppliers';
import Notifications from './pages/notifications/Notifications';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import Sandbox from './pages/sandbox/Sandbox';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('stockflow_auth') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('stockflow_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('stockflow_auth');
    setIsAuthenticated(false);
  };

  return (
    <ToastProvider>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
              } 
            />

            {/* Protected Routes Panel */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? <MainLayout onLogout={handleLogout} /> : <Navigate to="/login" replace />
              }
            >
              {/* Redirect root to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Core Views */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="sales" element={<Sales />} />
              <Route path="sales/new" element={<NewSale />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="restock-orders" element={<RestockOrders />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              
              {/* Developer Sandbox */}
              <Route path="sandbox" element={<Sandbox />} />
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </ToastProvider>
  );
}

export default App;
