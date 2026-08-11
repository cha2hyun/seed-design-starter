export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export interface Session {
  user: SessionUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}
