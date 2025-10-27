export interface Role {
  id: string;
  name: string;
  readOnly: boolean;
  claimCount: number;
}

export interface DashboardConfig {
  defaultDateRange: string;
  widgets: string[];
}

export interface User {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  dialcode: string;
  phoneNumber: string;
  emailId: string;
  profileDp: string;
  profileDpId: string;
  createdAt: Date;
  roles: Role[];
  themeStyle: string;
  dashboardConfig: DashboardConfig;
}

export function isUserInstance(user: any): user is User {
  return user && typeof user === 'object' && 'id' in user;
}


export interface TokenResponse {
  token: string;
  tokenExpiredAt: Date;
  refreshToken: string;
  refreshTokenExpiredAt: Date;
}

export function isTokenInstance(token: any): token is TokenResponse {
  return (
    token &&
    typeof token === 'object' &&
    'token' in token &&
    'refreshToken' in token
  );
}
