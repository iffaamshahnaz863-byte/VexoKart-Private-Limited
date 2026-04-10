
import React, { useState, useEffect } from 'react';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import UserFormModal from '../../components/admin/UserFormModal';
import { User } from '../../types';
import { supabase } from '../../supabase';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUsers = async () => {
    setIsRefreshing(true);
    const { data, error } = await supabase.from('users').select('*');
    if (data) setUsers(data);
    if (error) console.error("Error fetching users:", error);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (email: string, name: string) => {
    alert("User deletion must be handled via a secure backend function for security reasons. This action is disabled on the client.");
  }

  const handleCreateUser = async (userData: any) => {
    alert("User creation must be handled via a secure backend function to protect the Supabase admin key. This action is disabled on the client.");
    setModalOpen(false);
  }

  return (
    <div>
      {isModalOpen && <UserFormModal onClose={() => setModalOpen(false)} onSubmit={handleCreateUser} />}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">Platform Users</h1>
            <p className="text-text-muted mt-1 text-sm">Manage customers, vendors, and internal staff access.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchUsers} 
            disabled={isRefreshing}
            className="p-3 bg-surface border border-border text-text-secondary rounded-xl hover:text-accent transition-all disabled:opacity-50"
            title="Force Sync from DB"
          >
            <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M22 3A10.03 10.03 0 0112 20a9.93 9.93 0 01-7-3m7 5a10 10 0 01-10-10 9.93 9.93 0 013-7" />
            </svg>
          </button>
          <button onClick={() => setModalOpen(true)} className="bg-accent text-white font-black uppercase tracking-widest text-[10px] py-3 px-6 rounded-xl shadow-xl shadow-accent/20 hover:-translate-y-1 active:translate-y-0 transition-all">
            Register User
          </button>
        </div>
      </div>

      <GlassmorphicCard>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted text-[10px] font-black uppercase tracking-widest">
                <th className="p-6">Identity</th>
                <th className="p-6">Contact Info</th>
                <th className="p-6">Access Role</th>
                <th className="p-6 text-right">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(user => (
                <tr key={user.email} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FF8A00&color=fff`} className="w-8 h-8 rounded-full" />
                        <span className="text-text-main font-bold">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-6">
                      <p className="text-text-secondary font-medium">{user.email}</p>
                      <p className="text-[10px] text-text-muted font-bold mt-1 uppercase">{user.phone || 'No phone'}</p>
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                        user.role === 'admin' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 
                        user.role === 'vendor' ? 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' : 
                        'text-text-secondary bg-surface border-border'
                    }`}>
                        {user.role}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    {user.email !== 'admin@darcyclehub.com' ? (
                        <button onClick={() => handleDelete(user.email, user.name)} className="text-red-400 font-black uppercase text-[10px] hover:underline">Revoke Access</button>
                    ) : (
                        <span className="text-text-muted text-[10px] font-bold italic uppercase">Root Account</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-20 text-center text-text-muted italic font-bold">No active user records found.</div>
          )}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminUsersPage;
