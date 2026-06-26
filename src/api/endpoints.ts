export const ENDPOINTS = {
  auth: {
    login: '/admin/auth/login',
    profile: '/admin/auth/profile',
    refresh: '/admin/auth/refresh',
  },
  dashboard: {
    stats: '/admin/dashboard/stats',
  },
  clubs: {
    list: '/admin/clubs',
    byId: (id: string) => `/admin/clubs/${id}`,
  },
  players: {
    list: (clubId: string) => `/admin/clubs/${clubId}/players`,
    byId: (clubId: string, playerId: string) => `/admin/clubs/${clubId}/players/${playerId}`,
  },
  subscriptions: {
    overview: '/admin/subscriptions/overview',
    list: '/admin/subscriptions',
    stats: '/admin/subscriptions/stats',
    clubsWithPlans: '/admin/subscriptions/clubs-with-plans',
    payments: '/admin/subscriptions/payments',
    clubPayments: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/payments`,
    planHistory: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/plan-history`,
    migratePlan: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/migrate-plan`,
    registerPayment: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/register-payment`,
    assignTrial: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/assign-trial`,
    extendSubscription: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/extend-subscription`,
    updateDates: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/dates`,
    downgradeToFree: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/downgrade-to-free`,
    cancelSubscription: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/cancel`,
    plans: {
      list: '/admin/subscriptions/plans',
      create: '/admin/subscriptions/plans',
      update: (id: string) => `/admin/subscriptions/plans/${id}`,
      features: '/admin/subscriptions/features',
    },
  },
};
