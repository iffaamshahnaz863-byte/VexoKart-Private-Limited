
import React, { useState } from 'react';
import { User } from '../../types';

interface UserFormModalProps {
  onClose: () => void;
  onSubmit: (userData: { name: string; email: string; pass: string; role: User['role'] }) => Promise<void>;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<User['role']>('USER');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
        setError("All fields are required.");
        return;
    }
     if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    await onSubmit({ name, email, pass: password, role });
  };
  
  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-gray-600 rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-surface rounded-lg shadow-2xl w-full max-w-md p-6 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-text-main mb-4">Create New User</h2>
        {error && <p className="bg-red-500/20 text-red-400 text-sm p-3 rounded-md mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="name">Full Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClasses} />
          </div>
           <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="role">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value as User['role'])} className={inputClasses}>
                <option value="USER">User</option>
                <option value="VENDOR">Vendor</option>
                <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500/50">Cancel</button>
            <button type="submit" className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:brightness-110">Create User</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;