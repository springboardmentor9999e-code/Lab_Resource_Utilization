import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
});

api.interceptors.request.use(
    (config) => {

        // Don't send token while logging in or registering
        if (
            config.url === "/auth/login" ||
            config.url === "/auth/register"
        ) {
            return config;
        }

        const token = localStorage.getItem("token");

        console.log("API Request:", config.url);
        console.log("Token exists:", !!token);
        console.log("Role:", localStorage.getItem("role"));

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,

    (error) => {

        if (error.response) {

            if (error.response.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("fullName");
                localStorage.removeItem("role");

                alert("Your session has expired. Please login again.");

                window.location.href = "/";
            }

            if (error.response.status === 403) {

                alert("You are not authorized to access this page.");

            }
        }

        return Promise.reject(error);
    }
);

export default api;