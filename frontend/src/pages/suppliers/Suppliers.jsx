import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Truck } from 'lucide-react';

const Suppliers = () => {
  return (
    <div className="skeleton-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-muted text-sm">Manage external wholesale supplier directories and catalog offerings</p>
        </div>
        <Badge variant="primary">Vendor Directory</Badge>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Card style={{ minHeight: '300px' }}>
          <CardHeader>
            <CardTitle>Wholesalers &amp; Distributors Index (Placeholder)</CardTitle>
          </CardHeader>
          <CardBody className="flex-center text-muted">
            <div style={{ textAlign: 'center' }}>
              <Truck size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Supplier address details, phone numbers, contact emails, current active restock counts, and supplier catalogs will be shown here.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Suppliers;
