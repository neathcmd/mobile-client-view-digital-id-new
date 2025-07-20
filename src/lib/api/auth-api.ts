import type {
  IAuthResponse,
  AuthRegisterType,
  AuthLoginType,
} from "@/types/auth-type";
import axios from "@/lib/api/request";

export const authRequest = () => {
  const AUTH_LOGIN = async (payload: AuthLoginType): Promise<IAuthResponse> => {
    return await axios({
      url: "/auth/login",
      method: "POST",
      data: payload,
    });
  };

  const AUTH_REGISTER = async (payload: AuthRegisterType) => {
    return await axios({
      url: "/auth/register",
      method: "POST",
      data: payload,
    });
  };

  const AUTH_LOGOUT = async () => {
    return await axios({
      url: "/auth/logout",
      method: "POST",
    });
  };

  return {
    AUTH_LOGIN,
    AUTH_REGISTER,
    AUTH_LOGOUT,
  };
};
