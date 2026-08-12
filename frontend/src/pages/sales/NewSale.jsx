import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { PlusCircle } from 'lucide-react';

const NewSale = () => {
  return (
    <div className="skeleton-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="text-2xl font-bold">New Sale</h1>
          <p className="text-muted text-sm">Create and check out customer billing orders (POS view)</p>
        </div>
        <Badge variant="primary">POS Terminal Active</Badge>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Card style={{ minHeight: '300px' }}>
          <CardHeader>
            <CardTitle>Point of Sale Interface (Placeholder)</CardTitle>
          </CardHeader>
          <CardBody className="flex-center text-muted">
            <div style={{ textAlign: 'center' }}>
              <PlusCircle size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Product grid listings, scanning barcode widgets, discount additions, subtotal calculators, and invoice printing will be built here.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default NewSale;
