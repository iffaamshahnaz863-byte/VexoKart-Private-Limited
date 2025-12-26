
import React, { useState } from 'react';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useAdminCodes } from '../../context/AdminCodeContext';
import { AdminCode } from '../../types';
import GenerateCodeModal from '../../components/admin/GenerateCodeModal';

const getStatusPill = (status: AdminCode['status'], expiresAt: string | null) => {
    const isExpired = expiresAt && new Date(expiresAt) < new Date();
    if (status === 'unused' && isExpired) {
        return { pillClass: 'text-gray-400 bg-gray-700/50 border-gray-600/50', text: 'Expired' };
    }
    switch(status) {
        case 'unused': return { pillClass: 'text-green-400 bg-green-900/50 border-green-600/50', text: 'Unused' };
        case 'used': return { pillClass: 'text-cyan-400 bg-cyan-900/50 border-cyan-600/50', text: 'Used' };
        case 'revoked': return { pillClass: 'text-red-400 bg-red-900/50 border-red-600/50', text: 'Revoked' };
        default: return { pillClass: '', text: ''};
    }
}

const AdminCodesPage: React.FC = () => {
  const { adminCodes, revokeCode } = useAdminCodes();
  const [isModalOpen, setModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <div>
      {isModalOpen && <GenerateCodeModal onClose={() => setModalOpen(false)} />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-main">Admin Codes</h1>
        <button onClick={() => setModalOpen(true)} className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:brightness-110 transform hover:scale-105">
          Generate New Code
        </button>
      </div>
       <GlassmorphicCard>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-text-muted">
                <th className="p-4 font-semibold">Code</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Usage</th>
                <th className="p-4 font-semibold">Created</th>
                <th className="p-4 font-semibold">Expires</th>
                <th className="p-4 font-semibold">Used By</th>
                <th className="p-4 font-semibold">Note</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminCodes.map(code => {
                  const { pillClass, text } = getStatusPill(code.status, code.expiresAt);
                  return (
                    <tr key={code.id} className="border-b border-gray-800 hover:bg-surface/50">
                    <td className="p-4 text-text-main font-mono">{code.code}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold border ${pillClass}`}>{text}</span></td>
                    <td className="p-4 text-center">{code.usageCount} / {code.maxUsage}</td>
                    <td className="p-4">{new Date(code.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">{code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'Never'}</td>
                    <td className="p-4">{code.usedBy || 'N/A'}</td>
                    <td className="p-4 text-xs">{code.note || '-'}</td>
                    <td className="p-4 space-x-2">
                        <button onClick={() => handleCopy(code.code)} className="text-accent font-semibold py-1 px-3 rounded-md hover:bg-accent/20">
                           {copiedCode === code.code ? 'Copied!' : 'Copy'}
                        </button>
                        {code.status === 'unused' && <button onClick={() => revokeCode(code.id)} className="text-red-400 font-semibold py-1 px-3 rounded-md hover:bg-red-500/20">Revoke</button>}
                    </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
          {adminCodes.length === 0 && <p className="text-center p-8 text-text-muted">No admin codes have been generated yet.</p>}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminCodesPage;