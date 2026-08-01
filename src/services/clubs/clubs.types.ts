export interface ClubListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED';
  countryCode?: string;
  sportId?: string;
  minPlayers?: number;
  maxPlayers?: number;
  orderByPlayers?: 'asc' | 'desc';
  mpStatus?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
  limit: number;
}

export interface ClubListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  logoUrl: string | null;
  status: string;
  billingStatus: string;
  countryCode: string;
  createdAt: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  trialEndsAt: string | null;
  billingMethod: string;
  country: { name: string; code: string; currency: string };
  sport: { name: string; code: string } | null;
  subscriptionPrice: {
    id: string;
    price: number;
    currency: string;
    interval: string;
    discount?: number;
    plan: { id: string; name: string };
  } | null;
  _count: {
    players: number;
    coaches: number;
    users: number;
  };
  totalPlayersCount?: number;
  activePlayersCount?: number;
  suspendedPlayersCount?: number;
  billablePlayersCount?: number;
  playerStats?: ClubPlayerStats;
  users: Array<{
    email: string;
    googleId: string | null;
  }>;
}

export interface ClubPlayerStats {
  total: number;
  billable: number;
  active: number;
  suspended: number;
  inactive: number;
  droppedOut: number;
  pending: number;
  rejected: number;
}

export interface ClubDetail extends ClubListItem {
  address: string | null;
  description: string | null;
  playerMonthlyFee: number;
  paymentDueDay: number;
  mpSubscriptionId: string | null;
  mpStatus: string | null;
  nextChargeDate: string | null;
  lastChargeAt: string | null;
  currentBaseAmount: number | null;
  currentAddonAmount: number | null;
  billablePlayersCount?: number;
  totalPlayersCount?: number;
  playerStats?: ClubPlayerStats;
  addOns: Array<{
    id: string;
    status: string;
    quantity: number;
    startDate: string;
    expiresAt: string | null;
    addOn: { name: string; code: string };
  }>;
  planHistory: Array<{
    id: string;
    changedAt: string;
    reason: string | null;
    toPrice: {
      price: number;
      currency: string;
      plan: { name: string };
    };
  }>;
}
