import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Receipt, 
  Package, 
  Boxes, 
  RefreshCcw, 
  Truck, 
  AlertTriangle, 
  TrendingUp, 
  ChevronRight,
  Eye
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import Tabs from '../../components/ui/Tabs';
import Tooltip from '../../components/ui/Tooltip';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';

// Import central mock data
import { 
  CHART_DATA_7D, 
  CHART_DATA_30D, 
  CHART_DATA_90D, 
  CATEGORY_SHARE_DATA 
} from '../../constants/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { products, sales, restockOrders } = useStore();
  const [chartRange, setChartRange] = useState('7d');

  // Chart data range selector
  const getChartData = () => {
    switch (chartRange) {
      case '30d': return CHART_DATA_30D;
      case '90d': return CHART_DATA_90D;
      case '7d':
      default:
        return CHART_DATA_7D;
    }
  };

  // Derived dashboard metrics from mock database
  const totalProducts = products.length;
  
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStock);
  const lowStockCount = lowStockProducts.length;
  const criticalStockCount = products.filter(p => p.currentStock <= 5 && p.currentStock > 0).length;
  const outOfStockCount = products.filter(p => p.currentStock === 0).length;
  
  const pendingRestocksCount = restockOrders.filter(o => o.status === 'Pending Approval').length;

  const handleQuickAction = (action, route) => {
    addToast(`Navigating to ${action}...`, 'info', 1500);
    navigate(route);
  };

  return (
    <div className="dashboard-page">
      {/* Top Greeting & Date Headers */}
      <div className="dashboard-greet-section flex-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--neutral-900)' }}>Good morning, Shopkeeper</h1>
          <p className="text-muted text-sm" style={{ marginTop: '2px' }}>Here's what's happening with your store today.</p>
        </div>
        <div className="dashboard-date-badge flex-center">
          <Badge variant="primary" style={{ textTransform: 'none', padding: '6px 12px', fontSize: '13px' }}>
            Wednesday, Aug 12, 2026
          </Badge>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="quick-actions-strip card" style={{ marginTop: '24px', padding: '16px 20px', backgroundColor: '#ffffff' }}>
        <div className="flex-between flex-wrap" style={{ gap: '16px' }}>
          <h4 className="font-semibold text-neutral-800" style={{ fontSize: '14px' }}>Quick Operations</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <Button 
              variant="primary" 
              icon={<Plus size={16} />} 
              onClick={() => handleQuickAction('New Sale (POS Terminal)', '/sales/new')}
            >
              New Sale
            </Button>
            <Button 
              variant="outline" 
              icon={<Plus size={16} />} 
              onClick={() => handleQuickAction('Add Product Catalog', '/products')}
            >
              Add Product
            </Button>
            <Button 
              variant="outline" 
              icon={<Boxes size={16} />} 
              onClick={() => handleQuickAction('Inventory stock tracker', '/inventory')}
            >
              View Inventory
            </Button>
            <Button 
              variant="outline" 
              icon={<RefreshCcw size={16} />} 
              onClick={() => handleQuickAction('Restock Orders Queue', '/restock-orders')}
            >
              Review Restock
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Indicators Grid */}
      <div className="grid-cols-auto" style={{ marginTop: '24px', gap: '20px' }}>
        {/* Revenue */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>TODAY'S REVENUE</span>
              <div className="kpi-icon-wrapper bg-primary-light text-primary flex-center">
                <Receipt size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>₹12,450</h2>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '6px', fontSize: '12px' }}>
              <span className="text-success font-semibold flex-center" style={{ gap: '2px' }}>
                <ArrowUpRight size={14} /> +12.5%
              </span>
              <span className="text-muted">from yesterday</span>
            </div>
          </CardBody>
        </Card>

        {/* Sales count */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>TODAY'S SALES</span>
              <div className="kpi-icon-wrapper bg-success-light text-success flex-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>87</h2>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '6px', fontSize: '12px' }}>
              <span className="text-success font-semibold flex-center" style={{ gap: '2px' }}>
                <ArrowUpRight size={14} /> +8.2%
              </span>
              <span className="text-muted">since yesterday</span>
            </div>
          </CardBody>
        </Card>

        {/* Total Products */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>TOTAL PRODUCTS</span>
              <div className="kpi-icon-wrapper bg-warning-light text-warning flex-center">
                <Package size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>{totalProducts}</h2>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '6px' }}>
              <Tooltip content={`${criticalStockCount} Critical, ${outOfStockCount} Out of stock`}>
                <Badge variant={lowStockCount > 0 ? 'warning' : 'success'} style={{ fontSize: '11px', padding: '2px 6px' }}>
                  {lowStockCount} Low stock items
                </Badge>
              </Tooltip>
            </div>
          </CardBody>
        </Card>

        {/* Pending Restocks */}
        <Card className="dashboard-kpi-card">
          <CardBody>
            <div className="flex-between">
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>PENDING RESTOCK</span>
              <div className="kpi-icon-wrapper bg-danger-light text-danger flex-center">
                <RefreshCcw size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-bold" style={{ margin: '8px 0 4px', color: 'var(--neutral-900)' }}>{restockOrders.filter(o => o.status !== 'Received').length}</h2>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '6px' }}>
              <Badge variant={pendingRestocksCount > 0 ? 'danger' : 'neutral'} style={{ fontSize: '11px', padding: '2px 6px' }}>
                {pendingRestocksCount} Pending approval
              </Badge>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="dashboard-charts-container" style={{ marginTop: '24px' }}>
        
        {/* Line / Area sales graph */}
        <Card className="dashboard-chart-card-main">
          <CardHeader className="flex-between flex-wrap" style={{ flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
            <div>
              <CardTitle>Sales Revenue Overview</CardTitle>
              <CardDescription>Visual trend of shop transactions and revenue income.</CardDescription>
            </div>
            <div style={{ minWidth: '180px' }}>
              <Tabs 
                tabs={[
                  { id: '7d', label: '7D' },
                  { id: '30d', label: '30D' },
                  { id: '90d', label: '90D' }
                ]} 
                activeTab={chartRange} 
                onChange={setChartRange}
                style={{ margin: 0, border: 'none' }}
              />
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--neutral-200)" />
                  <XAxis dataKey="name" stroke="var(--neutral-400)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--neutral-400)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                  <ChartTooltip 
                    formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: 'var(--border-radius-sm)', 
                      borderColor: 'var(--neutral-200)',
                      fontSize: '12px',
                      boxShadow: 'var(--shadow-md)'
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Category Share Donut Chart */}
        <Card className="dashboard-chart-card-secondary">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Product type distribution shares.</CardDescription>
          </CardHeader>
          <CardBody className="flex-center" style={{ flexDirection: 'column', gap: '20px' }}>
            <div style={{ width: '100%', height: 160, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_SHARE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {CATEGORY_SHARE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    formatter={(v) => [`${v}%`, 'Share']}
                    contentStyle={{ fontSize: '11px', borderRadius: '4px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Category Legend list */}
            <div className="donut-legend-list" style={{ width: '100%' }}>
              {CATEGORY_SHARE_DATA.map((item, index) => (
                <div key={item.name} className="legend-item flex-between" style={{ padding: '6px 0', fontSize: '12.5px', borderBottom: index < CATEGORY_SHARE_DATA.length - 1 ? '1px solid var(--neutral-100)' : 'none' }}>
                  <div className="flex-center" style={{ gap: '8px' }}>
                    <span className="legend-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                    <span className="font-medium text-neutral-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-neutral-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* LOWER TABLES GRID */}
      <div className="dashboard-tables-container" style={{ marginTop: '24px' }}>
        
        {/* Left Column: Low Stock Alerts */}
        <div className="dashboard-tables-left-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <Card>
            <CardHeader className="flex-between" style={{ flexDirection: 'row', alignItems: 'center' }}>
              <div>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>{lowStockCount} products require restock orders soon.</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                icon={<ChevronRight size={14} />} 
                iconPosition="right"
                onClick={() => handleQuickAction('Inventory Stock Health tracker', '/inventory')}
              >
                View All
              </Button>
            </CardHeader>
            <CardBody style={{ padding: 0 }}>
              <Table style={{ border: 'none', borderRadius: 0 }}>
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th>Stock</Th>
                    <Th>Min</Th>
                    <Th>Status</Th>
                    <Th align="right">Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {products.filter(p => p.currentStock <= p.minStock)
                    .sort((a, b) => a.currentStock - b.currentStock)
                    .slice(0, 4)
                    .map((product) => {
                      const isOutOfStock = product.currentStock === 0;
                      const isCritical = product.currentStock <= 5 && !isOutOfStock;
                      
                      let badgeVariant = 'warning';
                      let statusText = 'Low Stock';
                      if (isOutOfStock) {
                        badgeVariant = 'danger';
                        statusText = 'Out of Stock';
                      } else if (isCritical) {
                        badgeVariant = 'danger';
                        statusText = 'Critical';
                      }

                      return (
                        <Tr key={product.sku}>
                          <Td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span className="font-semibold text-neutral-800">{product.title}</span>
                              <span className="text-xs text-muted">{product.sku}</span>
                            </div>
                          </Td>
                          <Td><span className={isOutOfStock || isCritical ? 'text-danger font-bold' : ''}>{product.currentStock}</span></Td>
                          <Td>{product.minStock}</Td>
                          <Td>
                            <Badge variant={badgeVariant}>{statusText}</Badge>
                          </Td>
                          <Td align="right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                              onClick={() => handleQuickAction(`Restock details for ${product.title}`, '/restock-orders')}
                            >
                              Review
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })}
                </Tbody>
              </Table>
            </CardBody>
          </Card>

          {/* Recent Sales Table */}
          <Card>
            <CardHeader className="flex-between" style={{ flexDirection: 'row', alignItems: 'center' }}>
              <div>
                <CardTitle>Recent Sales Transactions</CardTitle>
                <CardDescription>Latest POS checkouts and payment modes.</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                icon={<ChevronRight size={14} />} 
                iconPosition="right"
                onClick={() => handleQuickAction('Sales history records', '/sales')}
              >
                View History
              </Button>
            </CardHeader>
            <CardBody style={{ padding: 0 }}>
              <Table style={{ border: 'none', borderRadius: 0 }}>
                <Thead>
                  <Tr>
                    <Th>Invoice</Th>
                    <Th>Items</Th>
                    <Th>Amount</Th>
                    <Th>Payment</Th>
                    <Th>Time</Th>
                    <Th>Status</Th>
                    <Th align="right">Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sales.slice(0, 3).map((sale) => (
                    <Tr key={sale.invoiceNo}>
                      <Td><span className="font-semibold text-primary">{sale.invoiceNo}</span></Td>
                      <Td>{sale.itemsCount} items</Td>
                      <Td><span className="font-semibold text-neutral-800">₹{sale.totalAmount}</span></Td>
                      <Td>{sale.paymentMethod}</Td>
                      <Td className="text-muted" style={{ fontSize: '12px' }}>{sale.date}</Td>
                      <Td><Badge variant="success">Completed</Badge></Td>
                      <Td align="right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={<Eye size={14} />} 
                          onClick={() => addToast(`Opening details drawer for ${sale.invoiceNo}...`, 'info')}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Restock Activity */}
        <div className="dashboard-tables-right-col">
          <Card style={{ height: '100%' }}>
            <CardHeader className="flex-between" style={{ flexDirection: 'row', alignItems: 'center' }}>
              <div>
                <CardTitle>Recent Restocks</CardTitle>
                <CardDescription>Purchase order replenishment logs.</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                icon={<ChevronRight size={14} />} 
                iconPosition="right"
                onClick={() => handleQuickAction('Restock Orders logs', '/restock-orders')}
              >
                View Logs
              </Button>
            </CardHeader>
            <CardBody style={{ padding: '0 20px 20px' }}>
              <div className="restock-activity-feed" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {restockOrders.slice(0, 3).map((order) => {
                  let statusColor = 'warning';
                  if (order.status === 'Received') statusColor = 'success';
                  if (order.status === 'Email Sent') statusColor = 'primary';

                  return (
                    <div key={order.id} className="restock-feed-card flex-between" style={{ padding: '14px', border: '1px solid var(--neutral-200)', borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--neutral-50)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                          <span className="font-bold text-neutral-800" style={{ fontSize: '13.5px' }}>{order.id}</span>
                          <Badge variant={statusColor} style={{ fontSize: '9px', padding: '1px 5.5px' }}>
                            {order.status}
                          </Badge>
                        </div>
                        <span className="text-sm font-semibold text-neutral-600">{order.supplierName}</span>
                        <span className="text-xs text-muted">{order.itemsCount} products • ₹{order.totalAmount}</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span className="text-xs text-muted">{order.date}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ padding: '4px' }}
                          onClick={() => handleQuickAction(`Review details for ${order.id}`, `/restock-orders`)}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
