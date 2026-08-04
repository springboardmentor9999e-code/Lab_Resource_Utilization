import axiosInstance from "../utils/axiosInstance";

const login = async (email, password) => {
  const response = await axiosInstance.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

const authService = {
  login,
};

export default authService;