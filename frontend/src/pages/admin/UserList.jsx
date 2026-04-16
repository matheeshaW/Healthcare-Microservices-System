/**
 * User List Page
 * Display and manage all system users
 */

 import { useContext, useEffect, useMemo, useState } from "react";
 import { Card, Spinner, Badge, Modal, Button } from "../../components/ui";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

export const UserList = () => {
  const { user: currentUser } = useContext(AuthContext);
  const currentUserId = currentUser?._id || currentUser?.id || "";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingUser, setDeletingUser] = useState(false);

  useEffect(() => {
    void fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await API.get("/admin/users");
      setUsers(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = user?.name || "";
      const email = user?.email || "";
      const matchSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = filterRole === "all" || user.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, filterRole]);

  const getRoleBadgeVariant = (role) => {
    if (role === "doctor") return "specialization";
    if (role === "admin") return "danger";
    return "default";
  };

  const canDeleteUser = (targetUser) => {
    if (!targetUser) return false;
    if (!currentUserId) return false;
    if (targetUser.role === "admin") return false;
    return targetUser._id !== currentUserId;
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
    setIsDeleteOpen(false);
    setDeleteConfirmText("");
    setDeleteError("");
  };

  const handleAskDelete = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(false);
    setIsDeleteOpen(true);
    setDeleteConfirmText("");
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    if (!canDeleteUser(selectedUser)) {
      setDeleteError("You cannot delete this account from the admin panel.");
      return;
    }

    if (deleteConfirmText !== "DELETE") {
      setDeleteError("Type DELETE exactly to confirm deletion.");
      return;
    }

    try {
      setDeletingUser(true);
      await API.delete(`/admin/users/${selectedUser._id}`);
      setIsDeleteOpen(false);
      setIsDetailsOpen(false);
      setSelectedUser(null);
      setDeleteConfirmText("");
      setDeleteError("");
      await fetchUsers();
    } catch (err) {
      setDeleteError(err?.response?.data?.message || "Failed to delete user account");
    } finally {
      setDeletingUser(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">User Management</h1>
        <p className="text-slate-600">View and manage all system users</p>
      </div>

      {error && (
        <Card padding="md" className="bg-red-50 border border-red-200">
          <p className="text-red-700 font-semibold">{error}</p>
        </Card>
      )}

      {loading && (
        <Card padding="lg" className="text-center">
          <Spinner size="lg" variant="primary" label="Loading users..." />
        </Card>
      )}

      {!loading && (
        <Card padding="md" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search Users</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              >
                <option value="all">All Roles</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {!loading && (
        <Card padding="md" className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Users ({filteredUsers.length})</h2>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{user.name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-600 text-sm">{user.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-600 text-sm">{user.phone || "N/A"}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-600 text-sm">{formatDate(user.createdAt)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative z-10 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="pointer-events-auto"
                            onClick={() => handleViewDetails(user)}
                          >
                            View Details
                          </Button>
                          {canDeleteUser(user) && (
                            <Button
                              type="button"
                              size="sm"
                              variant="danger"
                              className="pointer-events-auto"
                              onClick={() => handleAskDelete(user)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {isDetailsOpen && selectedUser && (
        <Modal isOpen={isDetailsOpen} size="md" onClose={() => setIsDetailsOpen(false)} title="User Details">
          <div className="space-y-3 py-2">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Name</p>
              <p className="text-slate-900 font-semibold">{selectedUser.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Email</p>
              <p className="text-slate-900">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Phone</p>
              <p className="text-slate-900">{selectedUser.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Role</p>
              <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Created At</p>
              <p className="text-slate-900">{formatDate(selectedUser.createdAt)}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="ghost" fullWidth onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            {canDeleteUser(selectedUser) && (
              <Button
                type="button"
                variant="danger"
                fullWidth
                onClick={() => handleAskDelete(selectedUser)}
              >
                Delete User
              </Button>
            )}
          </div>
        </Modal>
      )}

      {isDeleteOpen && selectedUser && (
        <Modal isOpen={isDeleteOpen} size="md" onClose={() => setIsDeleteOpen(false)} title="Confirm User Deletion">
          <div className="space-y-4">
            <Card border shadow="sm" className="border-red-200 bg-red-50">
              <p className="text-sm text-red-700">
                This will permanently delete <span className="font-semibold">{selectedUser.name}</span>'s account.
                {selectedUser.role === "patient" ? " Related patient profile and reports will also be removed." : ""}
              </p>
            </Card>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Type DELETE to confirm</label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  setDeleteError("");
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            {deleteError && <p className="text-sm text-red-600 font-semibold">{deleteError}</p>}

            <div className="flex flex-col gap-3 sm:flex-row justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleConfirmDelete} loading={deletingUser}>
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserList;
