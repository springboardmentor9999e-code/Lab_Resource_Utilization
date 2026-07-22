// Mirrors the Final Role-Operation Matrix. This is a UI-layer convenience only —
// it decides what to *show*, not what's allowed. The backend's @PreAuthorize
// checks remain the source of truth; hiding a button here just avoids showing
// the user an action the API would reject anyway.

export const ROLES = {
  STUDENT: "STUDENT",
  RESEARCHER: "RESEARCHER",
  LAB_TECHNICIAN: "LAB_TECHNICIAN",
  LAB_MANAGER: "LAB_MANAGER",
  DEPARTMENT_HEAD: "DEPARTMENT_HEAD",
  INSTITUTION_ADMINISTRATOR: "INSTITUTION_ADMINISTRATOR",
  SYSTEM_ADMINISTRATOR: "SYSTEM_ADMINISTRATOR",
};

const SELF_SERVICE_ROLES = [ROLES.STUDENT, ROLES.RESEARCHER];
const STAFF_ROLES = [
  ROLES.LAB_TECHNICIAN,
  ROLES.LAB_MANAGER,
  ROLES.DEPARTMENT_HEAD,
  ROLES.INSTITUTION_ADMINISTRATOR,
  ROLES.SYSTEM_ADMINISTRATOR,
];

export function isSelfServiceRole(role) {
  return SELF_SERVICE_ROLES.includes(role);
}

export function can(role, action) {
  switch (action) {
    case "equipment:create":
    case "equipment:fullEdit":
    case "equipment:delete":
      return [ROLES.LAB_MANAGER, ROLES.INSTITUTION_ADMINISTRATOR, ROLES.SYSTEM_ADMINISTRATOR].includes(role);
    case "equipment:updateStatus":
      return [
        ROLES.LAB_TECHNICIAN,
        ROLES.LAB_MANAGER,
        ROLES.INSTITUTION_ADMINISTRATOR,
        ROLES.SYSTEM_ADMINISTRATOR,
      ].includes(role);
    case "bookings:approve":
      return [
        ROLES.LAB_TECHNICIAN,
        ROLES.LAB_MANAGER,
        ROLES.DEPARTMENT_HEAD,
        ROLES.INSTITUTION_ADMINISTRATOR,
        ROLES.SYSTEM_ADMINISTRATOR,
      ].includes(role);
    case "bookings:viewAll":
      return STAFF_ROLES.includes(role);
    case "maintenance:manage":
      return [
        ROLES.LAB_TECHNICIAN,
        ROLES.LAB_MANAGER,
        ROLES.INSTITUTION_ADMINISTRATOR,
        ROLES.SYSTEM_ADMINISTRATOR,
      ].includes(role);
    case "sharing:approve":
      return [
        ROLES.LAB_MANAGER,
        ROLES.DEPARTMENT_HEAD,
        ROLES.INSTITUTION_ADMINISTRATOR,
        ROLES.SYSTEM_ADMINISTRATOR,
      ].includes(role);
    case "sharing:create":
      return [
        ROLES.STUDENT,
        ROLES.RESEARCHER,
        ROLES.LAB_MANAGER,
        ROLES.INSTITUTION_ADMINISTRATOR,
        ROLES.SYSTEM_ADMINISTRATOR,
      ].includes(role);
    // Full user management (create/edit/delete any user). DEPARTMENT_HEAD is
    // deliberately excluded here - they get read-only visibility into their own
    // institution's users via "users:viewOwnInstitution" instead.
    case "users:manage":
      return [ROLES.INSTITUTION_ADMINISTRATOR, ROLES.SYSTEM_ADMINISTRATOR].includes(role);
    case "users:viewOwnInstitution":
      return role === ROLES.DEPARTMENT_HEAD;
    case "institutions:manage":
      return [ROLES.INSTITUTION_ADMINISTRATOR, ROLES.SYSTEM_ADMINISTRATOR].includes(role);
    // Full lab CRUD including delete/reassigning institution.
    case "labs:manage":
      return [ROLES.INSTITUTION_ADMINISTRATOR, ROLES.SYSTEM_ADMINISTRATOR].includes(role);
    // LAB_MANAGER may create/edit labs within their own institution (backend
    // enforces the institution scoping; this just controls button visibility).
    case "labs:manageOwnInstitution":
      return [ROLES.LAB_MANAGER, ROLES.INSTITUTION_ADMINISTRATOR, ROLES.SYSTEM_ADMINISTRATOR].includes(role);
    case "roleRequests:review":
      return [ROLES.INSTITUTION_ADMINISTRATOR, ROLES.SYSTEM_ADMINISTRATOR].includes(role);
    case "utilization:heatmap":
      return [
        ROLES.LAB_TECHNICIAN,
        ROLES.LAB_MANAGER,
        ROLES.DEPARTMENT_HEAD,
        ROLES.INSTITUTION_ADMINISTRATOR,
        ROLES.SYSTEM_ADMINISTRATOR,
      ].includes(role);
    case "utilization:idle":
      return [
        ROLES.LAB_MANAGER,
        ROLES.DEPARTMENT_HEAD,
        ROLES.INSTITUTION_ADMINISTRATOR,
        ROLES.SYSTEM_ADMINISTRATOR,
      ].includes(role);
    default:
      return false;
  }
}

export function roleLabel(role) {
  const labels = {
    STUDENT: "Student",
    RESEARCHER: "Researcher",
    LAB_TECHNICIAN: "Lab Technician",
    LAB_MANAGER: "Lab Manager",
    DEPARTMENT_HEAD: "Department Head",
    INSTITUTION_ADMINISTRATOR: "Institution Administrator",
    SYSTEM_ADMINISTRATOR: "System Administrator",
  };
  return labels[role] || role;
}
