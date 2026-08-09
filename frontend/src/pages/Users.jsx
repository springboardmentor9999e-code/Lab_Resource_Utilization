import { Save, Search, ShieldAlert } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { ROLES } from '../auth/permissions.js';
import { displayName, formatRole } from '../auth/session.js';
import { getApiErrorMessage } from '../services/apiError.js';
import { getUsers, updateUserRole } from '../services/userService.js';
import { formatDateTime } from '../utils/display.js';

const availableRoles = [
  ROLES.STUDENT,
  ROLES.LAB_ASSISTANT,
  ROLES.ASSISTANT_PROFESSOR,
  ROLES.PROFESSOR,
  ROLES.HOD,
  ROLES.SYSTEM_ADMIN,
];

function userName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Unknown user';
}

function isCurrentUser(user, currentUser) {
  if (!user || !currentUser) {
    return false;
  }

  if (user.id != null && currentUser.id != null) {
    return String(user.id) === String(currentUser.id);
  }

  return Boolean(user.email && currentUser.email && user.email === currentUser.email);
}

export default function Users() {
  const { currentUser, searchQuery } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [roleDrafts, setRoleDrafts] = useState({});
  const [localQuery, setLocalQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);
  const [pageError, setPageError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const refreshUsers = useCallback(async () => {
    const userData = await getUsers();

    setUsers(userData);
    setRoleDrafts(
      userData.reduce((drafts, user) => {
        drafts[user.id] = user.role ?? '';
        return drafts;
      }, {}),
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setIsLoading(true);
      setPageError('');

      try {
        await refreshUsers();
      } catch (requestError) {
        if (isMounted) {
          setPageError(getApiErrorMessage(requestError, 'Unable to load users.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [refreshUsers]);

  const visibleUsers = useMemo(() => {
    const pageQuery = localQuery.trim().toLowerCase();
    const globalQuery = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const searchableText = [
        user.id,
        user.firstName,
        user.lastName,
        user.email,
        user.role,
        formatRole(user.role),
        user.createdAt,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!pageQuery || searchableText.includes(pageQuery)) &&
        (!globalQuery || searchableText.includes(globalQuery))
      );
    });
  }, [localQuery, searchQuery, users]);

  function updateRoleDraft(userId, role) {
    setActionError('');
    setActionMessage('');
    setRoleDrafts((current) => ({ ...current, [userId]: role }));
  }

  async function saveRole(user) {
    const nextRole = roleDrafts[user.id];

    if (!nextRole || nextRole === user.role || isCurrentUser(user, currentUser)) {
      return;
    }

    setSavingUserId(user.id);
    setActionError('');
    setActionMessage('');

    try {
      const updatedUser = await updateUserRole(user.id, nextRole);

      setUsers((current) =>
        current.map((item) => (String(item.id) === String(updatedUser.id) ? updatedUser : item)),
      );
      setRoleDrafts((current) => ({ ...current, [updatedUser.id]: updatedUser.role ?? '' }));
      setActionMessage(`${userName(updatedUser)} role updated to ${formatRole(updatedUser.role)}.`);
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'Unable to update user role.'));
    } finally {
      setSavingUserId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Loading users...
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
        {pageError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Users</h3>
            <p className="mt-1 text-sm text-slate-500">
              Manage system roles for registered lab resource users.
            </p>
          </div>

          <label className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <span className="sr-only">Search users</span>
            <input
              className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm"
              onChange={(event) => setLocalQuery(event.target.value)}
              placeholder="Search users"
              type="search"
              value={localQuery}
            />
          </label>
        </div>

        {actionMessage ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {actionMessage}
          </p>
        ) : null}

        {actionError ? (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            {actionError}
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {visibleUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Current Role</th>
                  <th className="px-5 py-3 font-semibold">Created At</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleUsers.map((user) => {
                  const isSelf = isCurrentUser(user, currentUser);
                  const draftRole = roleDrafts[user.id] ?? user.role ?? '';
                  const hasChanged = draftRole !== user.role;
                  const isSaving = savingUserId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">{userName(user)}</p>
                        {isSelf ? (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Signed in as {displayName(currentUser)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{user.email}</td>
                      <td className="px-5 py-4">
                        <label className="block min-w-56">
                          <span className="sr-only">Role for {userName(user)}</span>
                          <select
                            className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                            disabled={isSelf || isSaving}
                            onChange={(event) => updateRoleDraft(user.id, event.target.value)}
                            value={draftRole}
                          >
                            {availableRoles.map((role) => (
                              <option key={role} value={role}>
                                {formatRole(role)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {user.createdAt ? formatDateTime(user.createdAt) : 'Not available'}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                          disabled={isSelf || !hasChanged || isSaving || Boolean(savingUserId)}
                          onClick={() => saveRole(user)}
                          type="button"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? 'Saving' : 'Save'}
                        </button>
                        {isSelf ? (
                          <p className="mt-2 text-xs font-medium text-slate-400">Own role locked</p>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">
            No users match the current search.
          </div>
        )}
      </section>
    </div>
  );
}
