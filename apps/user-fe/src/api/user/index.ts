import { IEditUserInfo } from "@repo/common/types";
import axios from "axios";

export const fetchUserInfo = async () => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/info`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data.user;
};

export const EditUserInfo = async (userData: IEditUserInfo) : Promise<any> => {
  const res = await axios.put(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/edit`,
    userData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data;
};
