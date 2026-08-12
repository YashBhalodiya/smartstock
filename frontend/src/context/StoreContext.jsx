import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_SUPPLIERS, 
  INITIAL_CATEGORIES, 
  INITIAL_SALES, 
  INITIAL_RESTOCK_ORDERS, 
  INITIAL_NOTIFICATIONS 
} from '../constants/mockData';

const StoreContext = createContext(null);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [sales, setSales] = useState(INITIAL_SALES);
  const [restockOrders, setRestockOrders] = useState(INITIAL_RESTOCK_ORDERS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

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
  const createSale = useCallback((cartItems, paymentMethod, discount = 0) => {
    const invoiceNo = `INV-${sales.length + 1025}`;
    
    // 1. Calculations
    const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
    const calculatedDiscount = Number(discount) || 0;
    const tax = Math.round(((subtotal - calculatedDiscount) * 0.05) * 100) / 100;
    const totalAmount = subtotal - calculatedDiscount + tax;

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
        quantity: item.quantity,
        price: item.sellingPrice
      }))
    };

    // 2. Update stock & Check thresholds
    const lowStockAlerts = [];
    let updatedOrders = [...restockOrders];
    let ordersModified = false;

    const updatedProducts = products.map(product => {
      const cartItem = cartItems.find(item => item.sku === product.sku);
      if (!cartItem) return product;

      const newStock = Math.max(0, product.currentStock - cartItem.quantity);
      
      // Stock dropped below safety threshold
      if (newStock <= product.minStock) {
        lowStockAlerts.push({
          sku: product.sku,
          title: product.title,
          currentStock: newStock,
          minStock: product.minStock
        });

        // 3. Automated Restock Logic
        const supplier = suppliers.find(s => s.id === product.supplierId);
        if (supplier) {
          // Check if there's already a pending Restock Order for this supplier
          const existingPendingIndex = updatedOrders.findIndex(
            o => o.supplierId === product.supplierId && o.status === 'Pending Approval'
          );

          if (existingPendingIndex > -1) {
            // Append item to existing pending restock order
            const existingOrder = updatedOrders[existingPendingIndex];
            const hasProduct = existingOrder.products.some(p => p.sku === product.sku);
            
            if (!hasProduct) {
              const orderItem = {
                sku: product.sku,
                title: product.title,
                currentStock: newStock,
                orderQty: product.restockQty,
                minStock: product.minStock
              };
              
              const updatedProductsList = [...existingOrder.products, orderItem];
              const additionalCost = product.purchasePrice * product.restockQty;
              
              updatedOrders[existingPendingIndex] = {
                ...existingOrder,
                itemsCount: updatedProductsList.length,
                totalAmount: existingOrder.totalAmount + additionalCost,
                products: updatedProductsList
              };
              ordersModified = true;
              
              addSystemNotification(
                'restock_generated', 
                `${product.title} low stock. Appended to pending restock ${existingOrder.id}.`, 
                existingOrder.id
              );
            }
          } else {
            // Create a new pending restock order
            const newRoId = `RO-${updatedOrders.length + 1005}`;
            const orderItem = {
              sku: product.sku,
              title: product.title,
              currentStock: newStock,
              orderQty: product.restockQty,
              minStock: product.minStock
            };
            const totalCost = product.purchasePrice * product.restockQty;

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

            updatedOrders = [newOrder, ...updatedOrders];
            ordersModified = true;
            
            // Increment active orders for supplier
            setSuppliers(prevSuppliers => prevSuppliers.map(s => 
              s.id === supplier.id ? { ...s, activeOrders: s.activeOrders + 1 } : s
            ));

            addSystemNotification(
              'restock_generated',
              `Low Stock: Restock order ${newRoId} generated for ${supplier.name}.`,
              newRoId
            );
          }
        }
      }

      return {
        ...product,
        currentStock: newStock
      };
    });

    // Commit state changes
    setProducts(updatedProducts);
    setSales(prev => [newSale, ...prev]);
    if (ordersModified) {
      setRestockOrders(updatedOrders);
    }
    
    // Add low stock notifications if triggered
    lowStockAlerts.forEach(alert => {
      addSystemNotification(
        'low_stock', 
        `🔴 Alert: ${alert.title} stock is low (${alert.currentStock} remaining).`, 
        alert.sku
      );
    });

    return { invoice: newSale, lowStockAlerts };
  }, [products, sales, restockOrders, suppliers, addSystemNotification]);

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
  const addProduct = useCallback((productData) => {
    const newSku = productData.sku || `SKU-${products.length + 1012}`;
    const newProduct = {
      ...productData,
      sku: newSku,
      status: 'Active'
    };

    setProducts(prev => [newProduct, ...prev]);

    // Increment count of the category
    setCategories(prevCats => prevCats.map(cat => 
      cat.name.toLowerCase() === productData.category.toLowerCase()
        ? { ...cat, count: cat.count + 1 }
        : cat
    ));

    addSystemNotification(
      'system',
      `Product catalog updated: ${productData.title} created successfully.`,
      newSku
    );

    return newProduct;
  }, [products, addSystemNotification]);

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
  const addCategory = useCallback((name) => {
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
  }, [categories, addSystemNotification]);

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
      toggleCategoryStatus
    }}>
      {children}
    </StoreContext.Provider>
  );
};
