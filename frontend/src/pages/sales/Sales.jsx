import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  TrendingUp, 
  Receipt, 
  ShoppingBag, 
  Eye, 
  Printer,
  Calendar,
  User,
  CreditCard
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import SearchBar from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/States';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

const Sales = () => {
  const { addToast } = useToast();
  const { sales } = useStore();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Invoice Modal State
  const [selectedSale, setSelectedSale] = useState(null);

  // Derived KPI Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    const totalInvoices = sales.length;

    sales.forEach(sale => {
      const isCompleted = (sale.status || '').toUpperCase() === 'COMPLETED';
      if (isCompleted) {
        totalRevenue += Number(sale.totalAmount || 0);
      }
    });

    const averageOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    return {
      totalRevenue,
      totalInvoices,
      averageOrderValue
    };
  }, [sales]);

  // Filtering Logic
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const invoiceNo = sale.invoiceNo || '';
      const cashierName = sale.cashierName || '';
      const matchesSearch = 
        invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cashierName.toLowerCase().includes(searchQuery.toLowerCase());

      const paymentMethod = sale.paymentMethod || '';
      const matchesPayment = 
        paymentMethodFilter === 'All' || 
        paymentMethod.toUpperCase() === paymentMethodFilter.toUpperCase();

      return matchesSearch && matchesPayment;
    });
  }, [sales, searchQuery, paymentMethodFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredSales, currentPage]);

  const handlePrintInvoice = (invoiceNo) => {
    addToast(`Simulating Print Invoice for ${invoiceNo}...`, 'success');
  };

  return (
    <div className="sales-history-page">
      <div className="page-header flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold">Sales History</h1>
          <p className="text-muted text-sm">Review, track, and inspect all store transaction invoices and checkout records</p>
        </div>
        <Badge variant="success" style={{ padding: '6px 12px', fontSize: '13px' }}>Database Sync Operational</Badge>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid-cols-auto" style={{ gap: '20px', marginBottom: '24px' }}>
        {/* Total Sales Revenue */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>TOTAL REVENUE</span>
              <div className="kpi-icon-wrapper bg-success-light text-success flex-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>
              ₹{metrics.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="text-xs text-muted">Accumulated billing volume</div>
          </CardBody>
        </Card>

        {/* Total Invoices */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>TOTAL INVOICES</span>
              <div className="kpi-icon-wrapper bg-primary-light text-primary flex-center">
                <Receipt size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>
              {metrics.totalInvoices}
            </h2>
            <div className="text-xs text-muted">Completed transaction tickets</div>
          </CardBody>
        </Card>

        {/* Average Order Value */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>AVERAGE TICKET SIZE</span>
              <div className="kpi-icon-wrapper bg-warning-light text-warning flex-center">
                <ShoppingBag size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>
              ₹{metrics.averageOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="text-xs text-muted">Average spend per checkout</div>
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
                placeholder="Search by invoice number or cashier name..."
                style={{ maxWidth: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              {/* Payment Method Filter */}
              <div style={{ minWidth: '180px' }}>
                <Select
                  value={paymentMethodFilter}
                  onChange={(e) => { setPaymentMethodFilter(e.target.value); setCurrentPage(1); }}
                  options={[
                    { value: 'All', label: 'All Payment Methods' },
                    { value: 'UPI', label: 'UPI payments' },
                    { value: 'CASH', label: 'Cash purchases' },
                    { value: 'CARD', label: 'Credit/Debit card' }
                  ]}
                  containerClass="margin-zero-form"
                  style={{ height: '40px', padding: '6px 14px' }}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* SALES TRANSACTIONS TABLE */}
      {filteredSales.length === 0 ? (
        <EmptyState
          title="No transaction records found"
          description="Try modifying search keywords or clearing filter choices."
        />
      ) : (
        <>
          <Card>
            <CardBody style={{ padding: 0 }}>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Invoice No</Th>
                    <Th>Date &amp; Time</Th>
                    <Th>Cashier</Th>
                    <Th>Items Count</Th>
                    <Th>Payment Method</Th>
                    <Th>Total Amount</Th>
                    <Th>Status</Th>
                    <Th align="right">Invoice Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedSales.map(sale => {
                    let badgeVar = 'neutral';
                    const payMethod = (sale.paymentMethod || '').toUpperCase();
                    if (payMethod === 'UPI') badgeVar = 'success';
                    else if (payMethod === 'CARD') badgeVar = 'primary';
                    else if (payMethod === 'CASH') badgeVar = 'warning';

                    const isCompleted = (sale.status || '').toUpperCase() === 'COMPLETED';

                    return (
                      <Tr key={sale.id || sale.invoiceNo}>
                        <Td>
                          <span className="font-semibold text-neutral-800 flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                            <Receipt size={14} className="text-muted" />
                            {sale.invoiceNo}
                          </span>
                        </Td>
                        <Td><span className="text-sm text-neutral-700">{sale.date}</span></Td>
                        <Td>
                          <span className="text-sm text-neutral-800 flex-center" style={{ justifyContent: 'flex-start', gap: '6px' }}>
                            <User size={13} className="text-muted" />
                            {sale.cashierName || 'System'}
                          </span>
                        </Td>
                        <Td><span className="font-medium text-neutral-800">{sale.itemsCount} units</span></Td>
                        <Td>
                          <Badge variant={badgeVar} style={{ fontSize: '10px' }}>
                            {payMethod}
                          </Badge>
                        </Td>
                        <Td>
                          <span className="font-bold text-neutral-900">
                            ₹{Number(sale.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </Td>
                        <Td>
                          <Badge variant={isCompleted ? 'success' : 'danger'} style={{ fontSize: '10px' }}>
                            {sale.status || 'Completed'}
                          </Badge>
                        </Td>
                        <Td align="right">
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              icon={<Eye size={13} />}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => setSelectedSale(sale)}
                            >
                              Details
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              icon={<Printer size={13} />}
                              style={{ padding: '6px' }}
                              onClick={() => handlePrintInvoice(sale.invoiceNo)}
                              title="Print Receipt"
                            />
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

      {/* DETAILED RECEIPT / INVOICE MODAL */}
      {selectedSale && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSale(null)}
          title={`Invoice Receipt: ${selectedSale.invoiceNo}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedSale(null)}>Close</Button>
              <Button 
                variant="primary" 
                icon={<Printer size={16} />}
                onClick={() => { handlePrintInvoice(selectedSale.invoiceNo); setSelectedSale(null); }}
              >
                Print Receipt
              </Button>
            </>
          }
        >
          <div className="pos-receipt-summary" style={{ width: '100%', padding: '4px 0', textAlign: 'left' }}>
            {/* Header info */}
            <div style={{ borderBottom: '1px dashed var(--neutral-300)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div className="flex-between text-sm" style={{ marginBottom: '8px' }}>
                <span className="text-muted flex-center" style={{ gap: '6px' }}><Receipt size={14} /> Invoice Reference</span>
                <span className="font-bold text-neutral-800">{selectedSale.invoiceNo}</span>
              </div>
              <div className="flex-between text-sm" style={{ marginBottom: '8px' }}>
                <span className="text-muted flex-center" style={{ gap: '6px' }}><Calendar size={14} /> Date &amp; Time</span>
                <span className="font-semibold text-neutral-800">{selectedSale.date}</span>
              </div>
              <div className="flex-between text-sm" style={{ marginBottom: '8px' }}>
                <span className="text-muted flex-center" style={{ gap: '6px' }}><User size={14} /> Cashier Desk</span>
                <span className="font-medium text-neutral-800">{selectedSale.cashierName || 'System'}</span>
              </div>
              <div className="flex-between text-sm">
                <span className="text-muted flex-center" style={{ gap: '6px' }}><CreditCard size={14} /> Payment Channel</span>
                <span className="font-bold text-primary">{selectedSale.paymentMethod}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ marginBottom: '16px' }}>
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>LINE ITEMS</span>
              <div style={{ border: '1px solid var(--neutral-200)', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-200)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--neutral-600)' }}>Product</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '600', color: 'var(--neutral-600)', width: '60px' }}>Qty</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--neutral-600)', width: '90px' }}>Price</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--neutral-600)', width: '100px' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items && selectedSale.items.map((item, idx) => (
                      <tr key={item.id || idx} style={{ borderBottom: idx < selectedSale.items.length - 1 ? '1px solid var(--neutral-200)' : 'none' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="font-semibold text-neutral-800">{item.title}</span>
                            <span className="text-xs text-muted" style={{ fontFamily: 'monospace' }}>SKU: {item.sku}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--neutral-700)' }}>{item.quantity}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--neutral-700)' }}>₹{(item.unitPrice || item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--neutral-800)' }}>₹{(item.subtotal || ((item.unitPrice || item.price || 0) * item.quantity)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div style={{ borderTop: '1px dashed var(--neutral-300)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div className="flex-between text-muted">
                <span>Subtotal</span>
                <span>₹{Number(selectedSale.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex-between text-muted">
                <span>GST Tax (5%)</span>
                <span>₹{Number(selectedSale.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {Number(selectedSale.discount || 0) > 0 && (
                <div className="flex-between text-danger font-medium">
                  <span>Store Discount</span>
                  <span>-₹{Number(selectedSale.discount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <hr style={{ border: 'none', borderTop: '1px solid var(--neutral-200)', margin: '4px 0' }} />
              <div className="flex-between font-bold" style={{ fontSize: '16px', color: 'var(--neutral-800)' }}>
                <span>Grand Total</span>
                <span className="text-success" style={{ fontSize: '18px' }}>₹{Number(selectedSale.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Sales;
