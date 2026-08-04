export const getRole = () => localStorage.getItem("role");

export const getUserId = () =>
    Number(localStorage.getItem("userId"));

export const getFullName = () =>
    localStorage.getItem("fullName");

export const isStudent = () =>
    getRole() === "STUDENT";

export const isFaculty = () =>
    getRole() === "FACULTY";

export const isLabAssistant = () =>
    getRole() === "LAB_ASSISTANT";

export const isDepartmentHead = () =>
    getRole() === "DEPARTMENT_HEAD";

export const isInstituteAdmin = () =>
    getRole() === "INSTITUTE_ADMIN";

export const isSystemAdmin = () =>
    getRole() === "SYSTEM_ADMIN";

export const getInstitutionId = () => {
    return localStorage.getItem("institutionId");
};