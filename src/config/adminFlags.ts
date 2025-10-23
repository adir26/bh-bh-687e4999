export const LAUNCH_MODE = import.meta.env.VITE_ADMIN_LAUNCH_MODE === 'true';

export const ENABLED_ADMIN_ROUTES = LAUNCH_MODE
  ? [
      '/admin/login',
      '/admin/dashboard',
      '/admin/analytics',
      '/admin/customers',
      '/admin/suppliers',
      '/admin/categories',
      '/admin/homepage-content'
    ]
  : 'ALL';

export const ADMIN_REALTIME_ENABLED = !LAUNCH_MODE;
