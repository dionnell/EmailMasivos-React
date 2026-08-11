export const ENDPOINTS = {
  auth: {
    login:       '/auth/login',
    checkStatus: '/auth/check-status',
    users:       '/auth/users',
    createUser:  '/auth/register',
    updateUser:  (id: string) => `/auth/users/${id}`,
    deleteUser:  (id: string) => `/auth/users/${id}`,
  },
  campaigns: {
    list:   '/campaigns',
    create: '/campaigns',
    detail: (id: string) => `/campaigns/${id}`,
    update: (id: string) => `/campaigns/${id}`,
    delete: (id: string) => `/campaigns/${id}`,
    send:   (id: string) => `/campaigns/${id}/send`,
    logs:   (id: string) => `/campaigns/${id}/logs`,
  },
  recipients: {
    list:      '/recipients',
    create:    '/recipients',
    import:    '/recipients/import',
    deleteAll: '/recipients',
    update:    (id: string) => `/recipients/${id}`,
    delete:    (id: string) => `/recipients/${id}`,
  },
  templates: {
    list:   '/templates',
    create: '/templates',
    update: (id: string) => `/templates/${id}`,
    delete: (id: string) => `/templates/${id}`,
  },
  dashboard: {
    metrics: '/dashboard/metrics',
  },
  mail: {
    status: '/mail/status',
  },
} as const