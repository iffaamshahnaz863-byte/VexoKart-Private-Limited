
import React, { useState } from 'react';

interface UserFormModalProps {
  onClose: () => void;
  onSubmit: (userData: { name: string; email: string; pass: string; role: 'USER' | 'ADMIN' }) => Promise<void>;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-navy-light rounded-lg shadow-2xl w-full max-w-md p-6 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">Create New User</h2>
        {error && <p className="bg-red-500/20 text-red-400 text-sm p-3 rounded-md mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300" htmlFor="name">Full Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 input-style" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300" htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mt-1 input-style" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300" htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full mt-1 input-style" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300" htmlFor="role">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value as 'USER' | 'ADMIN')} className="w-full mt-1 input-style">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500/50">Cancel</button>
            <button type="submit" className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600">Create User</button>
          </div>
        </form>
      </div>
       <style>{`
          .input-style {
            background-color: #1f2937;
            color: white;
            border: 1px solid #4b5563;
            border-radius: 0.5rem;
            padding: 0.75rem;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .input-style:focus {
            outline: none;
            border-color: #2dd4bf;
            box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.5);
          }
        `}</style>
    </div>
  );
};

export default UserFormModal;
