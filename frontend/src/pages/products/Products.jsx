import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit3, 
  Eye, 
  Power, 
  PowerOff,
  Filter,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SearchBar from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/States';
import Tooltip from '../../components/ui/Tooltip';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

const Products = () => {
  const { addToast } = useToast();
  const { 
    products, 
    suppliers, 
    categories, 
    addProduct, 
    updateProduct, 
    toggleProductStatus 
  } = useStore();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStockStatus, setFilterStockStatus] = useState('All');
  const [filterSupplier, setFilterSupplier] = useState('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [editingSku, setEditingSku] = useState(null);

  // Form Inputs State
  const [formValues, setFormValues] = useState({
    title: '',
    sku: '',
    barcode: '',
    category: '',
    supplierId: '',
    purchasePrice: '',
    sellingPrice: '',
    currentStock: '',
    minStock: '',
    restockQty: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Status Toggle Confirm Dialog State
  const [confirmToggle, setConfirmToggle] = useState(null); // stores sku

  // Derived filter selections lists
  const activeCategories = useMemo(() => categories.filter(c => c.status === 'Active'), [categories]);
  const activeSuppliers = useMemo(() => suppliers.filter(s => s.status === 'Active'), [suppliers]);

  // Filtering Products logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);

      const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
      
      const matchesSupplier = filterSupplier === 'All' || p.supplierId === filterSupplier;

      let matchesStock = true;
      if (filterStockStatus === 'Out of Stock') {
        matchesStock = p.currentStock === 0;
      } else if (filterStockStatus === 'Low Stock') {
        matchesStock = p.currentStock <= p.minStock && p.currentStock > 0;
      } else if (filterStockStatus === 'In Stock') {
        matchesStock = p.currentStock > p.minStock;
      }

      return matchesSearch && matchesCategory && matchesSupplier && matchesStock;
    });
  }, [products, searchQuery, filterCategory, filterSupplier, filterStockStatus]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Form Handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
    // Clear validation error when typing
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formValues.title.trim()) errors.title = 'Product name is required';
    if (!formValues.sku.trim()) errors.sku = 'SKU is required';
    if (!formValues.barcode.trim()) errors.barcode = 'Barcode scanner number is required';
    if (!formValues.category) errors.category = 'Please select a category department';
    if (!formValues.supplierId) errors.supplierId = 'Please select a supplier contact';

    // Numeric checks
    const sPrice = Number(formValues.sellingPrice);
    const pPrice = Number(formValues.purchasePrice);
    const cStock = Number(formValues.currentStock);
    const mStock = Number(formValues.minStock);
    const rQty = Number(formValues.restockQty);

    if (formValues.purchasePrice === '' || isNaN(pPrice) || pPrice < 0) {
      errors.purchasePrice = 'Purchase price cannot be negative';
    }
    if (formValues.sellingPrice === '' || isNaN(sPrice) || sPrice < 0) {
      errors.sellingPrice = 'Selling price cannot be negative';
    }
    if (formValues.currentStock === '' || isNaN(cStock) || cStock < 0) {
      errors.currentStock = 'Current stock cannot be negative';
    }
    if (formValues.minStock === '' || isNaN(mStock) || mStock < 0) {
      errors.minStock = 'Minimum stock cannot be negative';
    }
    if (formValues.restockQty === '' || isNaN(rQty) || rQty <= 0) {
      errors.restockQty = 'Restock quantity must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddModal = () => {
    setFormMode('add');
    setEditingSku(null);
    setFormValues({
      title: '',
      sku: '',
      barcode: '',
      category: '',
      supplierId: '',
      purchasePrice: '',
      sellingPrice: '',
      currentStock: '',
      minStock: '',
      restockQty: ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (product) => {
    setFormMode('edit');
    setEditingSku(product.sku);
    setFormValues({
      title: product.title,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      supplierId: product.supplierId,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      currentStock: product.currentStock,
      minStock: product.minStock,
      restockQty: product.restockQty
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast('Please resolve validation errors in the form.', 'error');
      return;
    }

    const payload = {
      title: formValues.title,
      sku: formValues.sku,
      barcode: formValues.barcode,
      category: formValues.category,
      supplierId: formValues.supplierId,
      purchasePrice: Number(formValues.purchasePrice),
      sellingPrice: Number(formValues.sellingPrice),
      currentStock: Number(formValues.currentStock),
      minStock: Number(formValues.minStock),
      restockQty: Number(formValues.restockQty)
    };

    if (formMode === 'add') {
      // Check if SKU already exists
      const skuExists = products.some(p => p.sku.toLowerCase() === payload.sku.toLowerCase());
      if (skuExists) {
        setFormErrors(prev => ({ ...prev, sku: 'This SKU is already associated with another product' }));
        addToast('SKU already exists in catalog.', 'error');
        return;
      }
      
      addProduct(payload);
      addToast('Product successfully added to catalog!', 'success');
    } else {
      updateProduct(editingSku, payload);
      addToast('Product details updated successfully!', 'success');
    }
    
    setIsFormOpen(false);
  };

  const handleToggleConfirm = (sku) => {
    setConfirmToggle(sku);
  };

  const handleStatusToggle = () => {
    if (confirmToggle) {
      toggleProductStatus(confirmToggle);
      addToast('Product status toggled successfully.', 'success');
      setConfirmToggle(null);
    }
  };

  const openDetailModal = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const getSupplierName = (id) => {
    const s = suppliers.find(s => s.id === id);
    return s ? s.name : 'Unknown Supplier';
  };

  return (
    <div className="products-page">
      <div className="page-header flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted text-sm">Manage, search, and update your store catalog items</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={openAddModal}>
          Add Product
        </Button>
      </div>

      {/* FILTER PANEL */}
      <Card style={{ marginBottom: '20px' }}>
        <CardBody style={{ padding: '16px 20px' }}>
          <div className="flex-between flex-wrap" style={{ gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <SearchBar 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                onClear={() => setSearchQuery('')}
                placeholder="Search by title, SKU, barcode..."
                style={{ maxWidth: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              {/* Category Filter */}
              <div style={{ minWidth: '150px' }}>
                <Select
                  value={filterCategory}
                  onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                  options={[
                    { value: 'All', label: 'All Categories' },
                    ...activeCategories.map(c => ({ value: c.name, label: c.name }))
                  ]}
                  containerClass="margin-zero-form"
                  style={{ height: '40px', padding: '6px 14px' }}
                />
              </div>

              {/* Stock Status Filter */}
              <div style={{ minWidth: '150px' }}>
                <Select
                  value={filterStockStatus}
                  onChange={(e) => { setFilterStockStatus(e.target.value); setCurrentPage(1); }}
                  options={[
                    { value: 'All', label: 'All Stock Health' },
                    { value: 'In Stock', label: 'In Stock (Healthy)' },
                    { value: 'Low Stock', label: 'Low Stock Warnings' },
                    { value: 'Out of Stock', label: 'Out of Stock Alerts' }
                  ]}
                  containerClass="margin-zero-form"
                  style={{ height: '40px', padding: '6px 14px' }}
                />
              </div>

              {/* Supplier Filter */}
              <div style={{ minWidth: '160px' }}>
                <Select
                  value={filterSupplier}
                  onChange={(e) => { setFilterSupplier(e.target.value); setCurrentPage(1); }}
                  options={[
                    { value: 'All', label: 'All Suppliers' },
                    ...activeSuppliers.map(s => ({ value: s.id, label: s.name }))
                  ]}
                  containerClass="margin-zero-form"
                  style={{ height: '40px', padding: '6px 14px' }}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* PRODUCTS TABLE */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No products match criteria"
          description="Try clearing your search keyword, category sorting, or stock health filters."
          actionLabel="Add New Product"
          onAction={openAddModal}
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
                    <Th>Stock Status</Th>
                    <Th>Selling Price</Th>
                    <Th>Purchase Price</Th>
                    <Th>Supplier</Th>
                    <Th>Status</Th>
                    <Th align="right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedProducts.map((product) => {
                    const isOutOfStock = product.currentStock === 0;
                    const isLowStock = product.currentStock <= product.minStock && !isOutOfStock;
                    const isInactive = product.status === 'Inactive';

                    return (
                      <Tr key={product.sku} style={isInactive ? { opacity: 0.6 } : {}}>
                        <Td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="font-semibold text-neutral-800">{product.title}</span>
                            <span className="text-xs text-muted">{product.category}</span>
                          </div>
                        </Td>
                        <Td><span className="font-mono text-sm">{product.sku}</span></Td>
                        <Td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className={isOutOfStock || isLowStock ? 'text-danger font-bold' : ''}>
                              {product.currentStock} units
                            </span>
                            {isOutOfStock ? (
                              <Badge variant="danger" style={{ fontSize: '9px' }}>OUT OF STOCK</Badge>
                            ) : isLowStock ? (
                              <Badge variant="warning" style={{ fontSize: '9px' }}>LOW STOCK</Badge>
                            ) : (
                              <Badge variant="success" style={{ fontSize: '9px' }}>HEALTHY</Badge>
                            )}
                          </div>
                        </Td>
                        <Td><span className="font-semibold text-neutral-800">₹{product.sellingPrice}</span></Td>
                        <Td className="text-muted">₹{product.purchasePrice}</Td>
                        <Td>{getSupplierName(product.supplierId)}</Td>
                        <Td>
                          <Badge variant={isInactive ? 'neutral' : 'success'}>
                            {product.status}
                          </Badge>
                        </Td>
                        <Td align="right">
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <Tooltip content="Quick View">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                style={{ padding: '6px' }}
                                onClick={() => openDetailModal(product)}
                              >
                                <Eye size={15} />
                              </Button>
                            </Tooltip>
                            
                            <Tooltip content="Edit Details">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                style={{ padding: '6px' }}
                                onClick={() => openEditModal(product)}
                              >
                                <Edit3 size={15} />
                              </Button>
                            </Tooltip>

                            <Tooltip content={isInactive ? "Activate" : "Deactivate"}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                style={{ padding: '6px', color: isInactive ? 'var(--success)' : 'var(--danger)' }}
                                onClick={() => handleToggleConfirm(product.sku)}
                              >
                                {isInactive ? <Power size={15} /> : <PowerOff size={15} />}
                              </Button>
                            </Tooltip>
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

      {/* ADD / EDIT PRODUCT MODAL FORM */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === 'add' ? 'Add New Product' : `Edit Product: ${formValues.title}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleFormSubmit}>
              {formMode === 'add' ? 'Save Product' : 'Update Details'}
            </Button>
          </>
        }
      >
        <form className="modal-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          <Input
            id="title"
            label="Product Title"
            value={formValues.title}
            onChange={handleInputChange}
            placeholder="e.g. Maggi Oats Noodles"
            error={formErrors.title}
            containerClass="grid-span-all"
            required
          />

          <Input
            id="sku"
            label="Product SKU"
            value={formValues.sku}
            onChange={handleInputChange}
            placeholder="e.g. SKU-1012"
            disabled={formMode === 'edit'}
            error={formErrors.sku}
            required
          />

          <Input
            id="barcode"
            label="Barcode Number"
            value={formValues.barcode}
            onChange={handleInputChange}
            placeholder="890105800..."
            error={formErrors.barcode}
            required
          />

          <Select
            id="category"
            label="Category Department"
            value={formValues.category}
            onChange={handleInputChange}
            placeholder="Select category..."
            options={activeCategories.map(c => ({ value: c.name, label: c.name }))}
            error={formErrors.category}
            required
          />

          <Select
            id="supplierId"
            label="Supplier Partner"
            value={formValues.supplierId}
            onChange={handleInputChange}
            placeholder="Select supplier wholesale..."
            options={activeSuppliers.map(s => ({ value: s.id, label: s.name }))}
            error={formErrors.supplierId}
            required
          />

          <Input
            id="purchasePrice"
            label="Purchase Price (₹)"
            type="number"
            min="0"
            step="0.01"
            value={formValues.purchasePrice}
            onChange={handleInputChange}
            placeholder="0"
            error={formErrors.purchasePrice}
            required
          />

          <Input
            id="sellingPrice"
            label="Selling Price (₹)"
            type="number"
            min="0"
            step="0.01"
            value={formValues.sellingPrice}
            onChange={handleInputChange}
            placeholder="0"
            error={formErrors.sellingPrice}
            required
          />

          <Input
            id="currentStock"
            label="Current Physical Stock"
            type="number"
            min="0"
            value={formValues.currentStock}
            onChange={handleInputChange}
            placeholder="0"
            error={formErrors.currentStock}
            required
          />

          <Input
            id="minStock"
            label="Safety Threshold (Min)"
            type="number"
            min="0"
            value={formValues.minStock}
            onChange={handleInputChange}
            placeholder="0"
            error={formErrors.minStock}
            required
          />

          <Input
            id="restockQty"
            label="Default Replenish Qty"
            type="number"
            min="1"
            value={formValues.restockQty}
            onChange={handleInputChange}
            placeholder="50"
            error={formErrors.restockQty}
            containerClass="grid-span-all"
            required
          />
        </form>
      </Modal>

      {/* DEACTIVATION CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={confirmToggle !== null}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleStatusToggle}
        title="Toggle Product Status?"
        message="Deactivating this product will hide it from the POS terminal immediately. You can re-activate it anytime."
        type="warning"
        confirmText="Toggle Status"
      />

      {/* QUICK VIEW DETAILS MODAL */}
      {selectedProduct && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Product View: ${selectedProduct.title}`}
          footer={<Button variant="primary" onClick={() => setIsDetailOpen(false)}>Okay</Button>}
        >
          <div className="product-detail-sheet" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex-between">
              <span className="font-bold" style={{ fontSize: '15px' }}>{selectedProduct.title}</span>
              <Badge variant={selectedProduct.status === 'Inactive' ? 'neutral' : 'success'}>
                {selectedProduct.status}
              </Badge>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--neutral-200)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13.5px' }}>
              <div><strong className="text-muted">SKU Reference:</strong> <span className="font-mono">{selectedProduct.sku}</span></div>
              <div><strong className="text-muted">Barcode Scanner:</strong> <span className="font-mono">{selectedProduct.barcode}</span></div>
              <div><strong className="text-muted">Category Class:</strong> {selectedProduct.category}</div>
              <div><strong className="text-muted">Wholesale Vendor:</strong> {getSupplierName(selectedProduct.supplierId)}</div>
              <div><strong className="text-muted">Purchase Cost:</strong> ₹{selectedProduct.purchasePrice}</div>
              <div><strong className="text-muted">Selling Cost:</strong> ₹{selectedProduct.sellingPrice}</div>
              <div><strong className="text-muted">Current Stock count:</strong> {selectedProduct.currentStock} units</div>
              <div><strong className="text-muted">Safety Threshold (Min):</strong> {selectedProduct.minStock} units</div>
              <div className="grid-span-all" style={{ marginTop: '4px' }}>
                <strong className="text-muted">Stock Health Status:</strong>{' '}
                {selectedProduct.currentStock === 0 ? (
                  <Badge variant="danger">Out of Stock Alerts</Badge>
                ) : selectedProduct.currentStock <= selectedProduct.minStock ? (
                  <Badge variant="warning">Low Stock Warning</Badge>
                ) : (
                  <Badge variant="success">Healthy stock levels</Badge>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default Products;
