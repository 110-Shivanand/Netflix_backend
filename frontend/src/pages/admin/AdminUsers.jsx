import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { FaUserSlash, FaUserCheck, FaTrash } from "react-icons/fa";
import "./Admin.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?skip=${(page - 1) * 20}&limit=20`);
      setUsers(res.data);
    } catch {}
    setLoading(false);
  };

  const toggleActive = async (userId, isActive) => {
    try {
      await api.put(`/users/${userId}/toggle-active`);
      toast.success(`User ${isActive ? "deactivated" : "activated"}`);
      load();
    } catch {
      toast.error("Failed to update user");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted");
      load();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-netflix-dark pt-24 pb-16 px-6 md:px-12">
      <h1 className="text-white text-3xl font-bold mb-8">Manage Users</h1>
      {loading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-800 hover:bg-gray-900 text-gray-300">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{user.username}</p>
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.is_admin ? "bg-red-900 text-red-300" : "bg-gray-700 text-gray-300"}`}>
                      {user.is_admin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${user.is_verified ? "text-green-400" : "text-yellow-500"}`}>
                      {user.is_verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${user.is_active ? "text-green-400" : "text-red-400"}`}>
                      {user.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleActive(user.id, user.is_active)}
                        className={`${user.is_active ? "text-yellow-500 hover:text-yellow-400" : "text-green-500 hover:text-green-400"}`}
                        title={user.is_active ? "Deactivate" : "Activate"}
                      >
                        {user.is_active ? <FaUserSlash /> : <FaUserCheck />}
                      </button>
                      {!user.is_admin && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-500 hover:text-red-400"
                          title="Delete user"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-center gap-4 mt-8">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-40 hover:bg-gray-600">Prev</button>
        <span className="text-gray-400 text-sm">Page {page}</span>
        <button disabled={users.length < 20} onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-40 hover:bg-gray-600">Next</button>
      </div>
    </div>
  );
}
