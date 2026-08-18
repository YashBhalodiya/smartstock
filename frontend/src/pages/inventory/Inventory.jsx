import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCcw, 
  Edit3, 
  Search,
  ArrowUpRight,
  TrendingDown,
  Activity,
  Plus
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import SearchBar from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/States';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

const Inventory = () => {
  const { addToast } = useToast();
  const { 
    products, 
    categories, 
    suppliers,
    adjustStock, 
    triggerManualRestock 
  } = useStore();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedHealth, setSelectedHealth] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals States
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [newStockVal, setNewStockVal] = useState('');
  const [adjustReason, setAdjustReason] = useState('Discrepancy (Physical Count)');
  const [adjustError, setAdjustError] = useState('');

  const [restockingProduct, setRestockingProduct] = useState(null);
  const [restockQtyVal, setRestockQtyVal] = useState('');
  const [restockError, setRestockError] = useState('');

  // Active categories list
  const activeCategories = useMemo(() => categories.filter(c => c.status === 'Active'), [categories]);

  // Derived Top KPI Metrics
  const metrics = useMemo(() => {
    let totalItems = 0;
    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      if (p.status === 'Active') {
        totalItems += p.currentStock;
        totalValuation += p.currentStock * p.purchasePrice;
        if (p.currentStock === 0) {
          outOfStockCount++;
        } else if (p.currentStock <= p.minStock) {
          lowStockCount++;
        }
      }
    });

    return { totalItems, totalValuation, lowStockCount, outOfStockCount };
  }, [products]);

  // Filtering Products logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const isActive = p.status === 'Active';
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

      let matchesHealth = true;
      if (selectedHealth === 'Out of Stock') {
        matchesHealth = p.currentStock === 0;
      } else if (selectedHealth === 'Low Stock') {
        matchesHealth = p.currentStock <= p.minStock && p.currentStock > 0;
      } else if (selectedHealth === 'Healthy') {
        matchesHealth = p.currentStock > p.minStock;
      }

      return isActive && matchesSearch && matchesCategory && matchesHealth;
    });
  }, [products, searchQuery, selectedCategory, selectedHealth]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Quick Adjust Handlers
  const handleOpenAdjust = (product) => {
    setAdjustingProduct(product);
    setNewStockVal(product.currentStock.toString());
    setAdjustReason('Discrepancy (Physical Count)');
    setAdjustError('');
  };

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    setAdjustError('');

    const parsedStock = Number(newStockVal);
    if (newStockVal === '' || isNaN(parsedStock) || parsedStock < 0) {
      setAdjustError('Stock count cannot be negative');
      addToast('Adjustment failed: negative stock count input.', 'error');
      return;
    }

    adjustStock(adjustingProduct.sku, parsedStock, adjustReason);
    addToast(`Stock for ${adjustingProduct.title} adjusted to ${parsedStock}.`, 'success');
    setAdjustingProduct(null);
  };

  // Manual Restock Handlers
  const handleOpenRestock = (product) => {
    setRestockingProduct(product);
    setRestockQtyVal(product.restockQty.toString());
    setRestockError('');
  };

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    setRestockError('');

    const parsedQty = Number(restockQtyVal);
    if (restockQtyVal === '' || isNaN(parsedQty) || parsedQty <= 0) {
      setRestockError('Restock quantity must be greater than 0');
      addToast('Restock trigger failed: quantity must exceed 0.', 'error');
      return;
    }

    triggerManualRestock(restockingProduct.sku, parsedQty);
    addToast(`Manual purchase order created for ${restockingProduct.title} (Qty: ${parsedQty}).`, 'success');
    setRestockingProduct(null);
  };

  const getSupplierName = (id) => {
    const s = suppliers.find(s => s.id === id);
    return s ? s.name : 'Unknown Supplier';
  };

  return (
    <div className="inventory-page">
      <div className="page-header flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold">Stock Health &amp; Inventory</h1>
          <p className="text-muted text-sm">Monitor stock level health, safety thresholds, and inventory valuation</p>
        </div>
        <Badge variant="warning" style={{ padding: '6px 12px', fontSize: '13px' }}>Monitoring System Active</Badge>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid-cols-auto" style={{ gap: '20px', marginBottom: '24px' }}>
        {/* Total physical stock items */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>TOTAL ITEMS IN STOCK</span>
              <div className="kpi-icon-wrapper bg-primary-light text-primary flex-center">
                <Boxes size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>{metrics.totalItems}</h2>
            <div className="text-xs text-muted">Across all active catalog listings</div>
          </CardBody>
        </Card>

        {/* Inventory Valuation capital */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>STOCK VALUATION</span>
              <div className="kpi-icon-wrapper bg-success-light text-success flex-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>₹{metrics.totalValuation.toLocaleString('en-IN')}</h2>
            <div className="text-xs text-muted">Tied up capital (Purchase price cost)</div>
          </CardBody>
        </Card>

        {/* Low Stock count alerts */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>LOW STOCK ITEMS</span>
              <div className="kpi-icon-wrapper bg-warning-light text-warning flex-center">
                <AlertTriangle size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>{metrics.lowStockCount}</h2>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '6px' }}>
              <Badge variant={metrics.lowStockCount > 0 ? 'warning' : 'success'} style={{ fontSize: '11px' }}>
                {metrics.lowStockCount > 0 ? 'Reorder point reached' : 'All stocks healthy'}
              </Badge>
            </div>
          </CardBody>
        </Card>

        {/* Out of Stock count alerts */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>OUT OF STOCK</span>
              <div className="kpi-icon-wrapper bg-danger-light text-danger flex-center">
                <Activity size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>{metrics.outOfStockCount}</h2>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '6px' }}>
              <Badge variant={metrics.outOfStockCount > 0 ? 'danger' : 'neutral'} style={{ fontSize: '11px' }}>
                {metrics.outOfStockCount > 0 ? 'Immediate action required' : 'No empty shelves'}
              </Badge>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* FILTERS PANEL */}
      <Card style={{ marginBottom: '20px' }}>
        <CardBody style={{ padding: '16px 20px' }}>
          <div className="flex-between flex-wrap" style={{ gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <SearchBar 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                onClear={() => setSearchQuery('')}
                placeholder="Search inventory by title or SKU..."
                style={{ maxWidth: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              {/* Category Filter */}
              <div style={{ minWidth: '150px' }}>
                <Select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  options={[
                    { value: 'All', label: 'All Categories' },
                    ...activeCategories.map(c => ({ value: c.name, label: c.name }))
                  ]}
                  containerClass="margin-zero-form"
                  style={{ height: '40px', padding: '6px 14px' }}
                />
              </div>

              {/* Health Filter */}
              <div style={{ minWidth: '150px' }}>
                <Select
                  value={selectedHealth}
                  onChange={(e) => { setSelectedHealth(e.target.value); setCurrentPage(1); }}
                  options={[
                    { value: 'All', label: 'All Health Levels' },
                    { value: 'Healthy', label: 'Healthy Stock (> Min)' },
                    { value: 'Low Stock', label: 'Low Stock Warnings' },
                    { value: 'Out of Stock', label: 'Out of Stock Alerts' }
                  ]}
                  containerClass="margin-zero-form"
                  style={{ height: '40px', padding: '6px 14px' }}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* INVENTORY STOCKS TABLE */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No stock records found"
          description="Try modifying search keywords or clearing stock level filter tags."
        />
      ) : (
        <>
          <Card>
            <CardBody style={{ padding: 0 }}>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th>SKU</Th>
                    <Th>Stock Health Status</Th>
                    <Th>Reorder point (Min)</Th>
                    <Th>Stock Value (Cost)</Th>
                    <Th align="right">Inventory Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedProducts.map(product => {
                    const isOutOfStock = product.currentStock === 0;
                    const isLowStock = product.currentStock <= product.minStock && !isOutOfStock;
                    
                    // Progress bar math: safety stock indicator
                    // If currentStock is 2x minStock, bar is 100% full.
                    const maxBound = Math.max(1, product.minStock * 2);
                    const percent = Math.min(100, Math.round((product.currentStock / maxBound) * 100));

                    let barColor = 'var(--success)';
                    let badgeLabel = 'Healthy';
                    let badgeVar = 'success';
                    if (isOutOfStock) {
                      barColor = 'var(--danger)';
                      badgeLabel = 'Out of Stock';
                      badgeVar = 'danger';
                    } else if (isLowStock) {
                      barColor = 'var(--warning)';
                      badgeLabel = 'Low Stock';
                      badgeVar = 'warning';
                    }

                    return (
                      <Tr key={product.sku}>
                        <Td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="font-semibold text-neutral-800">{product.title}</span>
                            <span className="text-xs text-muted">{product.category}</span>
                          </div>
                        </Td>
                        <Td><span className="font-mono text-sm">{product.sku}</span></Td>
                        <Td style={{ minWidth: '220px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div className="flex-between text-xs font-semibold text-neutral-700">
                              <span>{product.currentStock} units</span>
                              <Badge variant={badgeVar} style={{ fontSize: '9px', padding: '1px 5px' }}>{badgeLabel}</Badge>
                            </div>
                            {/* Visual Progress Bar Wrapper */}
                            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--neutral-200)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${percent}%`, height: '100%', backgroundColor: barColor, transition: 'width var(--transition-normal)' }} />
                            </div>
                          </div>
                        </Td>
                        <Td><span className="font-medium text-neutral-800">{product.minStock} units</span></Td>
                        <Td><span className="font-bold text-neutral-800">₹{(product.currentStock * product.purchasePrice).toLocaleString('en-IN')}</span></Td>
                        <Td align="right">
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              icon={<Edit3 size={13} />}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleOpenAdjust(product)}
                            >
                              Adjust
                            </Button>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              icon={<RefreshCcw size={13} />}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleOpenRestock(product)}
                            >
                              Restock
                            </Button>
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </CardBody>
          </Card>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* QUICK ADJUST STOCK MODAL */}
      {adjustingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setAdjustingProduct(null)}
          title={`Quick Adjust Stock: ${adjustingProduct.title}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setAdjustingProduct(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleAdjustSubmit}>Confirm Adjustment</Button>
            </>
          }
        >
          <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '13.5px', color: 'var(--neutral-600)' }}>
              Adjust physical inventory counts. Current value: <strong>{adjustingProduct.currentStock} units</strong>.
            </div>
            
            <Input
              id="newStockVal"
              label="New Physical Stock Count"
              type="number"
              min="0"
              value={newStockVal}
              onChange={(e) => { setNewStockVal(e.target.value); setAdjustError(''); }}
              error={adjustError}
              required
              autoFocus
            />

            <Select
              id="adjustReason"
              label="Adjustment Reason Code"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              options={[
                { value: 'Discrepancy (Physical Count)', label: 'Discrepancy (Physical Count Verification)' },
                { value: 'Damaged Goods', label: 'Damaged / Expired Goods Write-off' },
                { value: 'Customer Return', label: 'Returned Customer Inventory' },
                { value: 'Supplier Shipment Adjustment', label: 'Supplier Shipment Discrepancy' },
                { value: 'Other', label: 'Other override' }
              ]}
              required
            />
          </form>
        </Modal>
      )}

      {/* MANUAL RESTOCK MODAL */}
      {restockingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setRestockingProduct(null)}
          title={`Manual Supplier Restock: ${restockingProduct.title}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setRestockingProduct(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleRestockSubmit}>Trigger Restock Order</Button>
            </>
          }
        >
          <form onSubmit={handleRestockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '13.5px', color: 'var(--neutral-600)' }}>
              Manually generate a pending restock purchase order with supplier <strong>{getSupplierName(restockingProduct.supplierId)}</strong>.
            </div>

            <Input
              id="restockQtyVal"
              label="Quantity to Order"
              type="number"
              min="1"
              value={restockQtyVal}
              onChange={(e) => { setRestockQtyVal(e.target.value); setRestockError(''); }}
              error={restockError}
              required
              autoFocus
            />

            {/* Invoicing summary cost detail */}
            {Number(restockQtyVal) > 0 && (
              <div style={{ padding: '12px 14px', border: '1px solid var(--neutral-200)', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--neutral-50)', fontSize: '12.5px', color: 'var(--neutral-700)' }}>
                <div className="flex-between" style={{ marginBottom: '4px' }}>
                  <span>Wholesale Purchase Cost:</span>
                  <span>₹{restockingProduct.purchasePrice} / unit</span>
                </div>
                <div className="flex-between font-bold" style={{ color: 'var(--neutral-900)' }}>
                  <span>Est. Purchase Order Amount:</span>
                  <span className="text-primary">₹{(restockingProduct.purchasePrice * Number(restockQtyVal)).toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}

    </div>
  );
};

export default Inventory;
