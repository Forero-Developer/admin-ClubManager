export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface AdminProfile {
  id: string;
  email: string;
  role: string;
  createdAt?: string;
  lastLogin?: string;
}
