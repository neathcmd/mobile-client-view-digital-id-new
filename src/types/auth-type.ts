export interface IAuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    existUser: {
      roles: string[];
    };
  };
}

export type AuthLoginType = {
  email?: string;
  user_name?: string;
  password: string;
};

export type AuthRegisterType = {
  email: string;
  user_name: string;
  full_name: string;
  password: string;
  device_name?: string;
  device_type?: string;
  os?: string;
  ip_address?: string;
  browser?: string;
};
