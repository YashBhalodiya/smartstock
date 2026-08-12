import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Package } from 'lucide-react';

const Products = () => {
  return (
    <div className="skeleton-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted text-sm">Manage store inventory items, pricing, and stock metrics</p>
        </div>
        <Badge variant="primary">Inventory Catalog</Badge>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Card style={{ minHeight: '300px' }}>
          <CardHeader>
            <CardTitle>Products Management Grid (Placeholder)</CardTitle>
          </CardHeader>
          <CardBody className="flex-center text-muted">
            <div style={{ textAlign: 'center' }}>
              <Package size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Product lists, SKU creation forms, selling prices, purchasing costs, category tags, and active status filters will be managed here.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Products;
