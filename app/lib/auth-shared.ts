export type AuthUser = {
  id: string;
  email: string;
  role: string;
  dev?: boolean;
};

export type AuthTenant = {
  id: string;
  slug: string;
  name: string;
};

export type AuthSession = {
  user: AuthUser;
  tenant: AuthTenant;
};
