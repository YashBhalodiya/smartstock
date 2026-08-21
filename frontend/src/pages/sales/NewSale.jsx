import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Receipt,
  Printer,
  ChevronRight,
  TrendingUp,
  Boxes
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import SearchBar from '../../components/ui/SearchBar';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { getCartGstBreakdown } from '../../utils/gstUtils';

const NewSale = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { products, createSale } = useStore();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart States
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Cash' | 'Card'
  const [completing, setCompleting] = useState(false);

  // Invoice Success States
  const [lastInvoice, setLastInvoice] = useState(null);
  const [stockAlerts, setStockAlerts] = useState([]);

  // Fetch unique categories list
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['All', ...Array.from(list)];
  }, [products]);

  // Filtered Products grid list
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.includes(searchQuery);

      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const isActive = product.status === 'Active';

      return matchesSearch && matchesCategory && isActive;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart Handlers
  const addToCart = (product) => {
    if (product.currentStock <= 0) {
      addToast('Item is out of stock.', 'error');
      return;
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.sku === product.sku);

      if (existingItemIndex > -1) {
        const existingItem = prevCart[existingItemIndex];

        if (existingItem.quantity + 1 > product.currentStock) {
          addToast(`Cannot add more. Only ${product.currentStock} units in stock.`, 'warning');
          return prevCart;
        }

        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + 1
        };
        addToast(`Incremented quantity of ${product.title}`, 'info', 1000);
        return updatedCart;
      } else {
        addToast(`Added ${product.title} to cart`, 'success', 1000);
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (sku, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.sku !== sku) return item;

        const newQty = item.quantity + change;
        if (newQty <= 0) return null; // Marked for deletion

        if (change > 0 && newQty > item.currentStock) {
          addToast(`Quantity cannot exceed available stock (${item.currentStock}).`, 'warning');
          return item;
        }

        return { ...item, quantity: newQty };
      }).filter(Boolean);
    });
  };

  const removeFromCart = (sku, title) => {
    setCart(prevCart => prevCart.filter(item => item.sku !== sku));
    addToast(`Removed ${title} from cart`, 'info');
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
  }, [cart]);

  const gstBreakdown = useMemo(() => {
    return getCartGstBreakdown(cart, discount);
  }, [cart, discount]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  // Checkout Handler
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      addToast('Cart is empty. Add products to complete sale.', 'warning');
      return;
    }

    setCompleting(true);

    try {
      // Simulate minor network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const result = await createSale(cart, paymentMethod, discount);
      if (!result) {
        throw new Error('No result returned from checkout');
      }
      const { invoice, lowStockAlerts } = result;
      setLastInvoice(invoice);
      setStockAlerts(lowStockAlerts || []);

      // Reset POS State
      setCart([]);
      setDiscount(0);
      addToast('Invoice checkout successfully completed!', 'success');
    } catch (err) {
      console.error(err);
      addToast(err?.message || 'Checkout processing failed. Try again.', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const startNewSale = () => {
    setLastInvoice(null);
    setStockAlerts([]);
  };

  // Render Checkout Success Panel
  if (lastInvoice) {
    return (
      <div className="pos-success-wrapper" style={{ animation: 'fadeIn var(--transition-fast) forwards' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>

          <Card className="pos-success-card">
            <CardBody className="flex-center" style={{ flexDirection: 'column', padding: '32px', textAlign: 'center' }}>
              <div className="pos-success-icon-wrapper flex-center bg-success-light text-success">
                <Check size={40} />
              </div>

              <h2 className="text-2xl font-bold" style={{ marginTop: '16px', color: 'var(--neutral-900)' }}>Sale Completed Successfully</h2>
              <p className="text-muted text-sm" style={{ marginTop: '4px' }}>Invoice has been generated and inventory stocks adjusted.</p>

              {/* Receipt Summary Sheet */}
              <div className="pos-receipt-summary" style={{ width: '100%', marginTop: '24px', padding: '20px', border: '1px dashed var(--neutral-300)', borderRadius: 'var(--border-radius-md)', textAlign: 'left', backgroundColor: 'var(--neutral-50)' }}>
                <div className="flex-between text-sm" style={{ marginBottom: '12px' }}>
                  <span className="text-muted">Invoice Number</span>
                  <span className="font-bold text-neutral-800">{lastInvoice.invoiceNo}</span>
                </div>
                <div className="flex-between text-sm" style={{ marginBottom: '12px' }}>
                  <span className="text-muted">Payment Mode</span>
                  <span className="font-semibold text-neutral-800">{lastInvoice.paymentMethod}</span>
                </div>
                <div className="flex-between text-sm" style={{ marginBottom: '12px' }}>
                  <span className="text-muted">Items Count</span>
                  <span className="font-medium text-neutral-800">{lastInvoice.itemsCount} units</span>
                </div>
                <div className="flex-between text-sm" style={{ marginBottom: '12px' }}>
                  <span className="text-muted">GST Tax (Inclusive)</span>
                  <span className="font-medium text-neutral-700">₹{lastInvoice.tax || 0} <span className="text-xs text-muted">(Incl. in MRP)</span></span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px dashed var(--neutral-300)', margin: '14px 0' }} />
                <div className="flex-between text-lg">
                  <span className="font-semibold text-neutral-800">Total Collected</span>
                  <span className="font-bold text-success" style={{ fontSize: '20px' }}>₹{lastInvoice.totalAmount}</span>
                </div>
              </div>

              {/* Threshold Inventory Alerts */}
              {stockAlerts.length > 0 && (
                <div className="pos-threshold-alerts" style={{ width: '100%', marginTop: '20px', padding: '16px', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--warning-light)', textAlign: 'left' }}>
                  <div className="flex-center text-warning font-semibold" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '8px', fontSize: '13.5px' }}>
                    <AlertTriangle size={18} />
                    <span>Inventory Warning Alert</span>
                  </div>
                  <ul style={{ paddingLeft: '20px', fontSize: '12.5px', color: 'var(--neutral-700)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {stockAlerts.map(alert => (
                      <li key={alert.sku}>
                        <strong>{alert.title}</strong> has dropped below safety limits ({alert.currentStock} left). A restock order has been generated automatically.
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<ChevronRight size={14} />}
                    iconPosition="right"
                    style={{ marginTop: '12px', padding: '4px 8px', fontSize: '12px', color: 'var(--warning-hover)', textDecoration: 'underline' }}
                    onClick={() => navigate('/restock-orders')}
                  >
                    Review Restock Order
                  </Button>
                </div>
              )}

              {/* Success Actions */}
              <div className="flex-center" style={{ gap: '12px', width: '100%', marginTop: '32px' }}>
                <Button
                  variant="outline"
                  icon={<Printer size={16} />}
                  onClick={() => addToast('Simulating Receipt Printing...', 'success')}
                >
                  Print Invoice
                </Button>
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={startNewSale}
                >
                  New Sale
                </Button>
              </div>

            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pos-page-wrapper">

      {/* LEFT COLUMN: PRODUCT GRID */}
      <div className="pos-products-column">

        {/* Filters and Searches */}
        <div className="pos-search-filter-card card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between flex-wrap" style={{ gap: '12px' }}>
            <h2 className="text-lg font-bold text-neutral-800">Product Catalog</h2>
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search by SKU, barcode, title..."
            />
          </div>

          {/* Category Chips Scroller */}
          <div className="pos-category-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="pos-products-grid" style={{ marginTop: '20px' }}>
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '40px 0' }}>
              <Card>
                <CardBody className="flex-center text-muted" style={{ minHeight: '160px' }}>
                  <p>No products match your search/category filters.</p>
                </CardBody>
              </Card>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isOutOfStock = product.currentStock === 0;
              const isLowStock = product.currentStock <= product.minStock && !isOutOfStock;

              return (
                <Card
                  key={product.sku}
                  className={`pos-product-card ${isOutOfStock ? 'out-of-stock-card' : ''}`}
                  onClick={() => !isOutOfStock && addToCart(product)}
                >
                  <CardBody className="pos-product-card-body flex-between" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px' }}>
                    <div style={{ width: '100%' }}>
                      <div className="flex-between">
                        <span className="text-xs text-muted font-semibold">{product.sku}</span>
                        {isOutOfStock ? (
                          <Badge variant="danger" style={{ fontSize: '9px', padding: '1px 5px' }}>OUT OF STOCK</Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning" style={{ fontSize: '9px', padding: '1px 5px' }}>LOW STOCK</Badge>
                        ) : (
                          <Badge variant="success" style={{ fontSize: '9px', padding: '1px 5px' }}>OK</Badge>
                        )}
                      </div>

                      <h4 className="font-semibold text-neutral-800" style={{ fontSize: '13.5px', marginTop: '6px', minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.title}
                      </h4>
                    </div>

                    <div className="flex-between" style={{ width: '100%', marginTop: '12px' }}>
                      <span className="font-bold text-neutral-900" style={{ fontSize: '15px' }}>₹{product.sellingPrice}</span>
                      <span className={`text-xs ${isOutOfStock ? 'text-danger font-bold' : isLowStock ? 'text-warning font-semibold' : 'text-muted'}`}>
                        {isOutOfStock ? '0 units' : `${product.currentStock} left`}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CURRENT CART */}
      <div className="pos-cart-column">
        <Card className="pos-cart-card">
          <CardHeader className="flex-between" style={{ flexDirection: 'row', padding: '16px 20px', borderBottom: '1px solid var(--neutral-200)' }}>
            <div className="flex-center" style={{ gap: '8px' }}>
              <ShoppingCart size={18} className="text-primary" />
              <CardTitle>Current Order</CardTitle>
            </div>
            <Badge variant="primary">{cart.reduce((acc, i) => acc + i.quantity, 0)} Items</Badge>
          </CardHeader>

          <CardBody className="pos-cart-body" style={{ padding: 0 }}>
            {cart.length === 0 ? (
              <div className="flex-center text-muted" style={{ height: '240px', flexDirection: 'column', gap: '8px', padding: '24px' }}>
                <ShoppingCart size={40} style={{ opacity: 0.3 }} />
                <p style={{ fontSize: '13px' }}>Billing cart is empty.</p>
                <p style={{ fontSize: '12px', textAlign: 'center' }}>Click products on the left panel to populate the customer cart.</p>
              </div>
            ) : (
              <div className="pos-cart-items-list">
                {cart.map((item) => (
                  <div key={item.sku} className="pos-cart-item-row flex-between">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '60%' }}>
                      <span className="font-semibold text-neutral-800 text-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
                      <span className="text-xs text-muted">SKU: {item.sku} • ₹{item.sellingPrice}/ea</span>
                    </div>

                    <div className="flex-center" style={{ gap: '12px' }}>
                      {/* Quantity Toggles */}
                      <div className="cart-qty-toggle flex-center">
                        <button type="button" onClick={() => updateQuantity(item.sku, -1)} className="cart-qty-btn">
                          <Minus size={12} />
                        </button>
                        <span className="cart-qty-val font-semibold">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.sku, 1)} className="cart-qty-btn">
                          <Plus size={12} />
                        </button>
                      </div>

                      <div style={{ width: '60px', textAlign: 'right' }}>
                        <span className="font-bold text-neutral-800" style={{ fontSize: '13.5px' }}>₹{item.sellingPrice * item.quantity}</span>
                      </div>

                      <button type="button" onClick={() => removeFromCart(item.sku, item.title)} className="cart-remove-btn" aria-label="Remove item">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>

          {/* Checkout calculations */}
          <CardFooter className="pos-cart-footer" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '20px', gap: '16px', backgroundColor: 'var(--neutral-50)' }}>

            {/* Discount Inputs */}
            <div className="flex-between">
              <span className="text-sm text-neutral-600 font-medium">Flat Discount (₹)</span>
              <div style={{ width: '100px' }}>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Math.min(subtotal, Number(e.target.value) || 0)))}
                  className="form-input"
                  style={{ padding: '6px 10px', height: '32px', textAlign: 'right', fontSize: '13px' }}
                  disabled={cart.length === 0}
                />
              </div>
            </div>

            {/* Invoicing summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div className="flex-between text-muted">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex-between text-danger font-medium">
                  <span>Store Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex-between" style={{ fontSize: '12px', color: 'var(--neutral-600)', backgroundColor: 'var(--neutral-100)', padding: '6px 10px', borderRadius: 'var(--border-radius-sm)', margin: '2px 0' }}>
                <span className="font-medium">{gstBreakdown.rateLabel}</span>
                <span className="font-semibold text-neutral-700">₹{gstBreakdown.inclusiveTax} <span className="text-xs text-muted" style={{ fontWeight: 'normal' }}>(Included)</span></span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--neutral-200)', margin: '4px 0' }} />
              <div className="flex-between font-bold" style={{ fontSize: '16px', color: 'var(--neutral-800)' }}>
                <span>Grand Total</span>
                <span className="text-primary" style={{ fontSize: '18px' }}>₹{grandTotal}</span>
              </div>
              <p className="text-xs text-muted" style={{ textAlign: 'right', marginTop: '-4px', fontSize: '11px' }}>
                *All selling prices are inclusive of GST
              </p>
            </div>

            {/* Payment Method Cards Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              <span className="text-xs font-bold text-muted" style={{ letterSpacing: '0.05em' }}>PAYMENT METHOD</span>
              <div className="payment-options-grid">
                {['UPI', 'Cash', 'Card'].map(method => (
                  <button
                    key={method}
                    type="button"
                    className={`payment-option-btn ${paymentMethod === method ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(method)}
                    disabled={cart.length === 0}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <Button
              variant="primary"
              size="lg"
              className="pos-checkout-btn"
              disabled={cart.length === 0 || completing}
              loading={completing}
              onClick={handleCompleteSale}
              style={{ marginTop: '8px' }}
            >
              Complete Sale
            </Button>
          </CardFooter>
        </Card>
      </div>

    </div>
  );
};

export default NewSale;
