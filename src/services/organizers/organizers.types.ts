import type { PaginatedResult } from '../clubs/clubs.types';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface OrganizerListItem {
  id: string;
  email: string;
  phone: string | null;
  status: AccountStatus;
  createdAt: string;
  companyName: string | null;
  logoUrl: string | null;
  contactPhone: string | null;
  countryCode: string | null;
  city: string | null;
  sport: string | null;
  tournamentsCount: number;
  clubsCount: number;
}

export interface OrganizerTournament {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  createdAt: string;
  invitedClubs: number;
}

export interface OrganizerDetail extends OrganizerListItem {
  clubs: { id: string; name: string; role: string }[];
  tournaments: OrganizerTournament[];
  deleteImpact: {
    tournaments: number;
    teams: number;
    matches: number;
    /** Con clubes se conserva la cuenta y solo se quita lo de organizador */
    keepsAccount: boolean;
  };
}

export interface OrganizerListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: AccountStatus;
}

export type OrganizersPage = PaginatedResult<OrganizerListItem>;
