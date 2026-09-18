import React, { useState, useMemo } from 'react';
import { 
  RefreshCcw, 
  Send, 
  PackageCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Plus, 
  Search, 
  Mail, 
  Building2, 
  X, 
  DollarSign,
  Ban
} from 'lucide-react';

import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import SearchBar from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/States';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { restockService } from '../../services/restock.service';

const RestockOrders = () => {
  const { addToast } = useToast();
  const { 
    restockOrders, 
    setRestockOrders,
    products, 
    suppliers, 
    approveRestockOrder, 
    receiveRestock,
    refreshRestockOrders,
    refreshProducts
  } = useStore();

  // State filters
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [receivingOrder, setReceivingOrder] = useState(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isSubmittingReceive, setIsSubmittingReceive] = useState(false);

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualProdId, setManualProdId] = useState('');
  const [manualQty, setManualQty] = useState('');
  const [manualError, setManualError] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const [approvingOrderId, setApprovingOrderId] = useState(null);

  // Filtered orders calculation
  const filteredOrders = useMemo(() => {
    return (restockOrders || []).filter(order => {
      if (!order) return false;
      const matchesSearch = 
        (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.supplierName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.products || []).some(p => (p && (p.title || p.name || '')).toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesTab = true;
      if (activeTab === 'Pending Approval') {
        matchesTab = order.status === 'Pending Approval' || order.rawStatus === 'PENDING_APPROVAL';
      } else if (activeTab === 'Email Sent') {
        matchesTab = order.status === 'Email Sent' || order.rawStatus === 'APPROVED' || order.rawStatus === 'SENT';
      } else if (activeTab === 'Received') {
        matchesTab = order.status === 'Received' || order.rawStatus === 'RECEIVED';
      } else if (activeTab === 'Cancelled') {
        matchesTab = order.status === 'Cancelled' || order.rawStatus === 'CANCELLED';
      }

      return matchesSearch && matchesTab;
    });
  }, [restockOrders, searchQuery, activeTab]);

  // Derived KPI metrics
  const metrics = useMemo(() => {
    let pendingCount = 0;
    let sentCount = 0;
    let receivedCount = 0;
    let totalValue = 0;

    (restockOrders || []).forEach(o => {
      if (!o) return;
      const status = o.status;
      const rawStatus = o.rawStatus;
      const val = Number(o.totalAmount || 0);

      totalValue += val;

      if (status === 'Pending Approval' || rawStatus === 'PENDING_APPROVAL') {
        pendingCount++;
      } else if (status === 'Email Sent' || rawStatus === 'APPROVED' || rawStatus === 'SENT') {
        sentCount++;
      } else if (status === 'Received' || rawStatus === 'RECEIVED') {
        receivedCount++;
      }
    });

    return { pendingCount, sentCount, receivedCount, totalValue };
  }, [restockOrders]);

  // Action Handlers
  const handleApprove = async (order) => {
    setApprovingOrderId(order.id);
    try {
      await approveRestockOrder(order.id);
      addToast({
        type: 'success',
        title: 'Restock Order Approved & Emailed',
        message: `Order #${order.orderNumber || order.id} has been approved. Purchase order email sent to ${order.email || order.supplierName}.`
      });
      if (refreshRestockOrders) await refreshRestockOrders();
    } catch (err) {
      addToast({
        type: 'danger',
        title: 'Approval Failed',
        message: err.message || 'Failed to approve restock order'
      });
    } finally {
      setApprovingOrderId(null);
      if (isDetailModalOpen) setIsDetailModalOpen(false);
    }
  };

  const handleOpenReceive = (order) => {
    setReceivingOrder(order);
    setIsReceiveModalOpen(true);
  };

  const handleConfirmReceive = async () => {
    if (!receivingOrder) return;
    setIsSubmittingReceive(true);
    try {
      await receiveRestock(receivingOrder.id, null, receivingOrder);
      addToast({
        type: 'success',
        title: 'Inventory Stock Updated',
        message: `Restock items for #${receivingOrder.orderNumber || receivingOrder.id} marked as received. Stock levels replenished!`
      });
      if (refreshRestockOrders) await refreshRestockOrders();
      if (refreshProducts) await refreshProducts();
      setIsReceiveModalOpen(false);
      setReceivingOrder(null);
    } catch (err) {
      addToast({
        type: 'danger',
        title: 'Error Receiving Stock',
        message: err.message || 'Failed to update restock status'
      });
    } finally {
      setIsSubmittingReceive(false);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel purchase order #${order.orderNumber || order.id}?`)) return;
    try {
      if (localStorage.getItem('stockflow_token')) {
        await restockService.cancelRestockOrder(order.id);
      }
      setRestockOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Cancelled', rawStatus: 'CANCELLED' } : o));
      addToast({
        type: 'warning',
        title: 'Order Cancelled',
        message: `Restock order #${order.orderNumber || order.id} marked as cancelled.`
      });
      if (refreshRestockOrders) await refreshRestockOrders();
    } catch (err) {
      addToast({
        type: 'danger',
        title: 'Cancellation Error',
        message: err.message || 'Failed to cancel order'
      });
    }
  };

  const handleCreateManualOrder = async (e) => {
    e.preventDefault();
    if (!manualProdId) {
      setManualError('Please select a product');
      return;
    }
    const qty = Number(manualQty);
    if (!qty || qty <= 0) {
      setManualError('Please enter a valid order quantity');
      return;
    }

    setIsSubmittingManual(true);
    setManualError('');

    try {
      if (localStorage.getItem('stockflow_token')) {
        const selectedProd = products.find(p => p.id === manualProdId || p.sku === manualProdId);
        await restockService.createRestockOrder({
          productId: selectedProd ? selectedProd.id : manualProdId,
          supplierId: selectedProd ? selectedProd.supplierId : undefined,
          quantity: qty
        });
        if (refreshRestockOrders) await refreshRestockOrders();
      }
      
      addToast({
        type: 'success',
        title: 'Restock Request Created',
        message: `New purchase order request queued in Pending Approval.`
      });

      setIsManualModalOpen(false);
      setManualProdId('');
      setManualQty('');
    } catch (err) {
      setManualError(err.message || 'Failed to generate restock order');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const renderStatusBadge = (status, rawStatus) => {
    const s = status || mapStatusLabel(rawStatus);
    if (s === 'Pending Approval' || rawStatus === 'PENDING_APPROVAL') {
      return <Badge variant="warning" dot>Pending Approval</Badge>;
    }
    if (s === 'Email Sent' || rawStatus === 'APPROVED' || rawStatus === 'SENT') {
      return <Badge variant="info" dot>Email Sent</Badge>;
    }
    if (s === 'Received' || rawStatus === 'RECEIVED') {
      return <Badge variant="success" dot>Received</Badge>;
    }
    if (s === 'Cancelled' || rawStatus === 'CANCELLED') {
      return <Badge variant="neutral" dot>Cancelled</Badge>;
    }
    return <Badge variant="neutral">{s}</Badge>;
  };

  return (
    <div className="restock-orders-page" style={{ paddingBottom: '40px' }}>
      {/* Top Header */}
      <div className="page-header flex-between flex-wrap gap-4" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Automated Restock Purchase Orders</h1>
          <p className="text-muted text-sm" style={{ marginTop: '4px' }}>
            Replenish out-of-stock items, review automated requests, approve purchase orders, and trigger supplier dispatch emails.
          </p>
        </div>
        <div className="flex-center gap-3">
          <Button 
            variant="secondary" 
            icon={<RefreshCcw size={16} />} 
            onClick={() => refreshRestockOrders && refreshRestockOrders()}
          >
            Refresh
          </Button>
          <Button 
            variant="primary" 
            icon={<Plus size={16} />} 
            onClick={() => {
              setManualError('');
              setIsManualModalOpen(true);
            }}
          >
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-4 gap-4" style={{ marginBottom: '24px' }}>
        <Card style={{ borderLeft: '4px solid #f59e0b', borderRadius: '12px' }}>
          <CardBody className="flex-between">
            <div>
              <p className="text-xs font-semibold text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>Pending Approval</p>
              <h3 className="text-2xl font-bold" style={{ marginTop: '6px', color: '#b45309' }}>{metrics.pendingCount} Orders</h3>
              <p className="text-xs text-muted" style={{ marginTop: '4px' }}>Awaiting shopkeeper approval</p>
            </div>
            <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '50%', color: '#d97706' }}>
              <Clock size={24} />
            </div>
          </CardBody>
        </Card>

        <Card style={{ borderLeft: '4px solid #3b82f6', borderRadius: '12px' }}>
          <CardBody className="flex-between">
            <div>
              <p className="text-xs font-semibold text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>Dispatched Emails</p>
              <h3 className="text-2xl font-bold" style={{ marginTop: '6px', color: '#1d4ed8' }}>{metrics.sentCount} Orders</h3>
              <p className="text-xs text-muted" style={{ marginTop: '4px' }}>Approved & sent to suppliers</p>
            </div>
            <div style={{ backgroundColor: '#dbeafe', padding: '12px', borderRadius: '50%', color: '#2563eb' }}>
              <Mail size={24} />
            </div>
          </CardBody>
        </Card>

        <Card style={{ borderLeft: '4px solid #10b981', borderRadius: '12px' }}>
          <CardBody className="flex-between">
            <div>
              <p className="text-xs font-semibold text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>Received & Restocked</p>
              <h3 className="text-2xl font-bold" style={{ marginTop: '6px', color: '#047857' }}>{metrics.receivedCount} Orders</h3>
              <p className="text-xs text-muted" style={{ marginTop: '4px' }}>Stock added to store catalog</p>
            </div>
            <div style={{ backgroundColor: '#d1fae5', padding: '12px', borderRadius: '50%', color: '#059669' }}>
              <PackageCheck size={24} />
            </div>
          </CardBody>
        </Card>

        <Card style={{ borderLeft: '4px solid #8b5cf6', borderRadius: '12px' }}>
          <CardBody className="flex-between">
            <div>
              <p className="text-xs font-semibold text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Restock Value</p>
              <h3 className="text-2xl font-bold" style={{ marginTop: '6px', color: '#6d28d9' }}>₹{metrics.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
              <p className="text-xs text-muted" style={{ marginTop: '4px' }}>Cumulative replenishment valuation</p>
            </div>
            <div style={{ backgroundColor: '#ede9fe', padding: '12px', borderRadius: '50%', color: '#7c3aed' }}>
              <DollarSign size={24} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <CardHeader className="flex-between flex-wrap gap-4" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          {/* Tabs */}
          <div className="flex-center gap-2 flex-wrap">
            {['All', 'Pending Approval', 'Email Sent', 'Received', 'Cancelled'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === tab ? '#4f6ef2' : '#f8fafc',
                  color: activeTab === tab ? '#ffffff' : '#64748b'
                }}
              >
                {tab}
                {tab === 'Pending Approval' && metrics.pendingCount > 0 && (
                  <span style={{ marginLeft: '6px', padding: '2px 6px', borderRadius: '10px', backgroundColor: '#f59e0b', color: '#fff', fontSize: '11px' }}>
                    {metrics.pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ width: '280px' }}>
            <SearchBar 
              placeholder="Search by ID, supplier, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
        </CardHeader>

        <CardBody style={{ padding: '0' }}>
          {filteredOrders.length === 0 ? (
            <div style={{ padding: '60px 20px' }}>
              <EmptyState 
                icon={RefreshCcw}
                title="No Purchase Orders Found"
                description={searchQuery ? "No restock orders match your search filter." : "When products run out of stock, automated restock orders will appear here awaiting your approval."}
                actionText="Generate Manual Restock"
                onAction={() => setIsManualModalOpen(true)}
              />
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Order ID &amp; Date</Th>
                  <Th>Supplier Info</Th>
                  <Th>Products &amp; Quantities</Th>
                  <Th>Total Amount</Th>
                  <Th>Status</Th>
                  <Th style={{ textAlign: 'right' }}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredOrders.map(order => {
                  const isPending = order.status === 'Pending Approval' || order.rawStatus === 'PENDING_APPROVAL';
                  const isSent = order.status === 'Email Sent' || order.rawStatus === 'APPROVED' || order.rawStatus === 'SENT';
                  const isReceived = order.status === 'Received' || order.rawStatus === 'RECEIVED';
                  const isApprovingThis = approvingOrderId === order.id;

                  return (
                    <Tr key={order.id}>
                      <Td>
                        <div style={{ fontWeight: '700', color: '#1e293b' }}>
                          #{order.orderNumber || order.id}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {order.date || new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </Td>

                      <Td>
                        <div style={{ fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={14} style={{ color: '#4f6ef2' }} />
                          {order.supplierName || (order.supplier ? order.supplier.name : 'Supplier')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <Mail size={12} />
                          {order.email || (order.supplier ? order.supplier.email : 'No email')}
                        </div>
                      </Td>

                      <Td>
                        <div style={{ fontWeight: '600', color: '#334155' }}>
                          {order.itemsCount || (order.products ? order.products.length : 1)} Items
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {(order.products || []).map(p => `${p.title} (x${p.orderQty || p.quantity})`).join(', ') || 'Restock items'}
                        </div>
                      </Td>

                      <Td>
                        <div style={{ fontWeight: '700', color: '#16a34a', fontSize: '15px' }}>
                          ₹{Number(order.totalAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                      </Td>

                      <Td>
                        {renderStatusBadge(order.status, order.rawStatus)}
                      </Td>

                      <Td style={{ textAlign: 'right' }}>
                        <div className="flex-center gap-2" style={{ justifyContent: 'flex-end' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Eye size={14} />}
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            Details
                          </Button>

                          {isPending && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                loading={isApprovingThis}
                                icon={<Send size={14} />}
                                onClick={() => handleApprove(order)}
                              >
                                Approve &amp; Email
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                style={{ color: '#ef4444', borderColor: '#fecaca' }}
                                onClick={() => handleCancelOrder(order)}
                              >
                                <Ban size={14} />
                              </Button>
                            </>
                          )}

                          {isSent && (
                            <Button
                              variant="success"
                              size="sm"
                              icon={<PackageCheck size={14} />}
                              onClick={() => handleOpenReceive(order)}
                            >
                              Mark Received
                            </Button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* 1. Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Purchase Order #${selectedOrder.orderNumber || selectedOrder.id}`}
          size="lg"
          footer={
            <div className="flex-between w-full" style={{ width: '100%' }}>
              <div>
                {(selectedOrder.status === 'Pending Approval' || selectedOrder.rawStatus === 'PENDING_APPROVAL') && (
                  <Button
                    variant="primary"
                    icon={<Send size={16} />}
                    loading={approvingOrderId === selectedOrder.id}
                    onClick={() => handleApprove(selectedOrder)}
                  >
                    Approve &amp; Send Email to Supplier
                  </Button>
                )}
                {(selectedOrder.status === 'Email Sent' || selectedOrder.rawStatus === 'APPROVED' || selectedOrder.rawStatus === 'SENT') && (
                  <Button
                    variant="success"
                    icon={<PackageCheck size={16} />}
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenReceive(selectedOrder);
                    }}
                  >
                    Mark Stock Received
                  </Button>
                )}
              </div>
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          }
        >
          <div style={{ padding: '4px 0' }}>
            {/* Header info bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div>
                <p className="text-xs text-muted text-uppercase font-semibold">Status</p>
                <div style={{ marginTop: '4px' }}>
                  {renderStatusBadge(selectedOrder.status, selectedOrder.rawStatus)}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted text-uppercase font-semibold">Created Date</p>
                <p className="font-semibold" style={{ color: '#0f172a', marginTop: '4px' }}>
                  {selectedOrder.date || new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="text-xs text-muted text-uppercase font-semibold">Total Cost</p>
                <p style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', marginTop: '2px' }}>
                  ₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Supplier details block */}
            <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={16} style={{ color: '#4f6ef2' }} />
                Supplier Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#475569' }}>
                <div><strong>Company:</strong> {selectedOrder.supplierName || (selectedOrder.supplier?.name)}</div>
                <div><strong>Email:</strong> {selectedOrder.email || (selectedOrder.supplier?.email || 'N/A')}</div>
                <div><strong>Phone:</strong> {selectedOrder.supplierPhone || (selectedOrder.supplier?.phone || 'N/A')}</div>
                <div><strong>Address:</strong> {selectedOrder.supplierAddress || (selectedOrder.supplier?.address || 'N/A')}</div>
              </div>
            </div>

            {/* Line items table */}
            <h4 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '14px' }}>Line Items Requested</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', textTransform: 'uppercase', fontSize: '11px', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Item Title</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>SKU</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Order Qty</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(selectedOrder.products || []).map((p, idx) => {
                  const qty = p.orderQty || p.quantity || 1;
                  const price = Number(p.unitPurchasePrice || p.purchasePrice || 0);
                  const sub = Number(p.subtotal || price * qty);

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', fontWeight: '600', color: '#0f172a' }}>{p.title || p.name}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b' }}>{p.sku}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 'bold' }}>{qty}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>₹{price.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>₹{sub.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* 2. Mark as Received Confirmation Modal */}
      {receivingOrder && (
        <Modal
          isOpen={isReceiveModalOpen}
          onClose={() => setIsReceiveModalOpen(false)}
          title={`Confirm Inventory Receipt #${receivingOrder.orderNumber || receivingOrder.id}`}
          size="md"
          footer={
            <div className="flex-between w-full" style={{ width: '100%' }}>
              <Button variant="secondary" onClick={() => setIsReceiveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="success"
                icon={<PackageCheck size={16} />}
                loading={isSubmittingReceive}
                onClick={handleConfirmReceive}
              >
                Confirm Receipt &amp; Update Stock
              </Button>
            </div>
          }
        >
          <div style={{ padding: '8px 0', textAlign: 'left' }}>
            <p style={{ color: '#334155', fontSize: '14px', marginBottom: '16px' }}>
              Are you sure supplier <strong>{receivingOrder.supplierName || (receivingOrder.supplier?.name)}</strong> has delivered the following items?
            </p>

            <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '16px' }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#15803d', fontSize: '13px', fontWeight: 'bold' }}>Items to be added to Inventory Stock:</h5>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#166534' }}>
                {(receivingOrder.products || []).map((p, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    <strong>{p.title || p.name}</strong> ({p.sku}) — <strong>+{p.orderQty || p.quantity} units</strong>
                  </li>
                ))}
              </ul>
            </div>

            <p style={{ color: '#64748b', fontSize: '12px' }}>
              * Standard inventory transactions will be logged and store stock counts refreshed automatically.
            </p>
          </div>
        </Modal>
      )}

      {/* 3. Manual Purchase Order Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Issue Manual Purchase Restock Request"
        size="md"
        footer={
          <div className="flex-between w-full" style={{ width: '100%' }}>
            <Button variant="secondary" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<Send size={16} />}
              loading={isSubmittingManual}
              onClick={handleCreateManualOrder}
            >
              Generate Order Request
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateManualOrder} style={{ padding: '4px 0' }}>
          {manualError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
              {manualError}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Select Product to Restock *
            </label>
            <select
              value={manualProdId}
              onChange={(e) => setManualProdId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                color: '#0f172a'
              }}
            >
              <option value="">-- Choose a product --</option>
              {products.map(p => (
                <option key={p.id || p.sku} value={p.id || p.sku}>
                  {p.title} (SKU: {p.sku}) — Current Stock: {p.currentStock} units
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Order Quantity *
            </label>
            <Input
              type="number"
              min="1"
              placeholder="e.g. 50"
              value={manualQty}
              onChange={(e) => setManualQty(e.target.value)}
            />
          </div>

          <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '12px', color: '#64748b' }}>
            💡 Generating a purchase order will queue it in <strong>Pending Approval</strong> status. You can review and approve it anytime to dispatch an email to the product's assigned supplier.
          </div>
        </form>
      </Modal>
    </div>
  );
};

function mapStatusLabel(raw) {
  switch (raw) {
    case 'PENDING_APPROVAL':
      return 'Pending Approval';
    case 'APPROVED':
    case 'SENT':
      return 'Email Sent';
    case 'RECEIVED':
      return 'Received';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return raw || 'Pending Approval';
  }
}

export default RestockOrders;
