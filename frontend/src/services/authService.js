import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

const login = async (loginData) => {

    const response = await axios.post(
        API_URL + "/login",
        loginData
    );

    if (response.data.token) {

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("email", response.data.email);
        localStorage.setItem("userId", response.data.userId);

    }

    return response.data;
};

const register = async (userData) => {

    return await axios.post(
        API_URL + "/register",
        userData
    );

};

const logout = () => {

    localStorage.clear();

};

const getToken = () => {

    return localStorage.getItem("token");

};

const getRole = () => {

    return localStorage.getItem("role");

};

const isLoggedIn = () => {

    return localStorage.getItem("token") !== null;

};

const AuthService = {
    login,
    register,
    logout,
    getToken,
    getRole,
    isLoggedIn
};

export default AuthService;