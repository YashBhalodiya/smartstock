import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { BarChart3 } from 'lucide-react';

const Reports = () => {
  return (
    <div className="skeleton-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="text-2xl font-bold">Reports &amp; Analytics</h1>
          <p className="text-muted text-sm">Analyze revenue growth, category performance, and inventory replenishment velocity</p>
        </div>
        <Badge variant="primary">Analytics Suite</Badge>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Card style={{ minHeight: '300px' }}>
          <CardHeader>
            <CardTitle>Business Performance Analytics (Placeholder)</CardTitle>
          </CardHeader>
          <CardBody className="flex-center text-muted">
            <div style={{ textAlign: 'center' }}>
              <BarChart3 size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Product performance leaderboards, historical turnover timelines, average check size calculations, and tax ledger downloads will render here.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
