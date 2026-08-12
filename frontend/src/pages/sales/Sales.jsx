import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { History } from 'lucide-react';

const Sales = () => {
  return (
    <div className="skeleton-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="text-2xl font-bold">Sales History</h1>
          <p className="text-muted text-sm">Track all store transactions (Sales View Skeleton)</p>
        </div>
        <Badge variant="neutral">History Mode</Badge>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Card style={{ minHeight: '300px' }}>
          <CardHeader>
            <CardTitle>Sales Transactions List (Placeholder)</CardTitle>
          </CardHeader>
          <CardBody className="flex-center text-muted">
            <div style={{ textAlign: 'center' }}>
              <History size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Completed sale invoice records, item counts, payment channels, and PDF print utilities will be managed here.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Sales;
