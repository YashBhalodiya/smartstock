import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="skeleton-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="text-2xl font-bold">Good morning, Shopkeeper</h1>
          <p className="text-muted text-sm">Here's what's happening with your store today. (Dashboard View Skeleton)</p>
        </div>
        <Badge variant="primary">Aug 12, 2026</Badge>
      </div>

      <div className="grid-cols-auto" style={{ marginTop: '24px' }}>
        <Card>
          <CardBody>
            <span className="text-xs font-semibold text-muted">TODAY'S REVENUE</span>
            <h2 className="text-2xl font-bold" style={{ margin: '4px 0' }}>₹12,450</h2>
            <Badge variant="success">+12.5% from yesterday</Badge>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <span className="text-xs font-semibold text-muted">TODAY'S SALES</span>
            <h2 className="text-2xl font-bold" style={{ margin: '4px 0' }}>87</h2>
            <Badge variant="success">+8.2%</Badge>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <span className="text-xs font-semibold text-muted">TOTAL PRODUCTS</span>
            <h2 className="text-2xl font-bold" style={{ margin: '4px 0' }}>320</h2>
            <Badge variant="warning">12 low stock</Badge>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <span className="text-xs font-semibold text-muted">PENDING ORDERS</span>
            <h2 className="text-2xl font-bold" style={{ margin: '4px 0' }}>4</h2>
            <Badge variant="danger">Needs attention</Badge>
          </CardBody>
        </Card>
      </div>

      <div className="skeleton-page-content" style={{ marginTop: '24px' }}>
        <Card style={{ minHeight: '300px' }}>
          <CardHeader>
            <CardTitle>Sales &amp; Activity Overview (Placeholder)</CardTitle>
          </CardHeader>
          <CardBody className="flex-center text-muted">
            <div style={{ textAlign: 'center' }}>
              <LayoutDashboard size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Dashboard charts, stock check indicators, and active transaction listings will load here.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
