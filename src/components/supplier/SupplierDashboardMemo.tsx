// Memoized Supplier Dashboard for better performance
import React from 'react';
import SupplierDashboard from '@/pages/supplier/Dashboard';

export const SupplierDashboardMemo = React.memo(SupplierDashboard, (prevProps, nextProps) => {
  // Custom comparison - re-render only if meaningful props change
  // Since SupplierDashboard has no props, it will only re-render on parent component updates
  return true;
});

SupplierDashboardMemo.displayName = 'SupplierDashboardMemo';

export default SupplierDashboardMemo;
