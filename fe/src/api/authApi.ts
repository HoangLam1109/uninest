import authorizedAxiosInstance from "@/utils/authorizedAxios"
import { API_ROOT } from "@/utils/constants";


export const handleLogoutAPI = async () =>{
  return await authorizedAxiosInstance.post(`${API_ROOT}/api/logout`)
}

export const refreshTokenAPI = async()=>{
    return await authorizedAxiosInstance.post(
       `${API_ROOT}/api/refresh-token`
    )
}

export const loginAPI = async (data: {
  email: string
  password: string
}) => {
  return await authorizedAxiosInstance.post(`${API_ROOT}/api/login`, data)
}

export const registerAPI = async (data: {
  email: string
  fullName: string
  phone: string
  password: string
}) => {
  return await authorizedAxiosInstance.post(`${API_ROOT}/api/register`, data)
}