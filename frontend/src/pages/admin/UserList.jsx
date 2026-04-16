/**
 * User List Page
 * Display and manage all system users
 */

import { useEffect, useState } from "react";
import { Card, Spinner, Button, Badge, Modal } from "../../components/ui";
import API from "../../api/axios";

export const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === "all" || user.role === filterRole;
    return matchSearch && matchRole;
  });

  const getRoleBadgeVariant = (role) => {
    if (role === "doctor") return "specialization";
    if (role === "admin") return "danger";
    return "default";
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
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
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          User Management
        </h1>
        <p className="text-slate-600">View and manage all system users</p>
      </div>

      {/* Error Message */}
      {error && (
        <Card padding="md" className="bg-red-50 border border-red-200">
          <p className="text-red-700 font-semibold">{error}</p>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card padding="lg" className="text-center">
          <Spinner size="lg" variant="primary" label="Loading users..." />
        </Card>
      )}

      {/* Filters and Search */}
      {!loading && (
        <Card padding="md" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filter by Role
              </label>
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

      {/* Users Table */}
      {!loading && (
        <Card padding="md" className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Users ({filteredUsers.length})
          </h2>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Joined
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition"
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">
                          {user.name}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-600 text-sm">{user.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-600 text-sm">
                          {formatDate(user.createdAt)}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="px-3 py-1.5 text-sm font-semibold text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <Modal size="md" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">User Details</h2>

            <div className="space-y-3 py-4">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Name
                </p>
                <p className="text-slate-900 font-semibold">
                  {selectedUser.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Email
                </p>
                <p className="text-slate-900">{selectedUser.email}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Role
                </p>
                <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                  {selectedUser.role.charAt(0).toUpperCase() +
                    selectedUser.role.slice(1)}
                </Badge>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  User ID
                </p>
                <p className="text-slate-900 text-sm font-mono">
                  {selectedUser._id}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Joined Date
                </p>
                <p className="text-slate-900">
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>
            </div>

            <div>
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-200 text-slate-900 font-semibold hover:bg-slate-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserList;
