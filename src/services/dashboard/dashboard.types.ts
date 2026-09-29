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
    /** MRR esperado (moneda principal): plan + packs según deportistas actuales. */
    mrr: number;
    mrrCurrency?: string;
    mrrByCurrency?: Array<{ currency: string; mrr: number; clubs: number; arpu: number }>;
    /** Clubes al día que generan MRR. */
    payingClubs?: number;
    /** MRR de clubes en gracia (PAST_DUE): venció su mes y aún no pagan. */
    mrrAtRisk?: number;
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
  /** Clubes propios / de prueba: fuera de todas las métricas de arriba. */
  internal?: {
    clubs: number;
    mrr: number;
    revenueThisMonth: number;
    paymentsThisMonth: number;
    revenueAllTime: number;
    paymentsAllTime: number;
  };
  alerts: {
    /** Clubes en gracia (PAST_DUE). */
    pastDueClubs: number;
    suspendedClubs?: number;
    trialsEndingSoon: number;
    pendingSaasPayments: number;
  };
}

/** Club en el detalle de MRR (GET admin/dashboard/mrr-clubs). Montos mensuales. */
export interface MrrClub {
  id: string;
  name: string;
  currency: string;
  interval: string;
  planName: string | null;
  baseAmount: number;
  addonAmount: number;
  total: number;
  /** Lo que se cobra en su próximo ciclo. */
  periodAmount: number;
  billablePlayers: number;
  maxPlayers: number | null;
  playerPacks: { current: number; expected: number };
  email: string | null;
  isGoogleAuth: boolean;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
  limit: number;
}
