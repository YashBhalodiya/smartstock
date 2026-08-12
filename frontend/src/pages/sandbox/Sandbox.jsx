import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SearchBar from '../../components/ui/SearchBar';
import DatePicker from '../../components/ui/DatePicker';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from '../../components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Tabs from '../../components/ui/Tabs';
import Tooltip from '../../components/ui/Tooltip';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Drawer from '../../components/ui/Drawer';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { Eye, Trash2, PlusCircle, AlertCircle, ShoppingCart } from 'lucide-react';

const Sandbox = () => {
  const { addToast } = useToast();
  
  // Interactive component states
  const [activeTab, setActiveTab] = useState('buttons');
  const [searchVal, setSearchVal] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const tabsList = [
    { id: 'buttons', label: 'Buttons & Badges' },
    { id: 'forms', label: 'Form Elements' },
    { id: 'containers', label: 'Cards & Tabs' },
    { id: 'overlays', label: 'Modals & Drawers' },
    { id: 'tables', label: 'Tables & Pagination' },
    { id: 'states', label: 'Fallback States' }
  ];

  const toggleLoadingState = () => {
    setBtnLoading(true);
    setTimeout(() => setBtnLoading(false), 2000);
  };

  return (
    <div className="sandbox-page">
      <div className="page-header flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold">UI Component Sandbox</h1>
          <p className="text-muted text-sm">Preview, interact with, and verify the design system components</p>
        </div>
        <Badge variant="success">Developer Playground</Badge>
      </div>

      {/* Tabs Selector */}
      <Tabs tabs={tabsList} activeTab={activeTab} onChange={setActiveTab} />

      <div className="sandbox-content" style={{ marginTop: '24px' }}>
        
        {/* BUTTONS & BADGES TAB */}
        {activeTab === 'buttons' && (
          <div className="flex-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>Buttons support multiple actions, loader integrations, and icons.</CardDescription>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <Button variant="primary">Primary Indigo</Button>
                  <Button variant="secondary">Secondary Slate</Button>
                  <Button variant="success">Success Green</Button>
                  <Button variant="danger">Danger Red</Button>
                  <Button variant="warning">Warning Amber</Button>
                  <Button variant="outline">Outline Border</Button>
                  <Button variant="ghost">Ghost Plain</Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Customizations</CardTitle>
                <CardDescription>Buttons support different sizes, loading status, icons, and disabling.</CardDescription>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Button variant="primary" size="sm">Small Button</Button>
                    <Button variant="primary" size="md">Medium Button</Button>
                    <Button variant="primary" size="lg">Large Button</Button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Button variant="primary" loading={btnLoading} onClick={toggleLoadingState}>
                      {btnLoading ? 'Processing...' : 'Click to Load (2s)'}
                    </Button>
                    <Button variant="success" icon={<ShoppingCart size={16} />}>Checkout Icon</Button>
                    <Button variant="outline" icon={<Eye size={16} />} iconPosition="right">View Details</Button>
                    <Button variant="primary" disabled>Disabled Action</Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Badges</CardTitle>
                <CardDescription>Used to identify states (low stock, received, pending, active).</CardDescription>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <Badge variant="primary">Active</Badge>
                    <Badge variant="success">Completed</Badge>
                    <Badge variant="warning">Low Stock</Badge>
                    <Badge variant="danger">Out of Stock</Badge>
                    <Badge variant="neutral">Inactive</Badge>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                    <Badge variant="primary" dot>Primary Indicator</Badge>
                    <Badge variant="success" dot>Healthy Stock</Badge>
                    <Badge variant="warning" dot>Restock Alert</Badge>
                    <Badge variant="danger" dot>Critical Outage</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* FORM ELEMENTS TAB */}
        {activeTab === 'forms' && (
          <Card>
            <CardHeader>
              <CardTitle>Forms &amp; Input Controls</CardTitle>
              <CardDescription>Standard input controls, search bar filters, and date picker wrappers.</CardDescription>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
                <Input 
                  label="Product SKU" 
                  placeholder="e.g. PROD-10250" 
                  helperText="Leave blank for auto-generation."
                />
                
                <Input 
                  label="Password" 
                  type="password" 
                  placeholder="••••••••" 
                  error="Password must contain at least 6 characters."
                />

                <Select 
                  label="Category Department" 
                  placeholder="Select a category..."
                  options={[
                    { value: 'grains', label: 'Grains & Pulses' },
                    { value: 'fmcg', label: 'FMCG Goods' },
                    { value: 'dairy', label: 'Dairy & Eggs' }
                  ]}
                />

                <DatePicker 
                  label="Select Sale Date" 
                  defaultValue="2026-08-12"
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="form-label">Search Filter Bar</span>
                  <SearchBar 
                    value={searchVal} 
                    onChange={(e) => setSearchVal(e.target.value)} 
                    onClear={() => setSearchVal('')}
                    placeholder="Search by SKU or invoice..."
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* CARDS & TABS TAB */}
        {activeTab === 'containers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card>
              <CardHeader>
                <CardTitle>Panel Card Container</CardTitle>
                <CardDescription>Cards group related metrics or lists together.</CardDescription>
              </CardHeader>
              <CardBody>
                <p>Card body contains the main copy, forms, charts, tables or summaries.</p>
              </CardBody>
              <CardFooter>
                <Button variant="secondary" size="sm">Cancel</Button>
                <Button variant="primary" size="sm">Save Changes</Button>
              </CardFooter>
            </Card>

            <Card onClick={() => addToast('Interactive card clicked!', 'info')}>
              <CardBody className="flex-center" style={{ minHeight: '120px' }}>
                <div style={{ textAlign: 'center' }}>
                  <h4 className="font-semibold">Interactive Card Hover Effect</h4>
                  <p className="text-muted text-sm" style={{ marginTop: '4px' }}>Hovering will translate the container slightly and add shadow. Click me to trigger a Toast notification!</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tooltip Helper Bubble</CardTitle>
                <CardDescription>Hover over the badges to inspect tooltip positions.</CardDescription>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <Tooltip content="Tooltip details shown on top" position="top">
                    <Badge variant="primary">Hover Top</Badge>
                  </Tooltip>

                  <Tooltip content="Tooltip details shown on bottom" position="bottom">
                    <Badge variant="success">Hover Bottom</Badge>
                  </Tooltip>

                  <Tooltip content="Tooltip details shown on left" position="left">
                    <Badge variant="warning">Hover Left</Badge>
                  </Tooltip>

                  <Tooltip content="Tooltip details shown on right" position="right">
                    <Badge variant="danger">Hover Right</Badge>
                  </Tooltip>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* MODALS & DRAWERS TAB */}
        {activeTab === 'overlays' && (
          <Card>
            <CardHeader>
              <CardTitle>Overlay Triggers</CardTitle>
              <CardDescription>Simulate and test interactive Modals, drawers and Confirm Dialogs.</CardDescription>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Toast Section */}
                <div>
                  <h4 className="font-semibold" style={{ marginBottom: '8px' }}>Toast Notifications</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <Button variant="success" onClick={() => addToast('Product added successfully!', 'success')}>
                      Success Toast
                    </Button>
                    <Button variant="danger" onClick={() => addToast('Unable to complete sale.', 'error')}>
                      Error Toast
                    </Button>
                    <Button variant="warning" onClick={() => addToast('Maggi stock is low.', 'warning')}>
                      Warning Toast
                    </Button>
                    <Button variant="primary" onClick={() => addToast('Purchase order sent.', 'info')}>
                      Info Toast
                    </Button>
                  </div>
                </div>

                {/* Modals & Drawers Section */}
                <div>
                  <h4 className="font-semibold" style={{ marginBottom: '8px' }}>Modals &amp; Side Panels</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <Button variant="outline" onClick={() => setIsModalOpen(true)}>Open Overlay Modal</Button>
                    <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>Open Side Drawer</Button>
                    <Button variant="outline" onClick={() => setIsConfirmOpen(true)}>Open Confirm Dialog</Button>
                  </div>
                </div>
              </div>

              {/* OVERLAY COMPONENT RENDERINGS */}
              <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Product Information Details"
                footer={<Button variant="primary" onClick={() => setIsModalOpen(false)}>Okay</Button>}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p><strong>Product:</strong> Maggi 2-Min Noodles</p>
                  <p><strong>Category:</strong> FMCG Goods</p>
                  <p><strong>Description:</strong> Standard 70g instant noodles packet supplied by Nestle India.</p>
                </div>
              </Modal>

              <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                  setIsConfirmOpen(false);
                  addToast('Purchase order successfully sent to supplier.', 'success');
                }}
                title="Approve Restock Order #RO-1004?"
                message="This will immediately dispatch a purchase order list to Gujarat FMCG Supply wholesalers via email."
                type="warning"
                confirmText="Approve &amp; Send"
              />

              <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Invoice Preview #INV-1024"
                footer={
                  <>
                    <Button variant="secondary" onClick={() => setIsDrawerOpen(false)}>Close</Button>
                    <Button variant="primary" onClick={() => { setIsDrawerOpen(false); addToast('Invoice print triggered.', 'success'); }}>Print</Button>
                  </>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="flex-between">
                    <span className="font-semibold">Items Purchase:</span>
                    <Badge variant="success">Completed</Badge>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--neutral-200)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="flex-between text-sm">
                      <span>Maggi 2-Min Noodles × 2</span>
                      <span>₹24.00</span>
                    </div>
                    <div className="flex-between text-sm">
                      <span>Dove Soap 100g × 1</span>
                      <span>₹55.00</span>
                    </div>
                    <div className="flex-between text-sm">
                      <span>Aashirvaad Atta 5kg × 1</span>
                      <span>₹260.00</span>
                    </div>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--neutral-200)' }} />
                  <div className="flex-between font-bold">
                    <span>Total Bill:</span>
                    <span>₹339.00</span>
                  </div>
                </div>
              </Drawer>

            </CardBody>
          </Card>
        )}

        {/* TABLES & PAGINATION TAB */}
        {activeTab === 'tables' && (
          <Card>
            <CardHeader>
              <CardTitle>Data Tables &amp; Paginations</CardTitle>
              <CardDescription>Styled data table with header tags, hover rows, actions, and page metrics.</CardDescription>
            </CardHeader>
            <CardBody>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Product SKU</Th>
                    <Th>Item Title</Th>
                    <Th>Stock Status</Th>
                    <Th>Purchase Price</Th>
                    <Th align="right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td><span className="font-semibold">Tata Salt 1kg</span></Td>
                    <Td>FMCG Goods</Td>
                    <Td><Badge variant="success">Healthy (55 left)</Badge></Td>
                    <Td>₹28.00</Td>
                    <Td align="right">
                      <Button variant="ghost" size="sm" icon={<Eye size={14} />} />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td><span className="font-semibold">Maggi Noodles</span></Td>
                    <Td>FMCG Goods</Td>
                    <Td><Badge variant="warning">Low Stock (9 left)</Badge></Td>
                    <Td>₹12.00</Td>
                    <Td align="right">
                      <Button variant="ghost" size="sm" icon={<Eye size={14} />} />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td><span className="font-semibold">Fortune Oil 1L</span></Td>
                    <Td>Grains &amp; Oils</Td>
                    <Td><Badge variant="danger">Out of Stock</Badge></Td>
                    <Td>₹145.00</Td>
                    <Td align="right">
                      <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} style={{ color: 'var(--danger)' }} />
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
              
              <Pagination 
                currentPage={currentPage} 
                totalPages={6} 
                onPageChange={setCurrentPage} 
              />
            </CardBody>
          </Card>
        )}

        {/* STATES TAB */}
        {activeTab === 'states' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              <div>
                <h4 className="font-semibold" style={{ marginBottom: '8px' }}>1. Spinner Loading State</h4>
                <LoadingState message="Loading restock logs..." />
              </div>
              
              <div>
                <h4 className="font-semibold" style={{ marginBottom: '8px' }}>2. Skeleton Shimmer Loading State</h4>
                <LoadingState variant="skeleton" />
              </div>

              <div>
                <h4 className="font-semibold" style={{ marginBottom: '8px' }}>3. Empty / Blank State</h4>
                <EmptyState 
                  title="No supplier invoices found"
                  description="Supplier purchase logs will render here as soon as orders are marked received."
                  actionLabel="Add Product Invoice"
                  onAction={() => addToast('Invoice creation modal will toggle.', 'info')}
                />
              </div>

              <div>
                <h4 className="font-semibold" style={{ marginBottom: '8px' }}>4. Error Failure State</h4>
                <ErrorState 
                  title="Unable to connect to database"
                  message="We couldn't synchronize the items list. Please check internet connections and retry."
                  onRetry={() => addToast('Retrying database fetch...', 'info')}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Sandbox;
