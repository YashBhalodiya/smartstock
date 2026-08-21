import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Power, 
  PowerOff,
  FolderTree
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/States';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

const Categories = () => {
  const { addToast } = useToast();
  const { 
    categories, 
    products,
    addCategory, 
    updateCategory, 
    toggleCategoryStatus,
    refreshCategories
  } = useStore();

  useEffect(() => {
    if (typeof refreshCategories === 'function') refreshCategories();
  }, [refreshCategories]);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // Status Toggle Confirm Dialog State
  const [confirmToggleId, setConfirmToggleId] = useState(null);

  const handleOpenAdd = () => {
    setFormMode('add');
    setEditingId(null);
    setCategoryName('');
    setCategoryError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category) => {
    setFormMode('edit');
    setEditingId(category.id);
    setCategoryName(category.name);
    setCategoryError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setCategoryError('');

    if (!categoryName.trim()) {
      setCategoryError('Category department name is required');
      addToast('Validation error: category name is blank.', 'error');
      return;
    }

    const categoryExists = categories.some(
      c => c.name.toLowerCase() === categoryName.trim().toLowerCase() && c.id !== editingId
    );

    if (categoryExists) {
      setCategoryError('This category department already exists in records.');
      addToast('Category name already exists.', 'error');
      return;
    }

    try {
      if (formMode === 'add') {
        await addCategory(categoryName.trim());
        addToast('New category department saved to database!', 'success');
      } else {
        await updateCategory(editingId, { name: categoryName.trim() });
        addToast('Category name updated successfully!', 'success');
      }

      setIsFormOpen(false);
    } catch (err) {
      addToast(err.message || 'Failed to save category', 'danger');
    }
  };

  const handleToggleConfirm = (id) => {
    setConfirmToggleId(id);
  };

  const handleStatusToggle = () => {
    if (confirmToggleId) {
      toggleCategoryStatus(confirmToggleId);
      addToast('Category status successfully toggled.', 'success');
      setConfirmToggleId(null);
    }
  };

  return (
    <div className="categories-page">
      <div className="page-header flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted text-sm">Organize products into distinct department classifications</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="No Category Departments Found"
          description="Create your first product department folder to organize inventory items."
          actionLabel="Add Category"
          onAction={handleOpenAdd}
        />
      ) : (
        <Card>
          <CardBody style={{ padding: 0 }}>
            <Table>
              <Thead>
                <Tr>
                  <Th>Category ID</Th>
                  <Th>Department Name</Th>
                  <Th>Total Products Count</Th>
                  <Th>Created Date</Th>
                  <Th>Status</Th>
                  <Th align="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.map((category, index) => {
                  const status = category.status || (category.isActive === false ? 'Inactive' : 'Active');
                  const isInactive = status === 'Inactive';

                  // Calculate formatted clean Category ID (CAT-101 style)
                  const displayId = category.displayId || (category.id && category.id.startsWith('CAT-') ? category.id : `CAT-${101 + index}`);
                  
                  // Calculate dynamic product count for this category
                  const productCount = products && Array.isArray(products)
                    ? products.filter(p => p.category && p.category.toLowerCase() === category.name.toLowerCase()).length
                    : (Number(category.count) || 0);

                  // Calculate formatted created date
                  const displayDate = category.createdDate || (category.createdAt 
                    ? new Date(category.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Aug 20, 2026');

                  return (
                    <Tr key={category.id || index} style={isInactive ? { opacity: 0.6 } : {}}>
                      <Td><span className="font-mono text-sm font-semibold text-neutral-800">{displayId}</span></Td>
                      <Td><span className="font-semibold text-neutral-800">{category.name}</span></Td>
                      <Td><span className="font-semibold text-neutral-700">{productCount} {productCount === 1 ? 'item' : 'items'}</span></Td>
                      <Td className="text-muted">{displayDate}</Td>
                      <Td>
                        <Badge variant={isInactive ? 'neutral' : 'success'}>
                          {status}
                        </Badge>
                      </Td>
                      <Td align="right">
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            style={{ padding: '6px' }}
                            onClick={() => handleOpenEdit(category)}
                          >
                            <Edit3 size={15} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            style={{ padding: '6px', color: isInactive ? 'var(--success)' : 'var(--danger)' }}
                            onClick={() => handleToggleConfirm(category.id)}
                          >
                            {isInactive ? <Power size={15} /> : <PowerOff size={15} />}
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* ADD / EDIT CATEGORY MODAL FORM */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === 'add' ? 'Add New Category' : `Edit Category Department`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleFormSubmit}>
              {formMode === 'add' ? 'Save Category' : 'Update Name'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit}>
          <Input
            id="categoryName"
            label="Department Name"
            value={categoryName}
            onChange={(e) => { setCategoryName(e.target.value); setCategoryError(''); }}
            placeholder="e.g. FMCG Goods, Beverages"
            error={categoryError}
            required
            autoFocus
          />
        </form>
      </Modal>

      {/* STATUS TOGGLE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={confirmToggleId !== null}
        onClose={() => setConfirmToggleId(null)}
        onConfirm={handleStatusToggle}
        title="Toggle Category Status?"
        message="Deactivating this category classification department will flag it as inactive. Current items remain untouched."
        type="warning"
        confirmText="Toggle Status"
      />

    </div>
  );
};

export default Categories;
