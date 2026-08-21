import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_SUPPLIERS, 
  INITIAL_CATEGORIES, 
  INITIAL_SALES, 
  INITIAL_RESTOCK_ORDERS, 
  INITIAL_NOTIFICATIONS 
} from '../constants/mockData';
import { suppliersService } from '../services/suppliers.service';
import { productsService } from '../services/products.service';
import { categoriesService } from '../services/categories.service';
import { salesService } from '../services/sales.service';
import { getCartGstBreakdown } from '../utils/gstUtils';

const StoreContext = createContext(null);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

const getInitialData = (demoData) => {
  try {
    const userStr = localStorage.getItem('stockflow_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // Seeded demo account gets seeded demo data; new accounts get clean empty state
      if (user && user.email === 'store@stockflow.com') {
        return demoData;
      }
    }
  } catch (err) {}
  return [];
};

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState(() => getInitialData(INITIAL_PRODUCTS));
  const [suppliers, setSuppliers] = useState(() => getInitialData(INITIAL_SUPPLIERS));
  const [categories, setCategories] = useState(() => getInitialData(INITIAL_CATEGORIES));
  const [sales, setSales] = useState(() => getInitialData(INITIAL_SALES));
  const [restockOrders, setRestockOrders] = useState(() => getInitialData(INITIAL_RESTOCK_ORDERS));
  const [notifications, setNotifications] = useState(() => getInitialData(INITIAL_NOTIFICATIONS));

  // Automatically fetch shopkeeper's suppliers from backend API
  const refreshSuppliers = useCallback(async () => {
    if (localStorage.getItem('stockflow_token')) {
      try {
        const data = await suppliersService.getSuppliers();
        if (Array.isArray(data)) {
          setSuppliers(data);
        }
      } catch (err) {
        console.error('Failed to load shopkeeper suppliers:', err);
      }
    }
  }, []);

  // Fetch shopkeeper's products from backend API
  const refreshProducts = useCallback(async () => {
    if (localStorage.getItem('stockflow_token')) {
      try {
        const data = await productsService.getProducts();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to load shopkeeper products:', err);
      }
    }
  }, []);

  // Fetch shopkeeper's categories from backend API
  const refreshCategories = useCallback(async () => {
    if (localStorage.getItem('stockflow_token')) {
      try {
        const data = await categoriesService.getCategories();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
  }, []);

  // Fetch shopkeeper's sales transactions from backend API
  const refreshSales = useCallback(async () => {
    if (localStorage.getItem('stockflow_token')) {
      try {
        const data = await salesService.getSales();
        if (Array.isArray(data)) {
          setSales(data);
        }
      } catch (err) {
        console.error('Failed to load sales transactions:', err);
      }
    }
  }, []);

  const refreshAll = useCallback(async () => {
    if (localStorage.getItem('stockflow_token')) {
      await Promise.all([
        refreshSuppliers(),
        refreshProducts(),
        refreshCategories(),
        refreshSales()
      ]);
    }
  }, [refreshSuppliers, refreshProducts, refreshCategories, refreshSales]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Helper to add notification
  const addSystemNotification = useCallback((type, message, targetId) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      type,
      message,
      time: 'Just now',
      unread: true,
      targetId
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  // Completes a POS sale transaction
  const createSale = useCallback(async (cartItems, paymentMethod, discount = 0) => {
    try {
      if (localStorage.getItem('stockflow_token')) {
        const createdSale = await salesService.createSale({ cartItems, paymentMethod, discount });
        setSales(prev => [createdSale, ...prev]);

        // Find which items in cart are now low stock
        const lowStockAlerts = [];
        for (const item of cartItems) {
          const prod = products.find(p => p.sku === item.sku);
          if (prod) {
            const newStock = prod.currentStock - item.quantity;
            if (newStock <= prod.minStock) {
              lowStockAlerts.push({
                sku: prod.sku,
                title: prod.title,
                currentStock: Math.max(0, newStock)
              });
            }
          }
        }

        if (typeof refreshProducts === 'function') {
          await refreshProducts();
        }
        return { invoice: createdSale, lowStockAlerts };
      }
    } catch (err) {
      console.error('Error saving sale to database:', err);
      throw err;
    }

    // Local state fallback calculation if offline
    const invoiceNo = `INV-${sales.length + 1025}`;
    const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
    const calculatedDiscount = Number(discount) || 0;
    const totalAmount = Math.max(0, subtotal - calculatedDiscount);
    const gstInfo = getCartGstBreakdown(cartItems, calculatedDiscount);
    const tax = gstInfo.inclusiveTax;

    const newSale = {
      invoiceNo,
      itemsCount,
      totalAmount,
      subtotal,
      discount: calculatedDiscount,
      tax,
      paymentMethod,
      date: 'Today, Just now',
      status: 'Completed',
      items: cartItems.map(item => ({
        sku: item.sku,
        title: item.title,
        category: item.category,
        quantity: item.quantity,
        price: item.sellingPrice
      }))
    };

    setSales(prev => [newSale, ...prev]);

    // calculate lowStockAlerts for fallback
    const lowStockAlerts = [];
    setProducts(prevProducts => prevProducts.map(p => {
      const cartItem = cartItems.find(item => item.sku === p.sku);
      if (!cartItem) return p;
      const updatedStock = Math.max(0, p.currentStock - cartItem.quantity);
      if (updatedStock <= p.minStock) {
        lowStockAlerts.push({
          sku: p.sku,
          title: p.title,
          currentStock: updatedStock
        });
      }
      return { ...p, currentStock: updatedStock };
    }));

    return { invoice: newSale, lowStockAlerts };
  }, [sales.length, refreshProducts, products]);

  // Approves a pending restock order
  const approveRestockOrder = useCallback((orderId) => {
    setRestockOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      
      addSystemNotification(
        'restock_approved', 
        `✓ Order Approved: Restock purchase email sent for ${orderId}.`, 
        orderId
      );
      
      return {
        ...order,
        status: 'Email Sent',
        date: 'Today, Email Sent'
      };
    }));
  }, [addSystemNotification]);

  // Marks restock order items received and updates stock counts
  const receiveRestock = useCallback((orderId, receivedQuantities) => {
    setRestockOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      // 1. Update product stock levels
      setProducts(prevProducts => prevProducts.map(product => {
        const receivedQty = receivedQuantities[product.sku];
        if (!receivedQty) return product;
        return {
          ...product,
          currentStock: product.currentStock + Number(receivedQty)
        };
      }));

      // 2. Decrement active orders for supplier
      setSuppliers(prevSuppliers => prevSuppliers.map(s => 
        s.id === order.supplierId ? { ...s, activeOrders: Math.max(0, s.activeOrders - 1) } : s
      ));

      addSystemNotification(
        'restock_received', 
        `✓ Inventory Updated: Restock items received for ${orderId}.`, 
        orderId
      );

      return {
        ...order,
        status: 'Received'
      };
    }));
  }, [addSystemNotification]);

  const markNotificationAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  }, []);

  // --- PHASE 4: PRODUCTS CRUD ACTIONS ---
  const addProduct = useCallback(async (productData) => {
    try {
      // Find category ID or create new category on backend
      let categoryId = productData.categoryId;
      if (!categoryId) {
        const matchedCat = categories.find(c => c.name.toLowerCase() === productData.category.toLowerCase());
        if (matchedCat) {
          categoryId = matchedCat.id;
        } else {
          const newCat = await categoriesService.createCategory({ name: productData.category });
          categoryId = newCat.id;
        }
      }

      const payload = {
        name: productData.title,
        sku: productData.sku,
        barcode: productData.barcode || undefined,
        categoryId,
        supplierId: productData.supplierId,
        purchasePrice: Number(productData.purchasePrice),
        sellingPrice: Number(productData.sellingPrice),
        currentStock: Number(productData.currentStock),
        minimumStock: Number(productData.minStock),
        restockQuantity: Number(productData.restockQty)
      };

      const createdProduct = await productsService.createProduct(payload);
      setProducts(prev => [createdProduct, ...prev]);

      addSystemNotification(
        'system',
        `Product catalog updated: ${createdProduct.title} saved to database.`,
        createdProduct.sku
      );

      return createdProduct;
    } catch (err) {
      console.error('Error saving product to backend DB:', err);
      // Fallback local update
      const newSku = productData.sku || `SKU-${products.length + 1012}`;
      const newProduct = {
        ...productData,
        sku: newSku,
        status: 'Active'
      };

      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    }
  }, [categories, products, addSystemNotification]);

  const updateProduct = useCallback((sku, updatedData) => {
    setProducts(prev => prev.map(p => p.sku === sku ? { ...p, ...updatedData } : p));
    
    // Category count shifts if category is modified (complex, but simple approximation works for mockup)
    addSystemNotification(
      'system',
      `Product SKU: ${sku} details successfully updated.`,
      sku
    );
  }, [addSystemNotification]);

  const toggleProductStatus = useCallback((sku) => {
    setProducts(prev => prev.map(p => {
      if (p.sku !== sku) return p;
      const nextStatus = p.status === 'Active' ? 'Inactive' : 'Active';
      
      addSystemNotification(
        'system',
        `Product ${p.title} has been marked ${nextStatus}.`,
        sku
      );
      
      return {
        ...p,
        status: nextStatus
      };
    }));
  }, [addSystemNotification]);

  // --- PHASE 4: CATEGORIES CRUD ACTIONS ---
  const addCategory = useCallback(async (name) => {
    try {
      if (localStorage.getItem('stockflow_token')) {
        const newCat = await categoriesService.createCategory({ name });
        setCategories(prev => [newCat, ...prev]);
        addSystemNotification('system', `Category department: ${name} saved to database.`, newCat.id);
        return newCat;
      }
    } catch (err) {
      console.error('Error saving category to database:', err);
    }

    const nextId = `CAT-${categories.length + 1}`;
    const newCat = {
      id: nextId,
      name,
      count: 0,
      createdDate: 'Today, Just now',
      status: 'Active'
    };

    setCategories(prev => [...prev, newCat]);
    addSystemNotification('system', `Category tag: ${name} added successfully.`, nextId);
    return newCat;
  }, [categories.length, addSystemNotification]);

  const updateCategory = useCallback((id, updatedData) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    addSystemNotification('system', `Category tag details updated.`, id);
  }, [addSystemNotification]);

  const toggleCategoryStatus = useCallback((id) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== id) return c;
      const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
      
      addSystemNotification(
        'system',
        `Category department ${c.name} is now ${nextStatus}.`,
        id
      );

      return {
        ...c,
        status: nextStatus
      };
    }));
  }, [addSystemNotification]);

  // --- PHASE 5: INVENTORY ACTIONS ---
  const adjustStock = useCallback((sku, newStockCount, reason) => {
    const product = products.find(p => p.sku === sku);
    if (!product) return;

    const updatedProduct = { ...product, currentStock: Number(newStockCount) };

    setProducts(prevProducts => prevProducts.map(p => {
      if (p.sku !== sku) return p;
      return updatedProduct;
    }));

    addSystemNotification(
      'system',
      `Stock Adjustment: ${product.title} set to ${newStockCount} units. Reason: ${reason}.`,
      sku
    );

    // If stock goes below safety threshold, trigger automated restock check
    if (updatedProduct.currentStock <= updatedProduct.minStock) {
      addSystemNotification(
        'low_stock', 
        `🔴 Alert: Adjusted stock of ${updatedProduct.title} is below safety levels (${updatedProduct.currentStock} units).`, 
        sku
      );

      // Auto append to restock orders
      const supplier = suppliers.find(s => s.id === updatedProduct.supplierId);
      if (supplier) {
        setRestockOrders(prevOrders => {
          const existingPendingIndex = prevOrders.findIndex(
            o => o.supplierId === updatedProduct.supplierId && o.status === 'Pending Approval'
          );

          if (existingPendingIndex > -1) {
            const existingOrder = prevOrders[existingPendingIndex];
            const hasProduct = existingOrder.products.some(pr => pr.sku === updatedProduct.sku);
            
            if (!hasProduct) {
              const orderItem = {
                sku: updatedProduct.sku,
                title: updatedProduct.title,
                currentStock: updatedProduct.currentStock,
                orderQty: updatedProduct.restockQty,
                minStock: updatedProduct.minStock
              };
              
              const updatedProductsList = [...existingOrder.products, orderItem];
              const additionalCost = updatedProduct.purchasePrice * updatedProduct.restockQty;
              
              const updatedOrdersList = [...prevOrders];
              updatedOrdersList[existingPendingIndex] = {
                ...existingOrder,
                itemsCount: updatedProductsList.length,
                totalAmount: existingOrder.totalAmount + additionalCost,
                products: updatedProductsList
              };
              return updatedOrdersList;
            }
          } else {
            const newRoId = `RO-${prevOrders.length + 1005}`;
            const orderItem = {
              sku: updatedProduct.sku,
              title: updatedProduct.title,
              currentStock: updatedProduct.currentStock,
              orderQty: updatedProduct.restockQty,
              minStock: updatedProduct.minStock
            };
            const totalCost = updatedProduct.purchasePrice * updatedProduct.restockQty;

            const newOrder = {
              id: newRoId,
              supplierId: updatedProduct.supplierId,
              supplierName: supplier.name,
              email: supplier.email,
              itemsCount: 1,
              totalAmount: totalCost,
              date: 'Today, Just now',
              status: 'Pending Approval',
              products: [orderItem]
            };

            // Increment active orders for supplier
            setSuppliers(prevSuppliers => prevSuppliers.map(s => 
              s.id === supplier.id ? { ...s, activeOrders: s.activeOrders + 1 } : s
            ));

            return [newOrder, ...prevOrders];
          }
          return prevOrders;
        });
      }
    }
  }, [products, suppliers, addSystemNotification]);

  const triggerManualRestock = useCallback((sku, quantity) => {
    const product = products.find(p => p.sku === sku);
    if (!product) return;

    const supplier = suppliers.find(s => s.id === product.supplierId);
    if (!supplier) return;

    const qtyToOrder = Number(quantity) || product.restockQty;

    setRestockOrders(prevOrders => {
      const existingPendingIndex = prevOrders.findIndex(
        o => o.supplierId === product.supplierId && o.status === 'Pending Approval'
      );

      if (existingPendingIndex > -1) {
        const existingOrder = prevOrders[existingPendingIndex];
        const hasProductIndex = existingOrder.products.findIndex(pr => pr.sku === product.sku);
        
        const updatedOrdersList = [...prevOrders];
        if (hasProductIndex > -1) {
          // Product already in pending order, increase qty
          const updatedProductsList = existingOrder.products.map((pr, index) => {
            if (index === hasProductIndex) {
              return { ...pr, orderQty: pr.orderQty + qtyToOrder };
            }
            return pr;
          });
          const additionalCost = product.purchasePrice * qtyToOrder;
          
          updatedOrdersList[existingPendingIndex] = {
            ...existingOrder,
            totalAmount: existingOrder.totalAmount + additionalCost,
            products: updatedProductsList
          };
        } else {
          // Add product to pending order
          const orderItem = {
            sku: product.sku,
            title: product.title,
            currentStock: product.currentStock,
            orderQty: qtyToOrder,
            minStock: product.minStock
          };
          const updatedProductsList = [...existingOrder.products, orderItem];
          const additionalCost = product.purchasePrice * qtyToOrder;
          
          updatedOrdersList[existingPendingIndex] = {
            ...existingOrder,
            itemsCount: updatedProductsList.length,
            totalAmount: existingOrder.totalAmount + additionalCost,
            products: updatedProductsList
          };
        }

        addSystemNotification(
          'restock_generated',
          `Manual restock for ${product.title} (Qty: ${qtyToOrder}) added to pending restock ${existingOrder.id}.`,
          existingOrder.id
        );

        return updatedOrdersList;
      } else {
        // Create new pending order
        const newRoId = `RO-${prevOrders.length + 1005}`;
        const orderItem = {
          sku: product.sku,
          title: product.title,
          currentStock: product.currentStock,
          orderQty: qtyToOrder,
          minStock: product.minStock
        };
        const totalCost = product.purchasePrice * qtyToOrder;

        const newOrder = {
          id: newRoId,
          supplierId: product.supplierId,
          supplierName: supplier.name,
          email: supplier.email,
          itemsCount: 1,
          totalAmount: totalCost,
          date: 'Today, Just now',
          status: 'Pending Approval',
          products: [orderItem]
        };

        // Increment active orders for supplier
        setSuppliers(prevSuppliers => prevSuppliers.map(s => 
          s.id === supplier.id ? { ...s, activeOrders: s.activeOrders + 1 } : s
        ));

        addSystemNotification(
          'restock_generated',
          `Manual restock generated ${newRoId} for ${supplier.name} (Qty: ${qtyToOrder}).`,
          newRoId
        );

        return [newOrder, ...prevOrders];
      }
    });
  }, [products, suppliers, addSystemNotification]);

  return (
    <StoreContext.Provider value={{
      products,
      setProducts,
      suppliers,
      setSuppliers,
      categories,
      setCategories,
      sales,
      setSales,
      restockOrders,
      setRestockOrders,
      notifications,
      setNotifications,
      refreshSuppliers,
      refreshProducts,
      refreshCategories,
      refreshSales,
      refreshAll,
      createSale,
      approveRestockOrder,
      receiveRestock,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      addProduct,
      updateProduct,
      toggleProductStatus,
      addCategory,
      updateCategory,
      toggleCategoryStatus,
      adjustStock,
      triggerManualRestock
    }}>
      {children}
    </StoreContext.Provider>
  );
};
