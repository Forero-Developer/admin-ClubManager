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
    list: '/admin/subscriptions',
    clubsWithPlans: '/admin/subscriptions/clubs-with-plans',
    payments: '/admin/subscriptions/payments',
    clubPayments: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/payments`,
    planHistory: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/plan-history`,
    migratePlan: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/migrate-plan`,
    assignTrial: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/assign-trial`,
    extendSubscription: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/extend-subscription`,
    updateDates: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/dates`,
    downgradeToFree: (clubId: string) => `/admin/subscriptions/clubs/${clubId}/downgrade-to-free`,
    plans: {
      list: '/admin/subscriptions/plans',
      create: '/admin/subscriptions/plans',
      update: (id: string) => `/admin/subscriptions/plans/${id}`,
      features: '/admin/subscriptions/features',
    },
  },
};
