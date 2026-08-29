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

const Navbar = ({ toggleSidebar, isCollapsed, onLogout, currentUser }) => {
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

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return [{ label: 'Dashboard', link: '/dashboard' }];

    const map = {
      '/sales/new': [{ label: 'Home', link: '/dashboard' }, { label: 'Sales', link: '/sales' }, { label: 'New Sale', link: '/sales/new' }],
      '/sales': [{ label: 'Home', link: '/dashboard' }, { label: 'Sales', link: '/sales' }],
      '/products': [{ label: 'Home', link: '/dashboard' }, { label: 'Inventory', link: '/products' }, { label: 'Products', link: '/products' }],
      '/categories': [{ label: 'Home', link: '/dashboard' }, { label: 'Inventory', link: '/products' }, { label: 'Categories', link: '/categories' }],
      '/inventory': [{ label: 'Home', link: '/dashboard' }, { label: 'Inventory', link: '/products' }, { label: 'Stock Health', link: '/inventory' }],
      '/restock-orders': [{ label: 'Home', link: '/dashboard' }, { label: 'Restock Orders', link: '/restock-orders' }],
      '/suppliers': [{ label: 'Home', link: '/dashboard' }, { label: 'Suppliers', link: '/suppliers' }],
      '/notifications': [{ label: 'Home', link: '/dashboard' }, { label: 'Notifications', link: '/notifications' }],
      '/reports': [{ label: 'Home', link: '/dashboard' }, { label: 'Reports', link: '/reports' }],
      '/settings': [{ label: 'Home', link: '/dashboard' }, { label: 'Settings', link: '/settings' }],
      '/sandbox': [{ label: 'Home', link: '/dashboard' }, { label: 'UI Sandbox', link: '/sandbox' }]
    };

    return map[path] || [{ label: 'Home', link: '/dashboard' }];
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
              <span className="navbar-username">{currentUser?.name || 'Shopkeeper'}</span>
              <span className="navbar-role">{currentUser?.role === 'SHOPKEEPER' ? 'Shopkeeper' : (currentUser?.role || 'Owner')}</span>
            </div>
            <ChevronDown size={14} className={`profile-chevron ${profileDropdownOpen ? 'rotated' : ''}`} />
          </button>

          {profileDropdownOpen && (
            <div className="navbar-profile-dropdown">
              <div className="dropdown-header-info">
                <span className="dropdown-name">{currentUser?.name || 'Shopkeeper'}</span>
                <span className="dropdown-email">{currentUser?.email || ''}</span>
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
