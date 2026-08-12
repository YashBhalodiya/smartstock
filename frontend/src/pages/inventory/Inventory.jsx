import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Boxes } from 'lucide-react';

const Inventory = () => {
  return (
    <div className="skeleton-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Health &amp; Inventory</h1>
          <p className="text-muted text-sm">Monitor stock level health, safety thresholds, and inventory value</p>
        </div>
        <Badge variant="warning">Monitoring Active</Badge>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Card style={{ minHeight: '300px' }}>
          <CardHeader>
            <CardTitle>Inventory Health Metrics (Placeholder)</CardTitle>
          </CardHeader>
          <CardBody className="flex-center text-muted">
            <div style={{ textAlign: 'center' }}>
              <Boxes size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Total inventory valuation cards, critical out-of-stock listings, adjustment history, and restock quantities will be visualised here.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Inventory;
