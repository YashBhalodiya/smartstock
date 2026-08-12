// Centralized Mock Data Store for StockFlow

export const INITIAL_PRODUCTS = [
  {
    sku: 'SKU-1001',
    barcode: '8901058002316',
    title: 'Maggi 2-Min Noodles',
    category: 'Food',
    sellingPrice: 14,
    purchasePrice: 11,
    currentStock: 9,
    minStock: 15,
    restockQty: 50,
    supplierId: 'SUP-101',
    status: 'Active'
  },
  {
    sku: 'SKU-1002',
    barcode: '8901030753021',
    title: 'Dove Soap 100g',
    category: 'Personal Care',
    sellingPrice: 55,
    purchasePrice: 42,
    currentStock: 7,
    minStock: 12,
    restockQty: 30,
    supplierId: 'SUP-101',
    status: 'Active'
  },
  {
    sku: 'SKU-1003',
    barcode: '8901725181229',
    title: 'Aashirvaad Atta 5kg',
    category: 'Grains',
    sellingPrice: 260,
    purchasePrice: 210,
    currentStock: 25,
    minStock: 10,
    restockQty: 20,
    supplierId: 'SUP-102',
    status: 'Active'
  },
  {
    sku: 'SKU-1004',
    barcode: '8906007281014',
    title: 'Fortune Sunflower Oil 1L',
    category: 'Grains',
    sellingPrice: 145,
    purchasePrice: 115,
    currentStock: 0,
    minStock: 10,
    restockQty: 40,
    supplierId: 'SUP-102',
    status: 'Active'
  },
  {
    sku: 'SKU-1005',
    barcode: '8901030704382',
    title: 'Surf Excel Easy Wash 1kg',
    category: 'Cleaning',
    sellingPrice: 170,
    purchasePrice: 135,
    currentStock: 18,
    minStock: 8,
    restockQty: 15,
    supplierId: 'SUP-103',
    status: 'Active'
  },
  {
    sku: 'SKU-1006',
    barcode: '8901123004566',
    title: 'Colgate MaxFresh 150g',
    category: 'Personal Care',
    sellingPrice: 95,
    purchasePrice: 75,
    currentStock: 35,
    minStock: 12,
    restockQty: 25,
    supplierId: 'SUP-101',
    status: 'Active'
  },
  {
    sku: 'SKU-1007',
    barcode: '8901052005085',
    title: 'Tata Tea Premium 1kg',
    category: 'Beverages',
    sellingPrice: 420,
    purchasePrice: 340,
    currentStock: 14,
    minStock: 8,
    restockQty: 15,
    supplierId: 'SUP-104',
    status: 'Active'
  },
  {
    sku: 'SKU-1008',
    barcode: '8901063004059',
    title: 'Parle-G Gold 1kg',
    category: 'Food',
    sellingPrice: 120,
    purchasePrice: 95,
    currentStock: 4,
    minStock: 10,
    restockQty: 50,
    supplierId: 'SUP-103',
    status: 'Active'
  },
  {
    sku: 'SKU-1009',
    barcode: '8906002003055',
    title: 'Sugar Premium 1kg',
    category: 'Food',
    sellingPrice: 45,
    purchasePrice: 36,
    currentStock: 65,
    minStock: 20,
    restockQty: 100,
    supplierId: 'SUP-102',
    status: 'Active'
  },
  {
    sku: 'SKU-1010',
    barcode: '8901725112230',
    title: 'Rice Basmati 5kg',
    category: 'Grains',
    sellingPrice: 550,
    purchasePrice: 450,
    currentStock: 4,
    minStock: 8,
    restockQty: 15,
    supplierId: 'SUP-102',
    status: 'Active'
  },
  {
    sku: 'SKU-1011',
    barcode: '8901058002330',
    title: 'Tata Salt 1kg',
    category: 'Food',
    sellingPrice: 28,
    purchasePrice: 22,
    currentStock: 50,
    minStock: 15,
    restockQty: 50,
    supplierId: 'SUP-101',
    status: 'Active'
  }
];

export const INITIAL_SUPPLIERS = [
  {
    id: 'SUP-101',
    name: 'ABC Distributors',
    email: 'abc@example.com',
    phone: '+91 98765 43210',
    address: '12, Sector A, GIDC, Ahmedabad',
    productsSupplied: 4,
    activeOrders: 1,
    status: 'Active'
  },
  {
    id: 'SUP-102',
    name: 'Shree Wholesale',
    email: 'shree@example.com',
    phone: '+91 99887 76655',
    address: '45, Market Lane, Surat',
    productsSupplied: 4,
    activeOrders: 1,
    status: 'Active'
  },
  {
    id: 'SUP-103',
    name: 'Gujarat FMCG Supply',
    email: 'gujfmcg@example.com',
    phone: '+91 91234 56789',
    address: '88, Ring Road, Rajkot',
    productsSupplied: 2,
    activeOrders: 0,
    status: 'Active'
  },
  {
    id: 'SUP-104',
    name: 'Metro Distributors',
    email: 'metro@example.com',
    phone: '+91 94455 66778',
    address: '101, Mall Area, Vadodara',
    productsSupplied: 1,
    activeOrders: 0,
    status: 'Active'
  }
];

export const INITIAL_CATEGORIES = [
  { id: 'CAT-1', name: 'Food', count: 4, createdDate: '2026-05-10', status: 'Active' },
  { id: 'CAT-2', name: 'Personal Care', count: 2, createdDate: '2026-05-12', status: 'Active' },
  { id: 'CAT-3', name: 'Cleaning', count: 1, createdDate: '2026-05-15', status: 'Active' },
  { id: 'CAT-4', name: 'Grains', count: 3, createdDate: '2026-05-18', status: 'Active' },
  { id: 'CAT-5', name: 'Beverages', count: 1, createdDate: '2026-05-20', status: 'Active' }
];

export const INITIAL_SALES = [
  {
    invoiceNo: 'INV-1024',
    itemsCount: 3,
    totalAmount: 540,
    subtotal: 514.28,
    discount: 0,
    tax: 25.72,
    paymentMethod: 'UPI',
    date: 'Today, 10:32 AM',
    status: 'Completed'
  },
  {
    invoiceNo: 'INV-1023',
    itemsCount: 5,
    totalAmount: 1250,
    subtotal: 1190.48,
    discount: 50,
    tax: 59.52,
    paymentMethod: 'Card',
    date: 'Yesterday, 07:15 PM',
    status: 'Completed'
  },
  {
    invoiceNo: 'INV-1022',
    itemsCount: 2,
    totalAmount: 185,
    subtotal: 176.19,
    discount: 0,
    tax: 8.81,
    paymentMethod: 'Cash',
    date: 'Yesterday, 03:40 PM',
    status: 'Completed'
  },
  {
    invoiceNo: 'INV-1021',
    itemsCount: 8,
    totalAmount: 3200,
    subtotal: 3047.62,
    discount: 100,
    tax: 152.38,
    paymentMethod: 'UPI',
    date: 'Aug 10, 2026, 11:20 AM',
    status: 'Completed'
  }
];

export const INITIAL_RESTOCK_ORDERS = [
  {
    id: 'RO-1004',
    supplierId: 'SUP-101',
    supplierName: 'ABC Distributors',
    email: 'abc@example.com',
    itemsCount: 3,
    totalAmount: 2350,
    date: 'Today, 09:15 AM',
    status: 'Pending Approval',
    products: [
      { sku: 'SKU-1001', title: 'Maggi 2-Min Noodles', currentStock: 9, orderQty: 50, minStock: 15 },
      { sku: 'SKU-1002', title: 'Dove Soap 100g', currentStock: 7, orderQty: 30, minStock: 12 },
      { sku: 'SKU-1011', title: 'Tata Salt 1kg', currentStock: 50, orderQty: 50, minStock: 15 }
    ]
  },
  {
    id: 'RO-1003',
    supplierId: 'SUP-102',
    supplierName: 'Shree Wholesale',
    email: 'shree@example.com',
    itemsCount: 2,
    totalAmount: 1460,
    date: 'Yesterday, 04:30 PM',
    status: 'Email Sent',
    products: [
      { sku: 'SKU-1003', title: 'Aashirvaad Atta 5kg', currentStock: 25, orderQty: 20, minStock: 10 },
      { sku: 'SKU-1004', title: 'Fortune Sunflower Oil 1L', currentStock: 0, orderQty: 40, minStock: 10 }
    ]
  },
  {
    id: 'RO-1002',
    supplierId: 'SUP-103',
    supplierName: 'Gujarat FMCG Supply',
    email: 'gujfmcg@example.com',
    itemsCount: 1,
    totalAmount: 2025,
    date: 'Aug 09, 2026',
    status: 'Received',
    products: [
      { sku: 'SKU-1005', title: 'Surf Excel Easy Wash 1kg', currentStock: 18, orderQty: 15, minStock: 8 }
    ]
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-1',
    type: 'low_stock',
    message: 'Fortune Sunflower Oil 1L is out of stock.',
    time: '5 minutes ago',
    unread: true,
    targetId: 'SKU-1004'
  },
  {
    id: 'NOTIF-2',
    type: 'restock_generated',
    message: 'Restock order RO-1004 generated for ABC Distributors.',
    time: '20 minutes ago',
    unread: true,
    targetId: 'RO-1004'
  },
  {
    id: 'NOTIF-3',
    type: 'restock_received',
    message: 'Restock order RO-1002 has been received and inventory updated.',
    time: '2 hours ago',
    unread: false,
    targetId: 'RO-1002'
  }
];

// Historical Chart Datasets
export const CHART_DATA_7D = [
  { name: 'Mon', revenue: 8400, sales: 60 },
  { name: 'Tue', revenue: 9200, sales: 68 },
  { name: 'Wed', revenue: 8100, sales: 55 },
  { name: 'Thu', revenue: 9800, sales: 70 },
  { name: 'Fri', revenue: 11200, sales: 82 },
  { name: 'Sat', revenue: 14200, sales: 98 },
  { name: 'Sun', revenue: 12450, sales: 87 }
];

export const CHART_DATA_30D = [
  { name: 'Week 1', revenue: 62000, sales: 420 },
  { name: 'Week 2', revenue: 58000, sales: 395 },
  { name: 'Week 3', revenue: 69000, sales: 460 },
  { name: 'Week 4', revenue: 78000, sales: 512 }
];

export const CHART_DATA_90D = [
  { name: 'May', revenue: 245000, sales: 1720 },
  { name: 'Jun', revenue: 278000, sales: 1890 },
  { name: 'Jul', revenue: 312000, sales: 2150 }
];

export const CATEGORY_SHARE_DATA = [
  { name: 'Food', value: 35, color: '#4f6ef2' }, // primary
  { name: 'Personal Care', value: 20, color: '#f59e0b' }, // warning
  { name: 'Grains', value: 22, color: '#10b981' }, // success
  { name: 'Cleaning', value: 15, color: '#ef4444' }, // danger
  { name: 'Beverages', value: 8, color: '#64748b' } // neutral-500
];
