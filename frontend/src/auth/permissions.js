export const ROLES = {
  STUDENT: 'ROLE_STUDENT',
  LAB_ASSISTANT: 'ROLE_LAB_ASSISTANT',
  ASSISTANT_PROFESSOR: 'ROLE_ASSISTANT_PROFESSOR',
  PROFESSOR: 'ROLE_PROFESSOR',
  HOD: 'ROLE_HOD',
  SYSTEM_ADMIN: 'ROLE_SYSTEM_ADMIN',
};

const ROUTE_ACCESS = [
  { path: '/', roles: [ROLES.HOD, ROLES.SYSTEM_ADMIN] },
  {
    path: '/equipment',
    roles: [
      ROLES.STUDENT,
      ROLES.LAB_ASSISTANT,
      ROLES.ASSISTANT_PROFESSOR,
      ROLES.PROFESSOR,
      ROLES.HOD,
      ROLES.SYSTEM_ADMIN,
    ],
  },
  {
    path: '/bookings',
    roles: [
      ROLES.STUDENT,
      ROLES.LAB_ASSISTANT,
      ROLES.ASSISTANT_PROFESSOR,
      ROLES.PROFESSOR,
      ROLES.HOD,
      ROLES.SYSTEM_ADMIN,
    ],
  },
  { path: '/maintenance', roles: [ROLES.LAB_ASSISTANT, ROLES.HOD, ROLES.SYSTEM_ADMIN] },
  { path: '/analytics', roles: [ROLES.HOD, ROLES.SYSTEM_ADMIN] },
  { path: '/users', roles: [ROLES.SYSTEM_ADMIN] },
];

function roleOf(userOrRole) {
  return typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
}

function hasRole(userOrRole, roles) {
  return roles.includes(roleOf(userOrRole));
}

export function canAccessPath(userOrRole, path) {
  const route = ROUTE_ACCESS.find((item) => item.path === path);
  return route ? hasRole(userOrRole, route.roles) : false;
}

export function getFirstPermittedPath(userOrRole) {
  return ROUTE_ACCESS.find((route) => canAccessPath(userOrRole, route.path))?.path ?? '/login';
}

export function resolvePermittedPath(userOrRole, requestedPath) {
  return canAccessPath(userOrRole, requestedPath) ? requestedPath : getFirstPermittedPath(userOrRole);
}

export function canCreateBooking(userOrRole) {
  return hasRole(userOrRole, [
    ROLES.STUDENT,
    ROLES.ASSISTANT_PROFESSOR,
    ROLES.PROFESSOR,
    ROLES.SYSTEM_ADMIN,
  ]);
}

export function canViewAllBookings(userOrRole) {
  return hasRole(userOrRole, [ROLES.LAB_ASSISTANT, ROLES.HOD, ROLES.SYSTEM_ADMIN]);
}

export function canApproveOrRejectBookings(userOrRole) {
  return hasRole(userOrRole, [ROLES.LAB_ASSISTANT, ROLES.SYSTEM_ADMIN]);
}

export function canCancelBooking(booking, user) {
  if (!['PENDING', 'APPROVED'].includes(booking?.status)) {
    return false;
  }

  if (hasRole(user, [ROLES.LAB_ASSISTANT, ROLES.SYSTEM_ADMIN])) {
    return true;
  }

  return hasRole(user, [ROLES.STUDENT, ROLES.ASSISTANT_PROFESSOR, ROLES.PROFESSOR]) &&
    booking?.userId === user?.id;
}

export function canManageEquipment(userOrRole) {
  return hasRole(userOrRole, [ROLES.SYSTEM_ADMIN]);
}

export function canViewMaintenance(userOrRole) {
  return hasRole(userOrRole, [ROLES.LAB_ASSISTANT, ROLES.HOD, ROLES.SYSTEM_ADMIN]);
}

export function canManageMaintenance(userOrRole) {
  return hasRole(userOrRole, [ROLES.LAB_ASSISTANT, ROLES.SYSTEM_ADMIN]);
}

export function canViewAnalytics(userOrRole) {
  return hasRole(userOrRole, [ROLES.HOD, ROLES.SYSTEM_ADMIN]);
}

export function canManageUsers(userOrRole) {
  return hasRole(userOrRole, [ROLES.SYSTEM_ADMIN]);
}
