// Memoized Admin Dashboard for better performance
import React from 'react';
import AdminDashboard from '@/pages/admin/Dashboard';

export const AdminDashboardMemo = React.memo(AdminDashboard, (prevProps, nextProps) => {
  // Custom comparison - re-render only if meaningful props change
  // Since AdminDashboard has no props, it will only re-render on parent component updates
  return true;
});

AdminDashboardMemo.displayName = 'AdminDashboardMemo';

export default AdminDashboardMemo;
