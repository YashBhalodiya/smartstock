import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  PackageCheck, 
  Info, 
  Check, 
  Trash2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useStore } from '../../context/StoreContext';

const Notifications = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useStore();

  const [filterType, setFilterType] = useState('All');

  const unreadCount = notifications.filter(n => n.unread || !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'Unread') return n.unread || !n.isRead;
    if (filterType === 'Low Stock') return n.type === 'low_stock' || n.type === 'RESTOCK_ORDER_CREATED';
    if (filterType === 'Restock Dispatches') return n.type === 'restock_approved' || n.type === 'RESTOCK_EMAIL_SENT' || n.type === 'restock_received' || n.type === 'RESTOCK_RECEIVED';
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'low_stock':
      case 'RESTOCK_ORDER_CREATED':
        return <AlertTriangle size={18} style={{ color: '#ef4444' }} />;
      case 'restock_approved':
      case 'RESTOCK_EMAIL_SENT':
        return <Mail size={18} style={{ color: '#3b82f6' }} />;
      case 'restock_received':
      case 'RESTOCK_RECEIVED':
        return <PackageCheck size={18} style={{ color: '#10b981' }} />;
      default:
        return <Info size={18} style={{ color: '#6366f1' }} />;
    }
  };

  return (
    <div className="notifications-page" style={{ paddingBottom: '40px' }}>
      {/* Page Header */}
      <div className="page-header flex-between flex-wrap gap-4" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Notifications Center</h1>
          <p className="text-muted text-sm" style={{ marginTop: '4px' }}>
            Review out of stock alerts, auto-generated purchase orders, and supplier email dispatch activities.
          </p>
        </div>
        <div className="flex-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="danger" dot>
              {unreadCount} Unread Alerts
            </Badge>
          )}
          <Button 
            variant="secondary" 
            size="sm"
            icon={<Check size={14} />} 
            onClick={markAllNotificationsAsRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </Button>
        </div>
      </div>

      <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <CardHeader className="flex-between flex-wrap gap-4" style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div className="flex-center gap-2">
            {['All', 'Unread', 'Low Stock', 'Restock Dispatches'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterType(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filterType === tab ? '#4f6ef2' : '#f8fafc',
                  color: filterType === tab ? '#ffffff' : '#64748b'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <Link to="/restock-orders" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} iconPosition="right">
              View Restock Queue
            </Button>
          </Link>
        </CardHeader>

        <CardBody style={{ padding: '0' }}>
          {filteredNotifications.length === 0 ? (
            <div className="flex-center text-muted" style={{ padding: '60px 20px', flexDirection: 'column' }}>
              <Bell size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ margin: 0, fontWeight: '500' }}>No notifications to display</p>
              <span style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                System events and restock dispatches will appear in this chronological log.
              </span>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map(item => {
                const isUnread = item.unread || !item.isRead;
                return (
                  <div
                    key={item.id}
                    onClick={() => markNotificationAsRead(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '16px 24px',
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: isUnread ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ 
                      padding: '10px', 
                      borderRadius: '50%', 
                      backgroundColor: isUnread ? '#e0e7ff' : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getNotificationIcon(item.type)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="flex-between">
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: isUnread ? '700' : '600', color: '#0f172a' }}>
                          {item.title || item.message}
                        </h4>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {item.time || (item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now')}
                        </span>
                      </div>
                      
                      {item.title && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                          {item.message}
                        </p>
                      )}

                      {item.targetId && (
                        <div style={{ marginTop: '8px' }}>
                          <Link to="/restock-orders" style={{ fontSize: '12px', color: '#4f6ef2', fontWeight: '600', textDecoration: 'none' }}>
                            Open Restock Orders →
                          </Link>
                        </div>
                      )}
                    </div>

                    {isUnread && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4f6ef2', marginTop: '6px' }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Notifications;
