import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  RefreshCcw, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { useToast } from '../../context/ToastContext';
import { suppliersService } from '../../services/suppliers.service';

const Suppliers = () => {
  const { addToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch suppliers from backend
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await suppliersService.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      addToast(err.message || 'Failed to load suppliers', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone || '',
      address: supplier.address || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingSupplier) {
        await suppliersService.updateSupplier(editingSupplier.id, formData);
        addToast(`Supplier "${formData.name}" updated successfully`, 'success');
      } else {
        await suppliersService.createSupplier(formData);
        addToast(`Supplier "${formData.name}" linked successfully`, 'success');
      }
      handleCloseModal();
      fetchSuppliers();
    } catch (err) {
      setFormError(err.message || 'Failed to save supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (supplierId, supplierName) => {
    if (!window.confirm(`Are you sure you want to deactivate supplier "${supplierName}"?`)) return;

    try {
      await suppliersService.deleteSupplier(supplierId);
      addToast(`Supplier "${supplierName}" deactivated`, 'info');
      fetchSuppliers();
    } catch (err) {
      addToast(err.message || 'Failed to delete supplier', 'danger');
    }
  };

  // Filtered suppliers by search term
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="suppliers-page">
      {/* Top Header */}
      <div className="page-header flex-between flex-wrap" style={{ gap: '16px' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--neutral-900)' }}>My Suppliers</h1>
          <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
            Manage wholesalers and distributors linked to your shopkeeper profile
          </p>
        </div>

        <Button 
          variant="primary" 
          icon={<Plus size={16} />} 
          onClick={handleOpenAddModal}
        >
          Add New Supplier
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginTop: '24px', padding: '16px 20px', backgroundColor: '#ffffff' }}>
        <div className="flex-between flex-wrap" style={{ gap: '16px' }}>
          <div className="navbar-search-wrapper" style={{ minWidth: '280px', maxWidth: '400px' }}>
            <Search size={16} className="navbar-search-icon" />
            <input 
              type="text" 
              placeholder="Search suppliers by name, email, address..." 
              className="navbar-search-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-center text-sm text-muted" style={{ gap: '8px' }}>
            <span>Total Suppliers: <strong>{suppliers.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ marginTop: '24px' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--neutral-500)' }}>
            Loading shopkeeper suppliers...
          </div>
        ) : filteredSuppliers.length > 0 ? (
          <div className="grid-cols-auto" style={{ gap: '20px' }}>
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardHeader>
                  <div className="flex-between">
                    <div className="flex-center" style={{ gap: '10px' }}>
                      <div className="kpi-icon-wrapper bg-primary-light text-primary flex-center" style={{ width: '40px', height: '40px', borderRadius: '8px' }}>
                        <Truck size={20} />
                      </div>
                      <div>
                        <CardTitle style={{ fontSize: '16px' }}>{supplier.name}</CardTitle>
                        <CardDescription style={{ fontSize: '12px' }}>ID: {supplier.id.slice(0, 8)}...</CardDescription>
                      </div>
                    </div>
                    <Badge variant={supplier.isActive ? 'success' : 'neutral'}>
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardBody style={{ paddingTop: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--neutral-700)', margin: '12px 0 18px' }}>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                      <Mail size={15} className="text-muted" />
                      <a href={`mailto:${supplier.email}`} className="text-primary font-medium" style={{ textDecoration: 'none' }}>
                        {supplier.email}
                      </a>
                    </div>
                    
                    {supplier.phone && (
                      <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                        <Phone size={15} className="text-muted" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}

                    {supplier.address && (
                      <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                        <MapPin size={15} className="text-muted" />
                        <span className="text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {supplier.address}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Supplier Statistics */}
                  <div className="flex-between" style={{ padding: '10px 14px', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--border-radius-md)', fontSize: '12px', marginTop: 'auto' }}>
                    <div className="flex-center" style={{ gap: '6px' }}>
                      <Package size={14} className="text-primary" />
                      <span><strong>{supplier.productsSupplied || 0}</strong> Products</span>
                    </div>
                    <div className="flex-center" style={{ gap: '6px' }}>
                      <RefreshCcw size={14} className="text-warning" />
                      <span><strong>{supplier.activeOrders || 0}</strong> Active Restocks</span>
                    </div>
                  </div>
                </CardBody>

                {/* Card Action Footer */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--neutral-100)', display: 'flex', justifyContent: 'flex-end', gap: '8px', backgroundColor: '#fafafa' }}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={<Edit3 size={14} />} 
                    onClick={() => handleOpenEditModal(supplier)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={<Trash2 size={14} />} 
                    style={{ color: 'var(--danger)' }}
                    onClick={() => handleDelete(supplier.id, supplier.name)}
                  >
                    Deactivate
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardBody className="flex-center" style={{ padding: '60px 20px', flexDirection: 'column', textAlign: 'center' }}>
              <Truck size={48} className="text-muted" style={{ marginBottom: '16px', opacity: 0.4 }} />
              <h3 className="font-semibold text-neutral-800" style={{ fontSize: '18px', marginBottom: '6px' }}>
                No Suppliers Found
              </h3>
              <p className="text-muted text-sm" style={{ maxWidth: '400px', marginBottom: '20px' }}>
                {searchTerm 
                  ? `No suppliers match "${searchTerm}". Try clearing your search filter.`
                  : 'You have not added any suppliers to your store directory yet. Link your wholesale suppliers to send restock orders.'
                }
              </p>
              {!searchTerm && (
                <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAddModal}>
                  Add Your First Supplier
                </Button>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--border-radius-lg, 12px)',
            width: '100%',
            maxWidth: '480px',
            boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
            overflow: 'hidden'
          }}>
            <div className="flex-between" style={{ padding: '16px 24px', borderBottom: '1px solid var(--neutral-200)', backgroundColor: '#fafafa' }}>
              <h3 className="font-bold text-neutral-900" style={{ fontSize: '16px' }}>
                {editingSupplier ? 'Edit Supplier Details' : 'Link New Supplier'}
              </h3>
              <button 
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-500)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {formError && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  color: '#991b1b',
                  fontSize: '13px',
                  marginBottom: '16px'
                }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input 
                  label="Supplier / Wholesale Business Name"
                  type="text"
                  placeholder="e.g. Gujarat FMCG Supply"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input 
                  label="Contact Email Address"
                  type="email"
                  placeholder="e.g. orders@fmcgsupply.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <Input 
                  label="Phone Number"
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '6px' }}>
                    Warehouse / Business Address
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="e.g. Plot 45, GIDC Industrial Estate, Rajkot"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--neutral-300)',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div className="flex-between" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--neutral-100)' }}>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  {editingSupplier ? 'Save Changes' : 'Link Supplier'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
