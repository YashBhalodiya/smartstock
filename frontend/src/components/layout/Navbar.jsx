import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Menu, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';

const Navbar = ({ toggleSidebar, isCollapsed, onLogout }) => {
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Simple path to breadcrumb resolution helper
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') {
      return [{ label: 'Dashboard', link: '/dashboard' }];
    }
    
    const crumbs = [];
    crumbs.push({ label: 'Home', link: '/dashboard' });

    if (path.startsWith('/sales')) {
      crumbs.push({ label: 'Sales', link: '/sales' });
      if (path === '/sales/new') {
        crumbs.push({ label: 'New Sale', link: '/sales/new' });
      }
    } else if (path.startsWith('/products')) {
      crumbs.push({ label: 'Inventory', link: '/products' });
      crumbs.push({ label: 'Products', link: '/products' });
    } else if (path.startsWith('/categories')) {
      crumbs.push({ label: 'Inventory', link: '/products' });
      crumbs.push({ label: 'Categories', link: '/categories' });
    } else if (path.startsWith('/inventory')) {
      crumbs.push({ label: 'Inventory', link: '/products' });
      crumbs.push({ label: 'Stock Health', link: '/inventory' });
    } else if (path.startsWith('/restock-orders')) {
      crumbs.push({ label: 'Restock Orders', link: '/restock-orders' });
    } else if (path.startsWith('/suppliers')) {
      crumbs.push({ label: 'Suppliers', link: '/suppliers' });
    } else if (path.startsWith('/notifications')) {
      crumbs.push({ label: 'Notifications', link: '/notifications' });
    } else if (path.startsWith('/reports')) {
      crumbs.push({ label: 'Reports', link: '/reports' });
    } else if (path.startsWith('/settings')) {
      crumbs.push({ label: 'Settings', link: '/settings' });
    } else if (path.startsWith('/sandbox')) {
      crumbs.push({ label: 'UI Sandbox', link: '/sandbox' });
    }
    
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="navbar-header">
      <div className="navbar-left">
        <button 
          onClick={toggleSidebar} 
          className="navbar-toggle-btn"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        
        {/* Dynamic Breadcrumbs */}
        <nav className="navbar-breadcrumbs" aria-label="Breadcrumb">
          <ol className="breadcrumb-list">
            {breadcrumbs.map((crumb, idx) => (
              <li key={crumb.link + idx} className="breadcrumb-item">
                {idx > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="breadcrumb-current">{crumb.label}</span>
                ) : (
                  <Link to={crumb.link} className="breadcrumb-link">{crumb.label}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="navbar-right">
        {/* Search Input Bar */}
        <div className="navbar-search-wrapper">
          <Search size={16} className="navbar-search-icon" />
          <input 
            type="text" 
            placeholder="Search transactions, products..." 
            className="navbar-search-input" 
          />
        </div>

        {/* Notifications Bell Button */}
        <Link to="/notifications" className="navbar-notification-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="navbar-notification-badge">3</span>
        </Link>

        {/* Shopkeeper profile card */}
        <div className="navbar-profile-wrapper" ref={dropdownRef}>
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="navbar-profile-btn"
          >
            <div className="navbar-avatar">
              <User size={18} />
            </div>
            <div className="navbar-profile-info">
              <span className="navbar-username">Shopkeeper</span>
              <span className="navbar-role">Owner</span>
            </div>
            <ChevronDown size={14} className={`profile-chevron ${profileDropdownOpen ? 'rotated' : ''}`} />
          </button>

          {profileDropdownOpen && (
            <div className="navbar-profile-dropdown">
              <div className="dropdown-header-info">
                <span className="dropdown-name">Shopkeeper Admin</span>
                <span className="dropdown-email">store@stockflow.com</span>
              </div>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/settings" onClick={() => setProfileDropdownOpen(false)}>
                    <Settings size={16} />
                    <span>Store Settings</span>
                  </Link>
                </li>
                <li className="dropdown-divider"></li>
                <li>
                  <button onClick={() => { setProfileDropdownOpen(false); onLogout(); }} className="dropdown-logout-btn">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
