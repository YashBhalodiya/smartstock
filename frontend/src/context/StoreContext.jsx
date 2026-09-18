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
import { restockService } from '../services/restock.service';
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

  const fetchEntity = async (serviceFn, setter, label) => {
    if (localStorage.getItem('stockflow_token')) {
      try {
        const data = await serviceFn();
        if (Array.isArray(data)) setter(data);
      } catch (err) {
        console.error(`Failed to load ${label}:`, err);
      }
    }
  };

  const refreshSuppliers = useCallback(() => fetchEntity(suppliersService.getSuppliers, setSuppliers, 'suppliers'), []);
  const refreshProducts = useCallback(() => fetchEntity(productsService.getProducts, setProducts, 'products'), []);
  const refreshCategories = useCallback(() => fetchEntity(categoriesService.getCategories, setCategories, 'categories'), []);
  const refreshSales = useCallback(() => fetchEntity(salesService.getSales, setSales, 'sales'), []);
  const refreshRestockOrders = useCallback(() => fetchEntity(restockService.getRestockOrders, setRestockOrders, 'restockOrders'), []);

  const refreshAll = useCallback(async () => {
    if (localStorage.getItem('stockflow_token')) {
      await Promise.all([refreshSuppliers(), refreshProducts(), refreshCategories(), refreshSales(), refreshRestockOrders()]);
    }
  }, [refreshSuppliers, refreshProducts, refreshCategories, refreshSales, refreshRestockOrders]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Auto scanner: Ensures any product with 0 stock has a pending restock order generated
  useEffect(() => {
    if (products && products.length > 0) {
      setRestockOrders(prevOrders => {
        let hasChanges = false;
        let nextOrders = [...prevOrders];

        products.forEach(p => {
          if (p.currentStock <= 0) {
            const inOrder = nextOrders.some(o => 
              (o.status === 'Pending Approval' || o.status === 'Email Sent' || o.rawStatus === 'PENDING_APPROVAL' || o.rawStatus === 'SENT') &&
              (o.products || []).some(item => item.sku === p.sku || item.productId === p.id)
            );

            if (!inOrder) {
              hasChanges = true;
              const supp = suppliers.find(s => s.id === p.supplierId) || suppliers[0] || { id: 'SUP-101', name: 'ABC Distributors', email: 'supplier@example.com' };
              const suppId = supp.id || p.supplierId || 'SUP-101';
              
              const pendingIdx = nextOrders.findIndex(o => (o.supplierId === suppId || o.supplierName === supp.name) && (o.status === 'Pending Approval' || o.rawStatus === 'PENDING_APPROVAL'));
              const orderQty = p.restockQty || p.restockQuantity || 10;
              const price = p.purchasePrice || 0;
              const orderItem = {
                sku: p.sku,
                title: p.title || p.name,
                currentStock: p.currentStock,
                orderQty,
                unitPurchasePrice: price,
                subtotal: orderQty * price,
                minStock: p.minStock || 0
              };

              if (pendingIdx > -1) {
                const existingOrder = nextOrders[pendingIdx];
                nextOrders[pendingIdx] = {
                  ...existingOrder,
                  itemsCount: (existingOrder.products || []).length + 1,
                  totalAmount: Number(existingOrder.totalAmount || 0) + (orderQty * price),
                  products: [...(existingOrder.products || []), orderItem]
                };
              } else {
                const newRoId = `RO-${Date.now().toString().slice(-6)}`;
                nextOrders.unshift({
                  id: newRoId,
                  orderNumber: newRoId,
                  supplierId: suppId,
                  supplierName: supp.name || 'Supplier',
                  email: supp.email || 'supplier@example.com',
                  itemsCount: 1,
                  totalAmount: orderQty * price,
                  date: 'Today, Just now',
                  status: 'Pending Approval',
                  rawStatus: 'PENDING_APPROVAL',
                  products: [orderItem]
                });
              }
            }
          }
        });

        return hasChanges ? nextOrders : prevOrders;
      });
    }
  }, [products, suppliers]);

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
  const approveRestockOrder = useCallback(async (orderId) => {
    try {
      if (localStorage.getItem('stockflow_token')) {
        const updated = await restockService.approveRestockOrder(orderId);
        if (updated) {
          setRestockOrders(prev => prev.map(o => (o.id === orderId || o.orderNumber === orderId || o.id === updated.id) ? { ...o, ...updated, status: 'Email Sent', rawStatus: 'SENT' } : o));
        }
        addSystemNotification(
          'restock_approved',
          `✓ Order Approved: Restock purchase email sent to supplier.`,
          orderId
        );
        return updated;
      }
    } catch (err) {
      console.error('Failed to approve restock order via API:', err);
    }

    // Local fallback
    setRestockOrders(prev => prev.map(order => {
      if (order.id !== orderId && order.orderNumber !== orderId) return order;
      
      addSystemNotification(
        'restock_approved', 
        `✓ Order Approved: Restock purchase email sent for ${orderId}.`, 
        orderId
      );
      
      return {
        ...order,
        status: 'Email Sent',
        rawStatus: 'SENT',
        date: 'Today, Email Sent'
      };
    }));
  }, [addSystemNotification]);

  // Marks restock order items received and updates stock counts
  const receiveRestock = useCallback(async (orderId, receivedQuantities, orderObj) => {
    // 1. Locate the restock order in state or from passed parameter
    const targetOrder = orderObj || restockOrders.find(o => o.id === orderId || o.orderNumber === orderId);
    const orderItems = targetOrder ? (targetOrder.products || targetOrder.items || []) : [];

    // Helper: calculate quantity to add to a given product
    const getReplenishQty = (prod) => {
      if (receivedQuantities) {
        if (prod.sku && receivedQuantities[prod.sku] !== undefined) return Number(receivedQuantities[prod.sku]);
        if (prod.id && receivedQuantities[prod.id] !== undefined) return Number(receivedQuantities[prod.id]);
      }
      const match = orderItems.find(item => 
        (item.sku && prod.sku && item.sku.toLowerCase() === prod.sku.toLowerCase()) ||
        (item.productId && (item.productId === prod.id || item.productId === prod.productId)) ||
        (item.id && (item.id === prod.id || item.id === prod.productId))
      );
      if (match) {
        return Number(match.orderQty || match.quantity || 0);
      }
      return 0;
    };

    let apiUpdated = null;
    let apiSuccess = false;

    if (localStorage.getItem('stockflow_token')) {
      try {
        apiUpdated = await restockService.receiveRestockOrder(orderId);
        apiSuccess = true;
      } catch (err) {
        console.error('Failed to mark restock order received via API:', err);
      }
    }

    // 2. Immediately update product stock counts in state
    setProducts(prevProducts => prevProducts.map(prod => {
      const replenishQty = getReplenishQty(prod);
      if (replenishQty > 0) {
        return {
          ...prod,
          currentStock: Number(prod.currentStock || 0) + replenishQty
        };
      }
      return prod;
    }));

    // 3. Mark the restock order as Received in state
    setRestockOrders(prev => prev.map(order => {
      if (order.id === orderId || order.orderNumber === orderId || (apiUpdated && order.id === apiUpdated.id)) {
        if (apiUpdated) {
          return {
            ...order,
            ...apiUpdated,
            status: 'Received',
            rawStatus: 'RECEIVED',
            receivedAt: apiUpdated.receivedAt || new Date().toISOString(),
            products: (order.products || []).map(p => {
              const replenish = getReplenishQty(p);
              return {
                ...p,
                currentStock: Number(p.currentStock || 0) + replenish
              };
            })
          };
        }
        return {
          ...order,
          status: 'Received',
          rawStatus: 'RECEIVED',
          receivedAt: new Date().toISOString(),
          products: (order.products || []).map(p => {
            const replenish = getReplenishQty(p);
            return {
              ...p,
              currentStock: Number(p.currentStock || 0) + replenish
            };
          })
        };
      }
      return order;
    }));

    // 4. Decrement active orders for supplier
    const supplierId = targetOrder?.supplierId;
    if (supplierId) {
      setSuppliers(prev => prev.map(s => 
        (s.id === supplierId || s.name === targetOrder.supplierName)
          ? { ...s, activeOrders: Math.max(0, (s.activeOrders || 0) - 1) }
          : s
      ));
    }

    // 5. Add system notification
    const orderDisplayId = targetOrder?.orderNumber || targetOrder?.id || orderId;
    addSystemNotification(
      'restock_received',
      `✓ Inventory Updated: Restock items received for #${orderDisplayId}. Stock levels replenished.`,
      orderId
    );

    // 6. If API succeeded, trigger background refresh
    if (apiSuccess) {
      if (typeof refreshProducts === 'function') await refreshProducts();
      if (typeof refreshRestockOrders === 'function') await refreshRestockOrders();
    }

    return apiUpdated || targetOrder;
  }, [restockOrders, addSystemNotification, refreshProducts, refreshRestockOrders]);

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
      const supplier = suppliers.find(s => s.id === updatedProduct.supplierId) || suppliers[0] || { id: 'SUP-101', name: 'ABC Distributors', email: 'supplier@example.com' };
      const supplierIdToUse = supplier.id || updatedProduct.supplierId || 'SUP-101';

      setRestockOrders(prevOrders => {
        const existingPendingIndex = prevOrders.findIndex(
          o => (o.supplierId === supplierIdToUse || o.supplierName === supplier.name) && (o.status === 'Pending Approval' || o.rawStatus === 'PENDING_APPROVAL')
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
          const newRoId = `RO-${Date.now().toString().slice(-6)}`;
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
            orderNumber: newRoId,
            supplierId: supplierIdToUse,
            supplierName: supplier.name,
            email: supplier.email,
            itemsCount: 1,
            totalAmount: totalCost,
            date: 'Today, Just now',
            status: 'Pending Approval',
            rawStatus: 'PENDING_APPROVAL',
            products: [orderItem]
          };

          return [newOrder, ...prevOrders];
        }
        return prevOrders;
      });
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
      refreshRestockOrders,
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
