// Central RBAC permission matrix for the Equipment Inventory module.
// Mirrors backend @PreAuthorize rules in EquipmentController.java — keep both in sync.

export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  INSTITUTION_ADMIN: 'INSTITUTION_ADMIN',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  LAB_MANAGER: 'LAB_MANAGER',
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',
  RESEARCHER: 'RESEARCHER',
  STUDENT: 'STUDENT',
};

// Legacy role names (pre 7-role migration) mapped to new ones
const LEGACY_MAP = {
  ADMIN: 'SYSTEM_ADMIN',
  HOD: 'DEPARTMENT_HEAD',
  TECHNICIAN: 'LAB_TECHNICIAN',
};

export const normalizeRole = (role) => {
  const upper = (role || 'STUDENT').toUpperCase();
  return LEGACY_MAP[upper] || upper;
};

const PERMISSIONS = {
  addEquipment: ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_HEAD', 'LAB_MANAGER', 'LAB_TECHNICIAN'],
  editEquipment: ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_HEAD', 'LAB_MANAGER', 'LAB_TECHNICIAN'],
  deleteEquipment: ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_HEAD', 'LAB_MANAGER'],
  changeStatus: ['SYSTEM_ADMIN', 'LAB_MANAGER', 'LAB_TECHNICIAN'],
  uploadImages: ['SYSTEM_ADMIN', 'LAB_TECHNICIAN'],
  uploadDocuments: ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'LAB_TECHNICIAN'],
  viewEquipment: ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_HEAD', 'LAB_MANAGER', 'LAB_TECHNICIAN', 'RESEARCHER', 'STUDENT'],
  // Category/tag curation rewrites every asset filed under a term, so it sits
  // above the normal equipment-edit permission (see EquipmentController).
  manageCategories: ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_HEAD'],
  // User & role administration (see UserController @PreAuthorize)
  manageUsers: ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'],
};

export const can = (user, action) => {
  const allowed = PERMISSIONS[action];
  if (!allowed) return false;
  const roles = (user?.roles && user.roles.length ? user.roles : [user?.role]).filter(Boolean);
  return roles.map(normalizeRole).some((r) => allowed.includes(r));
};

export const getPrimaryRole = (user) => {
  const roles = (user?.roles && user.roles.length ? user.roles : [user?.role]).filter(Boolean);
  return normalizeRole(roles[0] || 'STUDENT');
};
