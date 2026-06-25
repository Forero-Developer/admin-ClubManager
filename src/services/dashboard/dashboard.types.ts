export interface DistributionItem {
  name: string;
  value: number;
}

export interface DashboardStats {
  kpis: {
    totalClubsByStatus: {
      TRIAL: number;
      ACTIVE: number;
      PAST_DUE: number;
      SUSPENDED: number;
    };
    newClubsThisMonth: number;
    deltaPreviousMonth: number;
    mrr: number;
    revenueThisMonth: number;
    revenuePreviousMonth: number;
    conversionRate: number;
    churnRate: number;
  };
  distributions: {
    byCountry: DistributionItem[];
    byPlan: DistributionItem[];
    byBillingMethod: DistributionItem[];
    bySport: DistributionItem[];
  };
  alerts: {
    pastDueClubs: number;
    trialsEndingSoon: number;
    pendingSaasPayments: number;
  };
}
