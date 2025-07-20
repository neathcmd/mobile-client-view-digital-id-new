import axios from "@/lib/api/request";
import { IUser, CardItem } from "@/types/user-type";
import type { FormValues } from "@/components/update-user-dialog";
export const userRequest = () => {
  const PROFILE = async (): Promise<IUser> => {
    return await axios({
      url: "/user/me",
      method: "GET",
    });
  };

  const GET_CARDS = async (): Promise<{ cards: CardItem[] }> => {
    return await axios({
      url: "/card/get-cards?is_deleted=false",
      method: "GET",
      withCredentials: true,
    });
  };

  const UPDATE_USER = async (payload: FormValues): Promise<IUser> => {
    return await axios({
      url: "/user/update-profile",
      method: "PUT",
      data: payload,
    });
  };

  return {
    GET_CARDS,
    PROFILE,
    UPDATE_USER,
  };
};
