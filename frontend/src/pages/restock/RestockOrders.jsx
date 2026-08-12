import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { RefreshCcw } from 'lucide-react';

const RestockOrders = () => {
  return (
    <div className="skeleton-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="text-2xl font-bold">Restock Orders</h1>
          <p className="text-muted text-sm">Replenish low-stock products via automated and manual purchase orders</p>
        </div>
        <Badge variant="warning">Automated Restock Active</Badge>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Card style={{ minHeight: '300px' }}>
          <CardHeader>
            <CardTitle>Replenishment Orders Queue (Placeholder)</CardTitle>
          </CardHeader>
          <CardBody className="flex-center text-muted">
            <div style={{ textAlign: 'center' }}>
              <RefreshCcw size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Review auto-generated purchase orders, trigger supplier dispatch emails, approve orders, and track restock receipts here.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default RestockOrders;
