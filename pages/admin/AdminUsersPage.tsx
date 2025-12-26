
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import UserFormModal from '../../components/admin/UserFormModal';
import { User } from '../../types';

const AdminUsersPage: React.FC = () => {
  const { users, deleteUser, addUser } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleDelete = (email: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user "${name}" (${email})? This action cannot be undone.`)) {
        deleteUser(email);
    }
  }

  const handleCreateUser = async (userData: { name: string; email: string; pass: string; role: User['role'] }) => {
    try {
        await addUser(userData);
        setModalOpen(false);
    } catch (error: any) {
        alert(`Error: ${error.message}`);
    }
  }

  return (
    <div>
      {isModalOpen && <UserFormModal onClose={() => setModalOpen(false)} onSubmit={handleCreateUser} />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-main">Manage Users</h1>
        <button onClick={() => setModalOpen(true)} className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:brightness-110 transform hover:scale-105">
          Create User
        </button>
      </div>

      <GlassmorphicCard>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-text-muted">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.email} className="border-b border-gray-800 hover:bg-surface/50">
                  <td className="p-4 text-text-main font-medium">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${user.role === 'SUPER_ADMIN' ? 'text-yellow-400 bg-yellow-900/50 border-yellow-600/50' : user.role === 'VENDOR' ? 'text-cyan-400 bg-cyan-900/50 border-cyan-600/50' : 'text-text-secondary bg-gray-700/50 border-gray-600/50'}`}>
                        {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.email !== 'admin@vexokart.com' ? (
                        <button onClick={() => handleDelete(user.email, user.name)} className="text-red-400 font-semibold py-1 px-3 rounded-md hover:bg-red-500/20">Delete</button>
                    ) : (
                        <span className="text-text-muted text-xs">Cannot delete</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center p-8 text-text-muted">No users found.</p>}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminUsersPage;