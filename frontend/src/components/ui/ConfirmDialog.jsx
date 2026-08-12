import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, HelpCircle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'primary', // 'primary' | 'danger' | 'warning' | 'success'
  loading = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <div className="confirm-icon bg-danger-light text-danger"><AlertTriangle size={24} /></div>;
      case 'warning':
        return <div className="confirm-icon bg-warning-light text-warning"><AlertTriangle size={24} /></div>;
      default:
        return <div className="confirm-icon bg-primary-light text-primary"><HelpCircle size={24} /></div>;
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>
      <Button 
        variant={type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'primary'}
        onClick={onConfirm} 
        loading={loading}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
    >
      <div className="confirm-dialog-content">
        {getIcon()}
        <p className="confirm-dialog-message">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
export { ConfirmDialog };
