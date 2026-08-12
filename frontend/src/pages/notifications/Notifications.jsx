import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Bell } from 'lucide-react';

const Notifications = () => {
  return (
    <div className="skeleton-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications Center</h1>
          <p className="text-muted text-sm">Review safety threshold triggers, automated restock order dispatches, and system updates</p>
        </div>
        <Badge variant="danger">3 Unread Alerts</Badge>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Card style={{ minHeight: '300px' }}>
          <CardHeader>
            <CardTitle>Low Stock Alerts &amp; Activities (Placeholder)</CardTitle>
          </CardHeader>
          <CardBody className="flex-center text-muted">
            <div style={{ textAlign: 'center' }}>
              <Bell size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Chronological feed of critical alerts, item replenishments, manual adjustment notifications, and email logs will be populated here.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
