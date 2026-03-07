'use client';

import { useEffect, useState } from 'react';
import { User, Mail, ShoppingBag, Calendar, Clock, Search } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  order_count: number;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      
      setUsers(data.users || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
    }
    
    setLoading(false);
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--cookd-orange)]/20 border-t-[var(--cookd-orange)] rounded-full animate-spin" />
          <div className="text-[var(--text-muted)] font-medium">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-10 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <div className="text-red-500 font-bold mb-4 flex flex-col items-center gap-2">
            <span className="text-4xl">⚠️</span>
            {error}
          </div>
          <button 
            onClick={fetchUsers}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-[var(--text-primary)] mb-2">Users</h1>
          <p className="text-[var(--text-secondary)]">
            Explore your community of {users.length} registered creator{users.length !== 1 ? 's' : ''}.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:max-w-md group">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--cookd-orange)] transition-colors" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-[var(--border-light)] rounded-2xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] focus:ring-4 focus:ring-[var(--cookd-orange)]/5 transition-all font-medium shadow-sm"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="bg-white border border-[var(--border-light)] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--surface-cream)] border-b border-[var(--border-light)]">
                <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  User
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Email
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Activity
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Joined
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Last Sign In
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <User className="text-[var(--border-medium)]" size={40} />
                      <p className="text-[var(--text-muted)] font-medium">
                        {searchTerm ? 'No users found matching your search.' : 'No users yet.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--surface-cream)]/50 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--surface-cream)] border border-[var(--border-light)] overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover:border-[var(--cookd-orange)]/30 transition-all">
                          {user.profile?.avatar_url ? (
                            <img
                              src={user.profile.avatar_url}
                              alt={user.profile.display_name || 'User'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="text-[var(--text-muted)] w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="text-[var(--text-primary)] font-bold text-sm group-hover:text-[var(--cookd-orange)] transition-colors">
                            {user.profile?.display_name || 'Anonymous User'}
                          </div>
                          <div className="text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-tighter opacity-60">
                            {user.id.slice(0, 16)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium text-sm">
                        <Mail size={14} className="text-[var(--text-muted)]" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold uppercase tracking-wide ${user.order_count > 0 ? 'bg-[var(--cookd-orange)]/10 text-[var(--cookd-orange)] border-[var(--cookd-orange)]/20 shadow-sm' : 'bg-white text-[var(--text-muted)] border-[var(--border-light)]'}`}>
                          <ShoppingBag size={12} />
                          {user.order_count} {user.order_count === 1 ? 'Order' : 'Orders'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-medium">
                        <Calendar size={14} className="opacity-50" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {user.last_sign_in_at ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[var(--surface-cream)] rounded-lg flex items-center justify-center border border-[var(--border-light)] text-[var(--text-muted)]">
                            <Clock size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[var(--text-primary)]">{formatDate(user.last_sign_in_at)}</span>
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{formatTime(user.last_sign_in_at)}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-[var(--surface-cream)] text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest rounded-lg border border-[var(--border-light)]">Never Active</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
