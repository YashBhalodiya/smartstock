import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import Button from './Button';

// Loading Skeleton / Spinner State
export const LoadingState = ({ 
  message = 'Loading data...', 
  variant = 'spinner' // 'spinner' | 'skeleton'
}) => {
  if (variant === 'skeleton') {
    return (
      <div className="skeleton-container" aria-busy="true">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-half" />
      </div>
    );
  }

  return (
    <div className="loading-state-wrapper" aria-busy="true">
      <Loader2 className="loading-state-spinner text-primary" size={40} />
      <p className="loading-state-text">{message}</p>
    </div>
  );
};

// Empty Results State
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is no data to display right now.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="empty-state-wrapper">
      <div className="empty-state-icon-container">
        <Icon size={40} className="empty-state-icon" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="empty-state-btn">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// Error Failure State
export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading the data. Please try again.',
  retryLabel = 'Try Again',
  onRetry,
}) => {
  return (
    <div className="error-state-wrapper" role="alert">
      <div className="error-state-icon-container">
        <AlertCircle size={40} className="error-state-icon" />
      </div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-description">{message}</p>
      {onRetry && (
        <Button variant="danger" onClick={onRetry} className="error-state-btn">
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
