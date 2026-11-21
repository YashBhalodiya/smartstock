import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip,
  Legend
} from 'recharts';
import { 
  Download, 
  Printer, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Receipt, 
  Package, 
  Calendar, 
  BarChart3, 
  FileText, 
  RefreshCcw, 
  Layers, 
  Search,
  Percent,
  CheckCircle2,
  Clock,
  Truck
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import Tabs from '../../components/ui/Tabs';
import SearchBar from '../../components/ui/SearchBar';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';

const PIE_COLORS = [
  '#4f46e5', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Rose
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#64748b'  // Slate
];

const Reports = () => {
  const { addToast } = useToast();
  const { products = [], sales = [], restockOrders = [], suppliers = [], categories = [] } = useStore();

  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [ledgerSearch, setLedgerSearch] = useState('');

  // 1. Filter Sales within selected date range
  const filteredSales = useMemo(() => {
    if (dateRange === 'all') return sales;

    const days = dateRange === '7d' ? 7 : (dateRange === '30d' ? 30 : 90);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);

    return sales.filter(s => {
      const d = s.createdAt ? new Date(s.createdAt) : new Date(s.date);
      return d >= cutoff;
    });
  }, [sales, dateRange]);

  // 2. High-Level Executive Financial Metrics
  const metrics = useMemo(() => {
    let totalGrossRevenue = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let totalCOGS = 0; // Cost of goods sold
    let totalItemsSold = 0;

    // Build quick product map for purchase price / category lookup
    const prodMap = new Map();
    products.forEach(p => {
      prodMap.set(p.id, p);
      if (p.sku) prodMap.set(p.sku, p);
    });

    filteredSales.forEach(sale => {
      totalGrossRevenue += Number(sale.totalAmount || 0);
      totalTax += Number(sale.tax || 0);
      totalDiscount += Number(sale.discount || 0);

      (sale.items || []).forEach(item => {
        const qty = Number(item.quantity || 1);
        totalItemsSold += qty;

        const prod = prodMap.get(item.productId) || prodMap.get(item.sku);
        const purchasePrice = prod ? Number(prod.purchasePrice || 0) : 0;
        totalCOGS += (purchasePrice * qty);
      });
    });

    const totalOrders = filteredSales.length;
    const aov = totalOrders > 0 ? totalGrossRevenue / totalOrders : 0;
    const grossProfit = Math.max(0, totalGrossRevenue - totalCOGS);
    const profitMarginPct = totalGrossRevenue > 0 ? ((grossProfit / totalGrossRevenue) * 100).toFixed(1) : 0;

    // Total Inventory Valuation (Current active asset value)
    let inventoryCostValue = 0;
    let inventoryRetailValue = 0;
    let totalStockUnits = 0;

    products.forEach(p => {
      const stock = Number(p.currentStock || 0);
      totalStockUnits += stock;
      inventoryCostValue += stock * Number(p.purchasePrice || 0);
      inventoryRetailValue += stock * Number(p.sellingPrice || 0);
    });

    return {
      totalGrossRevenue,
      totalTax,
      totalDiscount,
      totalCOGS,
      totalItemsSold,
      totalOrders,
      aov,
      grossProfit,
      profitMarginPct,
      inventoryCostValue,
      inventoryRetailValue,
      totalStockUnits
    };
  }, [filteredSales, products]);

  // 3. Daily Sales & Profit Timeline for Charts
  const timelineChartData = useMemo(() => {
    const numDays = dateRange === '7d' ? 7 : (dateRange === '90d' ? 90 : 30);
    const dataMap = new Map();
    const now = new Date();

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = d.toDateString();
      const label = numDays === 7 
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      dataMap.set(dateKey, {
        dateKey,
        label,
        revenue: 0,
        profit: 0,
        orders: 0
      });
    }

    const prodMap = new Map();
    products.forEach(p => {
      prodMap.set(p.id, p);
      if (p.sku) prodMap.set(p.sku, p);
    });

    filteredSales.forEach(sale => {
      const saleDate = sale.createdAt ? new Date(sale.createdAt) : new Date(sale.date);
      const key = saleDate.toDateString();
      
      let dayRecord = dataMap.get(key);
      if (!dayRecord && dateRange === 'all') {
        const label = saleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dayRecord = { dateKey: key, label, revenue: 0, profit: 0, orders: 0 };
        dataMap.set(key, dayRecord);
      }

      if (dayRecord) {
        const rev = Number(sale.totalAmount || 0);
        let saleCOGS = 0;
        (sale.items || []).forEach(item => {
          const prod = prodMap.get(item.productId) || prodMap.get(item.sku);
          saleCOGS += (prod ? Number(prod.purchasePrice || 0) : 0) * Number(item.quantity || 1);
        });

        dayRecord.revenue += rev;
        dayRecord.profit += Math.max(0, rev - saleCOGS);
        dayRecord.orders += 1;
      }
    });

    return Array.from(dataMap.values());
  }, [filteredSales, dateRange, products]);

  // 4. Product Performance Leaderboard
  const productPerformance = useMemo(() => {
    const stats = new Map();

    // Initialize all products so 0-sales items also appear in audit
    products.forEach(p => {
      stats.set(p.id, {
        id: p.id,
        sku: p.sku || 'N/A',
        title: p.title || p.name,
        category: p.category || 'General',
        currentStock: Number(p.currentStock || 0),
        sellingPrice: Number(p.sellingPrice || 0),
        purchasePrice: Number(p.purchasePrice || 0),
        unitsSold: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        marginPct: 0
      });
    });

    filteredSales.forEach(sale => {
      (sale.items || []).forEach(item => {
        let entry = stats.get(item.productId);
        if (!entry) {
          const bySku = Array.from(stats.values()).find(s => s.sku === item.sku);
          if (bySku) entry = bySku;
        }

        const qty = Number(item.quantity || 1);
        const sub = Number(item.subtotal || (Number(item.unitPrice || 0) * qty));

        if (entry) {
          entry.unitsSold += qty;
          entry.totalRevenue += sub;
          entry.totalCost += entry.purchasePrice * qty;
        } else {
          // Fallback if product was deleted from catalog
          stats.set(item.productId || item.sku, {
            id: item.productId || item.sku,
            sku: item.sku || 'N/A',
            title: item.title || 'Unknown Product',
            category: 'Uncategorized',
            currentStock: 0,
            sellingPrice: Number(item.unitPrice || 0),
            purchasePrice: 0,
            unitsSold: qty,
            totalRevenue: sub,
            totalCost: 0,
            totalProfit: sub,
            marginPct: 100
          });
        }
      });
    });

    return Array.from(stats.values()).map(item => {
      const profit = Math.max(0, item.totalRevenue - item.totalCost);
      const margin = item.totalRevenue > 0 ? ((profit / item.totalRevenue) * 100).toFixed(1) : 0;
      return {
        ...item,
        totalProfit: profit,
        marginPct: margin
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [products, filteredSales]);

  // 5. Category Breakdown Data
  const categoryChartData = useMemo(() => {
    const catMap = new Map();
    let totalRev = 0;

    productPerformance.forEach(prod => {
      if (prod.totalRevenue > 0) {
        const cat = prod.category || 'General';
        const current = catMap.get(cat) || { name: cat, revenue: 0, units: 0 };
        current.revenue += prod.totalRevenue;
        current.units += prod.unitsSold;
        catMap.set(cat, current);
        totalRev += prod.totalRevenue;
      }
    });

    const list = Array.from(catMap.values()).map((c, idx) => ({
      ...c,
      sharePct: totalRev > 0 ? Math.round((c.revenue / totalRev) * 100) : 0,
      color: PIE_COLORS[idx % PIE_COLORS.length]
    }));

    return list.sort((a, b) => b.revenue - a.revenue);
  }, [productPerformance]);

  // 6. Payment Method Breakdown Data
  const paymentBreakdown = useMemo(() => {
    const pMap = { CASH: 0, UPI: 0, CARD: 0, OTHER: 0 };
    let total = 0;

    filteredSales.forEach(s => {
      const method = (s.paymentMethod || 'OTHER').toUpperCase();
      const amount = Number(s.totalAmount || 0);
      if (pMap[method] !== undefined) {
        pMap[method] += amount;
      } else {
        pMap.OTHER += amount;
      }
      total += amount;
    });

    return [
      { name: 'UPI', amount: pMap.UPI, pct: total > 0 ? Math.round((pMap.UPI / total) * 100) : 0, color: '#4f46e5' },
      { name: 'Cash', amount: pMap.CASH, pct: total > 0 ? Math.round((pMap.CASH / total) * 100) : 0, color: '#10b981' },
      { name: 'Card', amount: pMap.CARD, pct: total > 0 ? Math.round((pMap.CARD / total) * 100) : 0, color: '#06b6d4' }
    ].filter(item => item.amount > 0 || total === 0);
  }, [filteredSales]);

  // 7. Restock & Procurement Velocity Analytics
  const restockAnalytics = useMemo(() => {
    let totalOrders = restockOrders.length;
    let pendingApproval = 0;
    let emailSent = 0;
    let received = 0;
    let totalSpend = 0;

    restockOrders.forEach(o => {
      const status = (o.rawStatus || o.status || '').toUpperCase();
      totalSpend += Number(o.totalAmount || 0);

      if (status.includes('PENDING')) pendingApproval++;
      else if (status.includes('SENT') || status.includes('APPROVED')) emailSent++;
      else if (status.includes('RECEIVED')) received++;
    });

    return {
      totalOrders,
      pendingApproval,
      emailSent,
      received,
      totalSpend
    };
  }, [restockOrders]);

  // 8. Filtered Financial Audit Ledger
  const filteredLedger = useMemo(() => {
    if (!ledgerSearch.trim()) return filteredSales;
    const q = ledgerSearch.toLowerCase();
    return filteredSales.filter(s => 
      (s.invoiceNo || '').toLowerCase().includes(q) ||
      (s.paymentMethod || '').toLowerCase().includes(q) ||
      (s.date || '').toLowerCase().includes(q) ||
      (s.cashierName || '').toLowerCase().includes(q)
    );
  }, [filteredSales, ledgerSearch]);

  // CSV Export Generator
  const handleExportCSV = () => {
    if (filteredSales.length === 0) {
      addToast('No sales records to export for this period.', 'warning');
      return;
    }

    const headers = [
      'Invoice No',
      'Date',
      'Cashier',
      'Payment Method',
      'Items Count',
      'Subtotal (INR)',
      'GST Tax (INR)',
      'Discount (INR)',
      'Total Amount (INR)',
      'Products Summary'
    ];

    const rows = filteredSales.map(s => {
      const itemsSummary = (s.items || [])
        .map(i => `${i.title || i.sku} (x${i.quantity})`)
        .join('; ');

      return [
        `"${s.invoiceNo}"`,
        `"${s.date || s.createdAt}"`,
        `"${s.cashierName || 'Shopkeeper'}"`,
        `"${s.paymentMethod}"`,
        s.itemsCount || (s.items || []).length,
        Number(s.subtotal || 0).toFixed(2),
        Number(s.tax || 0).toFixed(2),
        Number(s.discount || 0).toFixed(2),
        Number(s.totalAmount || 0).toFixed(2),
        `"${itemsSummary.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockFlow_Sales_Ledger_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Sales and tax audit ledger downloaded successfully.', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-analytics-page skeleton-page" style={{ paddingBottom: '40px' }}>
      
      {/* Page Header */}
      <div className="page-header flex-between flex-wrap" style={{ gap: '16px', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--neutral-900)' }}>Reports &amp; Analytics</h1>
            <Badge variant="primary" style={{ padding: '3px 8px', fontSize: '11px', textTransform: 'uppercase' }}>
              Live Business Intelligence
            </Badge>
          </div>
          <p className="text-muted text-sm" style={{ marginTop: '4px' }}>
            Analyze store revenue, gross margins, product velocity, and inventory valuation in real time.
          </p>
        </div>

        {/* Date Range & Export Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <Tabs 
            tabs={[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: 'all', label: 'All Time' }
            ]}
            activeTab={dateRange}
            onChange={setDateRange}
            style={{ margin: 0 }}
          />

          <Button 
            variant="outline" 
            size="sm" 
            icon={<Download size={15} />}
            onClick={handleExportCSV}
          >
            Export Ledger CSV
          </Button>

          <Button 
            variant="secondary" 
            size="sm" 
            icon={<Printer size={15} />}
            onClick={handlePrint}
          >
            Print Report
          </Button>
        </div>
      </div>

      {/* EXECUTIVE KPI SUMMARY CARDS */}
      <div className="grid-cols-auto" style={{ marginTop: '24px', gap: '16px' }}>
        
        {/* Gross Revenue */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>GROSS REVENUE</span>
              <div className="kpi-icon-wrapper bg-primary-light text-primary flex-center" style={{ width: '36px', height: '36px', borderRadius: '8px' }}>
                <Receipt size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>
              ₹{metrics.totalGrossRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="text-xs text-muted">
              {metrics.totalOrders} checkouts • AOV: <strong>₹{metrics.aov.toFixed(2)}</strong>
            </div>
          </CardBody>
        </Card>

        {/* Gross Profit & Margin */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>ESTIMATED GROSS PROFIT</span>
              <div className="kpi-icon-wrapper bg-success-light text-success flex-center" style={{ width: '36px', height: '36px', borderRadius: '8px' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-success" style={{ margin: '8px 0 4px' }}>
              ₹{metrics.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="text-xs text-muted flex-center" style={{ justifyContent: 'flex-start', gap: '6px' }}>
              <Badge variant="success" style={{ fontSize: '10.5px', padding: '1px 6px' }}>
                {metrics.profitMarginPct}% Margin
              </Badge>
              <span>Net markup</span>
            </div>
          </CardBody>
        </Card>

        {/* GST Tax Ledger */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>GST TAX COLLECTED</span>
              <div className="kpi-icon-wrapper bg-warning-light text-warning flex-center" style={{ width: '36px', height: '36px', borderRadius: '8px' }}>
                <Percent size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>
              ₹{metrics.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="text-xs text-muted">
              18% GST portion for tax compliance
            </div>
          </CardBody>
        </Card>

        {/* Active Inventory Valuation */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>INVENTORY VALUATION</span>
              <div className="kpi-icon-wrapper flex-center" style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                <Package size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>
              ₹{metrics.inventoryCostValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="text-xs text-muted">
              Asset cost • Retail: <strong>₹{metrics.inventoryRetailValue.toLocaleString('en-IN')}</strong>
            </div>
          </CardBody>
        </Card>

      </div>

      {/* ANALYTICS MODULE TABS */}
      <div style={{ marginTop: '24px' }}>
        <Tabs 
          tabs={[
            { id: 'overview', label: 'Sales & Revenue Velocity' },
            { id: 'products', label: 'Product Performance & Margins' },
            { id: 'categories', label: 'Category Distribution' },
            { id: 'restock', label: 'Procurement & Restocks' },
            { id: 'ledger', label: 'Financial Audit Ledger' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: '20px' }}
        />

        {/* TAB 1: OVERVIEW & REVENUE VELOCITY */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '20px' }}>
              {/* Timeline Revenue & Profit Chart */}
              <Card>
                <CardHeader className="flex-between">
                  <div>
                    <CardTitle>Revenue &amp; Estimated Profit Trend</CardTitle>
                    <CardDescription>Daily turnover against product cost basis for the selected period.</CardDescription>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--primary)', borderRadius: '2px' }} />
                      <span>Revenue</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '2px' }} />
                      <span>Profit</span>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevReports" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorProfReports" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--neutral-200)" />
                        <XAxis dataKey="label" stroke="var(--neutral-400)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--neutral-400)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                        <ChartTooltip 
                          formatter={(v, name) => [`₹${Number(v).toLocaleString('en-IN')}`, name === 'revenue' ? 'Gross Revenue' : 'Est. Profit']}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', borderColor: '#e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevReports)" name="revenue" />
                        <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfReports)" name="profit" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              {/* Payment Methods Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Breakdown by checkout payment channel.</CardDescription>
                </CardHeader>
                <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {filteredSales.length > 0 ? (
                    <>
                      <div style={{ width: '100%', height: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={paymentBreakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={68}
                              paddingAngle={4}
                              dataKey="amount"
                            >
                              {paymentBreakdown.map((entry, idx) => (
                                <Cell key={`pm-${idx}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip 
                              formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Volume']}
                              contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {paymentBreakdown.map(pm => (
                          <div key={pm.name} className="flex-between text-sm" style={{ padding: '6px 0', borderBottom: '1px solid var(--neutral-100)' }}>
                            <div className="flex-center" style={{ gap: '8px' }}>
                              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: pm.color }} />
                              <span className="font-medium text-neutral-700">{pm.name}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span className="font-bold text-neutral-800">₹{pm.amount.toLocaleString('en-IN')}</span>
                              <span className="text-xs text-muted" style={{ marginLeft: '6px' }}>({pm.pct}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No transactions recorded in this period.
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Quick Insights Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <Card>
                <CardBody style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted text-uppercase">Total Items Dispatched</span>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--neutral-900)', marginTop: '2px' }}>
                      {metrics.totalItemsSold} units
                    </h3>
                    <p className="text-xs text-muted">Across {metrics.totalOrders} store transactions</p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#b45309' }}>
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted text-uppercase">Total Cost of Goods (COGS)</span>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--neutral-900)', marginTop: '2px' }}>
                      ₹{metrics.totalCOGS.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-muted">Supplier replenishment basis for sold stock</p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                    <Percent size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted text-uppercase">Overall Profit Margin</span>
                    <h3 className="text-xl font-bold text-success" style={{ marginTop: '2px' }}>
                      {metrics.profitMarginPct}%
                    </h3>
                    <p className="text-xs text-muted">Net mark-up ratio over inventory acquisition</p>
                  </div>
                </CardBody>
              </Card>
            </div>

          </div>
        )}

        {/* TAB 2: PRODUCT PERFORMANCE & MARGINS */}
        {activeTab === 'products' && (
          <Card>
            <CardHeader className="flex-between">
              <div>
                <CardTitle>Product Performance Leaderboard</CardTitle>
                <CardDescription>Sales volume, gross revenue, acquisition cost, and gross profit margins per product.</CardDescription>
              </div>
              <Badge variant="neutral">{productPerformance.length} Products Tracked</Badge>
            </CardHeader>
            <CardBody style={{ padding: 0 }}>
              <Table style={{ border: 'none', borderRadius: 0 }}>
                <Thead>
                  <Tr>
                    <Th style={{ width: '50px' }}>Rank</Th>
                    <Th>Product Details</Th>
                    <Th>Category</Th>
                    <Th align="center">Stock Left</Th>
                    <Th align="center">Units Sold</Th>
                    <Th align="right">Selling Price</Th>
                    <Th align="right">Revenue</Th>
                    <Th align="right">Gross Profit</Th>
                    <Th align="right">Margin</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {productPerformance.length > 0 ? (
                    productPerformance.map((prod, idx) => {
                      const isTopSeller = idx === 0 && prod.unitsSold > 0;
                      return (
                        <Tr key={prod.id || prod.sku}>
                          <Td>
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '24px', 
                                height: '24px', 
                                borderRadius: '50%', 
                                fontSize: '11px',
                                fontWeight: 'bold',
                                backgroundColor: isTopSeller ? '#fef3c7' : 'var(--neutral-100)',
                                color: isTopSeller ? '#b45309' : 'var(--neutral-600)'
                              }}
                            >
                              {idx + 1}
                            </span>
                          </Td>
                          <Td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span className="font-semibold text-neutral-800">{prod.title}</span>
                              <span className="text-xs text-muted" style={{ fontFamily: 'monospace' }}>SKU: {prod.sku}</span>
                            </div>
                          </Td>
                          <Td>
                            <Badge variant="neutral" style={{ fontSize: '11px' }}>{prod.category}</Badge>
                          </Td>
                          <Td align="center">
                            <span className={prod.currentStock <= 5 ? 'text-danger font-bold' : ''}>
                              {prod.currentStock}
                            </span>
                          </Td>
                          <Td align="center">
                            <span className="font-bold text-neutral-800">{prod.unitsSold}</span>
                          </Td>
                          <Td align="right">
                            ₹{prod.sellingPrice.toFixed(2)}
                          </Td>
                          <Td align="right">
                            <span className="font-bold text-neutral-800">
                              ₹{prod.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </Td>
                          <Td align="right">
                            <span className="text-success font-semibold">
                              ₹{prod.totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </Td>
                          <Td align="right">
                            <Badge variant={Number(prod.marginPct) >= 20 ? 'success' : (Number(prod.marginPct) > 0 ? 'warning' : 'neutral')}>
                              {prod.marginPct}%
                            </Badge>
                          </Td>
                        </Tr>
                      );
                    })
                  ) : (
                    <Tr>
                      <Td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--neutral-500)' }}>
                        No product catalog items found.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        )}

        {/* TAB 3: CATEGORY DISTRIBUTION */}
        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px' }}>
            {/* Category Donut Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Contribution by Category</CardTitle>
                <CardDescription>Relative percentage share of turnover across store categories.</CardDescription>
              </CardHeader>
              <CardBody style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {categoryChartData.length > 0 ? (
                  <>
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="revenue"
                          >
                            {categoryChartData.map((entry, idx) => (
                              <Cell key={`cat-${idx}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip 
                            formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                            contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                      {categoryChartData.map(c => (
                        <div key={c.name} className="flex-between text-sm" style={{ padding: '6px 0', borderBottom: '1px solid var(--neutral-100)' }}>
                          <div className="flex-center" style={{ gap: '8px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c.color }} />
                            <span className="font-medium text-neutral-800">{c.name}</span>
                          </div>
                          <div>
                            <span className="font-bold text-neutral-800">₹{c.revenue.toLocaleString('en-IN')}</span>
                            <span className="text-xs text-muted" style={{ marginLeft: '6px' }}>({c.sharePct}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '60px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No categorized sales recorded for this timeframe.
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Category Performance Breakdown Table */}
            <Card>
              <CardHeader>
                <CardTitle>Category Sales &amp; Velocity</CardTitle>
                <CardDescription>Product volume and total transaction totals per department.</CardDescription>
              </CardHeader>
              <CardBody style={{ padding: 0 }}>
                <Table style={{ border: 'none', borderRadius: 0 }}>
                  <Thead>
                    <Tr>
                      <Th>Category</Th>
                      <Th align="center">Items Sold</Th>
                      <Th align="right">Revenue Generated</Th>
                      <Th align="right">Share</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {categoryChartData.length > 0 ? (
                      categoryChartData.map(c => (
                        <Tr key={c.name}>
                          <Td>
                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color }} />
                              <span className="font-semibold text-neutral-800">{c.name}</span>
                            </div>
                          </Td>
                          <Td align="center">
                            <span className="font-bold text-neutral-800">{c.units} units</span>
                          </Td>
                          <Td align="right">
                            <span className="font-bold text-neutral-800">
                              ₹{c.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </Td>
                          <Td align="right">
                            <Badge variant="primary">{c.sharePct}%</Badge>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: 'var(--neutral-500)' }}>
                          No sales data available.
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </div>
        )}

        {/* TAB 4: PROCUREMENT & RESTOCKS */}
        {activeTab === 'restock' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Restock KPI Ribbon */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <Card>
                <CardBody>
                  <div className="flex-between">
                    <span className="text-xs font-semibold text-muted text-uppercase">Total Restock Orders</span>
                    <RefreshCcw size={16} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ marginTop: '8px', color: 'var(--neutral-900)' }}>
                    {restockAnalytics.totalOrders}
                  </h3>
                  <span className="text-xs text-muted">Purchase orders generated</span>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex-between">
                    <span className="text-xs font-semibold text-muted text-uppercase">Restock Expenditure</span>
                    <DollarSign size={16} className="text-danger" />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ marginTop: '8px', color: 'var(--neutral-900)' }}>
                    ₹{restockAnalytics.totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                  <span className="text-xs text-muted">Total inventory procurement value</span>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex-between">
                    <span className="text-xs font-semibold text-muted text-uppercase">Pending Approval</span>
                    <Clock size={16} className="text-warning" />
                  </div>
                  <h3 className="text-2xl font-bold text-warning" style={{ marginTop: '8px' }}>
                    {restockAnalytics.pendingApproval}
                  </h3>
                  <span className="text-xs text-muted">Awaiting shopkeeper review</span>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex-between">
                    <span className="text-xs font-semibold text-muted text-uppercase">Fulfilled / Received</span>
                    <CheckCircle2 size={16} className="text-success" />
                  </div>
                  <h3 className="text-2xl font-bold text-success" style={{ marginTop: '8px' }}>
                    {restockAnalytics.received}
                  </h3>
                  <span className="text-xs text-muted">Restocked to store inventory</span>
                </CardBody>
              </Card>
            </div>

            {/* Restock Orders Table */}
            <Card>
              <CardHeader className="flex-between">
                <div>
                  <CardTitle>Recent Restock Orders Summary</CardTitle>
                  <CardDescription>Supplier procurement requests and fulfillment statuses.</CardDescription>
                </div>
                <Badge variant="primary">{restockOrders.length} Total Orders</Badge>
              </CardHeader>
              <CardBody style={{ padding: 0 }}>
                <Table style={{ border: 'none', borderRadius: 0 }}>
                  <Thead>
                    <Tr>
                      <Th>Order Number</Th>
                      <Th>Supplier</Th>
                      <Th>Date</Th>
                      <Th align="center">Items</Th>
                      <Th align="right">Total Value</Th>
                      <Th align="center">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {restockOrders.length > 0 ? (
                      restockOrders.map(order => {
                        let statusVariant = 'neutral';
                        if (order.status === 'Received') statusVariant = 'success';
                        else if (order.status === 'Email Sent') statusVariant = 'info';
                        else if (order.status === 'Pending Approval') statusVariant = 'warning';

                        return (
                          <Tr key={order.id || order.orderNumber}>
                            <Td>
                              <span className="font-bold text-primary">{order.orderNumber || order.id}</span>
                            </Td>
                            <Td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="font-medium text-neutral-800">{order.supplierName || 'Partner'}</span>
                                <span className="text-xs text-muted">{order.email}</span>
                              </div>
                            </Td>
                            <Td className="text-muted" style={{ fontSize: '12px' }}>
                              {order.date || new Date(order.createdAt).toLocaleDateString()}
                            </Td>
                            <Td align="center">
                              {order.itemsCount || (order.products || []).length} products
                            </Td>
                            <Td align="right">
                              <span className="font-bold text-neutral-800">
                                ₹{Number(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </Td>
                            <Td align="center">
                              <Badge variant={statusVariant}>{order.status}</Badge>
                            </Td>
                          </Tr>
                        );
                      })
                    ) : (
                      <Tr>
                        <Td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--neutral-500)' }}>
                          No restock purchase orders found.
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>

          </div>
        )}

        {/* TAB 5: FINANCIAL AUDIT & GST LEDGER */}
        {activeTab === 'ledger' && (
          <Card>
            <CardHeader className="flex-between flex-wrap" style={{ gap: '16px' }}>
              <div>
                <CardTitle>Sales &amp; Tax Audit Ledger</CardTitle>
                <CardDescription>Comprehensive fiscal breakdown of sales transactions, GST portion, and discounts.</CardDescription>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SearchBar 
                  value={ledgerSearch}
                  onChange={setLedgerSearch}
                  placeholder="Search invoice, cashier, or method..."
                  style={{ width: '260px' }}
                />
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={<Download size={14} />}
                  onClick={handleExportCSV}
                >
                  Download CSV
                </Button>
              </div>
            </CardHeader>

            <CardBody style={{ padding: 0 }}>
              <Table style={{ border: 'none', borderRadius: 0 }}>
                <Thead>
                  <Tr>
                    <Th>Invoice No</Th>
                    <Th>Date &amp; Time</Th>
                    <Th>Cashier</Th>
                    <Th>Method</Th>
                    <Th align="center">Items</Th>
                    <Th align="right">Subtotal</Th>
                    <Th align="right">GST (18% Incl.)</Th>
                    <Th align="right">Discount</Th>
                    <Th align="right">Net Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredLedger.length > 0 ? (
                    filteredLedger.map(sale => (
                      <Tr key={sale.id || sale.invoiceNo}>
                        <Td>
                          <span className="font-bold text-primary">{sale.invoiceNo}</span>
                        </Td>
                        <Td className="text-muted" style={{ fontSize: '12.5px' }}>
                          {sale.date}
                        </Td>
                        <Td>
                          <span className="font-medium text-neutral-700">{sale.cashierName || 'Shopkeeper'}</span>
                        </Td>
                        <Td>
                          <Badge variant="neutral" style={{ fontSize: '11px' }}>{sale.paymentMethod}</Badge>
                        </Td>
                        <Td align="center">
                          {sale.itemsCount || (sale.items || []).length}
                        </Td>
                        <Td align="right">
                          ₹{Number(sale.subtotal || 0).toFixed(2)}
                        </Td>
                        <Td align="right" className="text-muted">
                          ₹{Number(sale.tax || 0).toFixed(2)}
                        </Td>
                        <Td align="right" className={Number(sale.discount || 0) > 0 ? 'text-danger font-medium' : 'text-muted'}>
                          {Number(sale.discount || 0) > 0 ? `-₹${Number(sale.discount).toFixed(2)}` : '₹0.00'}
                        </Td>
                        <Td align="right">
                          <span className="font-bold text-neutral-900">
                            ₹{Number(sale.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--neutral-500)' }}>
                        {ledgerSearch ? 'No invoices matched your search filter.' : 'No sales ledger entries recorded in this period.'}
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        )}

      </div>
    </div>
  );
};

export default Reports;
