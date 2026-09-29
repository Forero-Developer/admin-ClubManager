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
  paymentProfileStatus?: string;
  /** Clubes propios / de prueba: all, exclude (clientes reales) u only. */
  internal?: 'all' | 'exclude' | 'only';
  /** Clubes de torneos: all, only (solo de torneos) o exclude (sin torneos). */
  tournament?: 'all' | 'exclude' | 'only';
}

export interface ClubPaymentProfile {
  status: 'PENDING' | 'AVAILABLE' | 'DECLINED';
  paymentMethodType: 'CARD' | 'NEQUI' | 'PSE' | null;
  cardBrand: string | null;
  cardLastFour: string | null;
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
  /** Club propio / de prueba: sus pagos no cuentan como ingresos de clientes. */
  isInternal?: boolean;
  /** Club que se registró para participar en torneos. */
  isTournamentClub?: boolean;
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
  city: { name: string; department: { name: string } } | null;
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
  /** Correo con el que se registró el club (admin principal). */
  registeredEmail?: string | null;
  authProvider?: 'GOOGLE' | 'EMAIL' | null;
  owner?: ClubMember | null;
  admins?: ClubMember[];
  members?: ClubMember[];
  usersCount?: number;
}

/** Club al que pertenece un usuario (un usuario puede tener varios). */
export interface MemberClub {
  id: string;
  name: string;
  logoUrl: string | null;
  status: string;
  billingStatus: string;
  role: string;
  membershipStatus: string;
  linkedAt: string;
}

export interface ClubMember {
  id: string;
  email: string;
  googleId: string | null;
  authProvider: 'GOOGLE' | 'EMAIL';
  status: string;
  createdAt: string;
  deletedAt: string | null;
  membershipId: string;
  role: string;
  membershipStatus: string;
  linkedAt: string;
  clubs: MemberClub[];
  clubsCount: number;
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
  isTournamentClub?: boolean;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  billingCycleEnd?: string | null;
  /** Hasta cuándo conserva acceso si está en gracia (PAST_DUE). */
  gracePeriodEndsAt?: string | null;
  playerMonthlyFee: number;
  paymentDueDay: number;
  paymentProfile: ClubPaymentProfile | null;
  nextChargeDate: string | null;
  lastChargeAt: string | null;
  currentBaseAmount: number | null;
  currentAddonAmount: number | null;
  billablePlayersCount?: number;
  totalPlayersCount?: number;
  playerStats?: ClubPlayerStats;
  whatsappMonthlyLimit?: number;
  wallets?: Array<{ balance: number }>;
  addOns: Array<{
    id: string;
    addOnId?: string;
    status: string;
    quantity: number;
    startDate: string;
    expiresAt: string | null;
    addOn: { id?: string; name: string; code: string };
    paymentDetails?: AddOnPaymentDetail[];
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

export interface AddOnPaymentDetail {
  id: string;
  amount: number;
  description: string | null;
  periodStart: string | null;
  saasPayment?: { status: string } | null;
}

/** Entrada del historial de planes / renovaciones del club. */
export interface ClubPlanHistoryItem {
  id: string;
  changedAt: string;
  reason: string | null;
  toPrice: { price: number; currency: string; plan: { name: string } } | null;
  saasPayments?: Array<{ amount: number; notes: string | null }>;
}
