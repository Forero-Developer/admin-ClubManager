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
    newClubsYtd: number;
    deltaPreviousMonth: number;
    mrr: number;
    arpu: number;
    revenueThisMonth: number;
    revenuePreviousMonth: number;
    revenueYtd: number;
    conversionRate: number;
    churnRate: number;
    totalPlayers: number;
    newPlayersThisMonth: number;
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
