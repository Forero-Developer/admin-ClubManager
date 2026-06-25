export interface PlayerListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'INACTIVE' | 'SUSPENDED' | 'DROPPED_OUT' | 'DELETED';
  categoryId?: string;
}

export interface PlayerListItem {
  id: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  photoUrl: string;
  status: string;
  sponsored: boolean;
  createdAt: string;
  category: { id: string; name: string };
  club: { id: string; name: string };
}

export interface PlayerDetail extends PlayerListItem {
  address: string;
  neighborhood: string;
  school: string;
  grade: string;
  eps: string;
  bloodType: string;
  weight: number | null;
  guardian1Name: string;
  guardian1Relation: string;
  guardian1Occupation: string;
  guardian2Name: string | null;
  guardian2Relation: string | null;
  guardian2Occupation: string | null;
  phone1Prefix: string;
  phone1: string;
  phone2Prefix: string | null;
  phone2: string | null;
  documents: Array<{
    id: string;
    type: string;
    fileUrl: string;
    createdAt: string;
  }>;
  _count: {
    attendances: number;
    payments: number;
  };
}
