import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  History, 
  Package, 
  FolderTree, 
  Boxes, 
  RefreshCcw, 
  Truck, 
  Bell, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const Sidebar = ({ isCollapsed, toggleSidebar, onLogout }) => {
  const [salesOpen, setSalesOpen] = useState(true);
  const [inventoryOpen, setInventoryOpen] = useState(true);

  const toggleSales = (e) => {
    e.preventDefault();
    if (!isCollapsed) setSalesOpen(!salesOpen);
  };

  const toggleInventory = (e) => {
    e.preventDefault();
    if (!isCollapsed) setInventoryOpen(!inventoryOpen);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand-wrapper">
        <div className="sidebar-brand">
          <TrendingUp className="sidebar-brand-icon" size={24} />
          {!isCollapsed && (
            <div className="sidebar-brand-text-wrapper">
              <span className="sidebar-brand-name">StockFlow</span>
              <span className="sidebar-brand-tagline">Smart Inventory</span>
            </div>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu-list">
          {/* Dashboard */}
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
              {!isCollapsed && <span className="link-text">Dashboard</span>}
            </NavLink>
          </li>

          {/* Sales with Submenu */}
          <li>
            <button 
              onClick={toggleSales}
              className={`sidebar-link sidebar-parent-link ${salesOpen && !isCollapsed ? 'parent-expanded' : ''}`}
            >
              <div className="sidebar-link-left">
                <Receipt size={20} />
                {!isCollapsed && <span className="link-text">Sales</span>}
              </div>
              {!isCollapsed && (salesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>
            
            {salesOpen && !isCollapsed && (
              <ul className="sidebar-submenu-list">
                <li>
                  <NavLink 
                    to="/sales/new" 
                    className={({ isActive }) => `sidebar-submenu-link ${isActive ? 'active' : ''}`}
                  >
                    <PlusCircle size={16} />
                    <span className="submenu-link-text">New Sale</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/sales" 
                    end
                    className={({ isActive }) => `sidebar-submenu-link ${isActive ? 'active' : ''}`}
                  >
                    <History size={16} />
                    <span className="submenu-link-text">Sales History</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Inventory with Submenu */}
          <li>
            <button 
              onClick={toggleInventory}
              className={`sidebar-link sidebar-parent-link ${inventoryOpen && !isCollapsed ? 'parent-expanded' : ''}`}
            >
              <div className="sidebar-link-left">
                <Boxes size={20} />
                {!isCollapsed && <span className="link-text">Inventory</span>}
              </div>
              {!isCollapsed && (inventoryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>
            
            {inventoryOpen && !isCollapsed && (
              <ul className="sidebar-submenu-list">
                <li>
                  <NavLink 
                    to="/products" 
                    className={({ isActive }) => `sidebar-submenu-link ${isActive ? 'active' : ''}`}
                  >
                    <Package size={16} />
                    <span className="submenu-link-text">Products</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/categories" 
                    className={({ isActive }) => `sidebar-submenu-link ${isActive ? 'active' : ''}`}
                  >
                    <FolderTree size={16} />
                    <span className="submenu-link-text">Categories</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/inventory" 
                    className={({ isActive }) => `sidebar-submenu-link ${isActive ? 'active' : ''}`}
                  >
                    <Boxes size={16} />
                    <span className="submenu-link-text">Stock Health</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Restock Orders */}
          <li>
            <NavLink 
              to="/restock-orders" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <RefreshCcw size={20} />
              {!isCollapsed && <span className="link-text">Restock Orders</span>}
            </NavLink>
          </li>

          {/* Suppliers */}
          <li>
            <NavLink 
              to="/suppliers" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Truck size={20} />
              {!isCollapsed && <span className="link-text">Suppliers</span>}
            </NavLink>
          </li>

          {/* Notifications */}
          <li>
            <NavLink 
              to="/notifications" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-notification-link">
                <Bell size={20} />
                {!isCollapsed && <span className="link-text">Notifications</span>}
              </div>
              {!isCollapsed && <span className="sidebar-badge bg-danger">3</span>}
            </NavLink>
          </li>

          {/* Reports */}
          <li>
            <NavLink 
              to="/reports" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={20} />
              {!isCollapsed && <span className="link-text">Reports</span>}
            </NavLink>
          </li>

          {/* Settings */}
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Settings size={20} />
              {!isCollapsed && <span className="link-text">Settings</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={onLogout}
          className="sidebar-link sidebar-logout-btn"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="link-text">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
