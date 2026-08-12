import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { FolderTree } from 'lucide-react';

const Categories = () => {
  return (
    <div className="skeleton-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted text-sm">Organize products into functional departments and sections</p>
        </div>
        <Badge variant="neutral">Management</Badge>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Card style={{ minHeight: '300px' }}>
          <CardHeader>
            <CardTitle>Departments &amp; Categories Table (Placeholder)</CardTitle>
          </CardHeader>
          <CardBody className="flex-center text-muted">
            <div style={{ textAlign: 'center' }}>
              <FolderTree size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Add/edit departments (e.g. Beverages, FMCG, Dairy), review item counts, and manage classification toggles here.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Categories;
