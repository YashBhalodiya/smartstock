import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="skeleton-page">
      <div className="page-header flex-between">
        <div>
          <h1 className="text-2xl font-bold">Store Settings</h1>
          <p className="text-muted text-sm">Configure store profiles, auto-restock thresholds, and alert parameters</p>
        </div>
        <Badge variant="neutral">System Config</Badge>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Card style={{ minHeight: '300px' }}>
          <CardHeader>
            <CardTitle>System &amp; Store Customization (Placeholder)</CardTitle>
          </CardHeader>
          <CardBody className="flex-center text-muted">
            <div style={{ textAlign: 'center' }}>
              <SettingsIcon size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Store address detail fields, low-stock safety margins, automatic purchase order dispatches, and email layout forms will be set up here.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
