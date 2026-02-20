import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Search, Plus, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';
import { adminAPI } from '../../services/api';
import UserTable from '../../components/admin/UserTable';
import UserModal from '../../components/admin/UserModal';
import RoleBadge from '../../components/admin/RoleBadge';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [activityDrawer, setActivityDrawer] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const perPage = 20;
  const debounceRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: perPage };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.is_active = statusFilter === 'active';
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.results || res.data);
      setTotalPages(res.data.total_pages || Math.ceil((res.data.count || 0) / perPage) || 1);
      setTotalCount(res.data.count || (res.data.results || res.data).length);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSubmit = async (data, userId) => {
    if (userId) {
      await adminAPI.updateUser(userId, data);
    } else {
      await adminAPI.createUser(data);
    }
    fetchUsers();
  };

  const handleDelete = async (user) => {
    if (!confirm(`Delete user "${user.first_name} ${user.last_name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(user.id);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminAPI.toggleUserStatus(user.id);
      fetchUsers();
    } catch (err) {
      alert('Failed to toggle user status: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleResetPassword = async (user) => {
    if (!confirm(`Reset password for "${user.email}"? They will receive an email with a new temporary password.`)) return;
    try {
      await adminAPI.resetPassword(user.id);
      alert('Password reset email sent.');
    } catch (err) {
      alert('Failed to reset password: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleViewActivity = async (user) => {
    setActivityDrawer(user);
    setActivityLoading(true);
    try {
      const res = await adminAPI.getUserActivity(user.id, { limit: 20 });
      setActivityData(res.data.results || res.data);
    } catch (err) {
      setActivityData([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setShowModal(true);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (error && !loading) {
    return (
      <div className="um-page-error">
        <p>{error}</p>
        <button onClick={fetchUsers} className="um-retry"><RefreshCw size={16} /> Retry</button>
        <style>{`
          .um-page-error { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: #dc2626; gap: 12px; }
          .um-retry { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: #dc2626; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="um-page">
      <div className="um-page-header">
        <div>
          <h1 className="um-page-title">User Management</h1>
          <p className="um-page-sub">{totalCount} total users</p>
        </div>
        <button className="um-add-btn" onClick={() => { setEditUser(null); setShowModal(true); }}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="um-filters">
        <div className="um-search-wrap">
          <Search size={16} className="um-search-icon" />
          <input type="text" placeholder="Search users by name or email..." value={search} onChange={handleSearch} className="um-search" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="um-filter-select">
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="owner">Owner</option>
          <option value="warehouse">Warehouse</option>
          <option value="admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="um-filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="um-table-card">
        <UserTable
          users={users}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword}
          onViewActivity={handleViewActivity}
        />
      </div>

      {totalPages > 1 && (
        <div className="um-pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="um-page-btn">
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="um-page-info">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="um-page-btn">
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {showModal && (
        <UserModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSubmit={handleSubmit}
        />
      )}

      {activityDrawer && (
        <div className="um-drawer-overlay" onClick={() => setActivityDrawer(null)}>
          <div className="um-drawer" onClick={e => e.stopPropagation()}>
            <div className="um-drawer-header">
              <h3>Activity: {activityDrawer.first_name} {activityDrawer.last_name}</h3>
              <button className="um-drawer-close" onClick={() => setActivityDrawer(null)}><X size={18} /></button>
            </div>
            <div className="um-drawer-body">
              {activityLoading ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  <RefreshCw size={20} className="um-spin" /> Loading...
                </div>
              ) : activityData.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No activity recorded.</p>
              ) : (
                activityData.map((act, i) => (
                  <div key={i} className="um-activity-row">
                    <div className="um-act-time">
                      {new Date(act.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="um-act-desc">{act.description || act.action}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .um-page { padding: 28px 32px 48px; max-width: 1440px; margin: 0 auto; }
        .um-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .um-page-title { margin: 0; font-size: 26px; font-weight: 700; color: #1e293b; }
        .um-page-sub { margin: 4px 0 0; font-size: 14px; color: #64748b; }
        .um-add-btn {
          display: flex; align-items: center; gap: 6px; padding: 10px 18px;
          background: #dc2626; color: #fff; border: none; border-radius: 10px;
          font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .um-add-btn:hover { background: #b91c1c; }
        .um-filters { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
        .um-search-wrap { position: relative; flex: 1; min-width: 240px; }
        .um-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .um-search {
          width: 100%; padding: 10px 14px 10px 36px; border: 1px solid #e2e8f0; border-radius: 10px;
          font-size: 13px; outline: none; transition: border 0.15s; background: #fff;
        }
        .um-search:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.08); }
        .um-filter-select {
          padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px;
          font-size: 13px; outline: none; background: #fff; color: #475569; cursor: pointer;
          min-width: 130px;
        }
        .um-filter-select:focus { border-color: #dc2626; }
        .um-table-card { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; overflow: hidden; }
        .um-pagination {
          display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px;
        }
        .um-page-btn {
          display: flex; align-items: center; gap: 4px; padding: 8px 16px;
          border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;
          font-size: 13px; font-weight: 500; color: #475569; cursor: pointer; transition: all 0.15s;
        }
        .um-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .um-page-btn:not(:disabled):hover { background: #f8fafc; border-color: #cbd5e1; }
        .um-page-info { font-size: 13px; color: #64748b; font-weight: 500; }
        .um-drawer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000;
          display: flex; justify-content: flex-end; animation: umFade 0.2s;
        }
        @keyframes umFade { from { opacity: 0; } to { opacity: 1; } }
        .um-drawer {
          width: 420px; max-width: 95vw; background: #fff; height: 100%;
          display: flex; flex-direction: column; box-shadow: -10px 0 40px rgba(0,0,0,0.1);
          animation: umSlideIn 0.3s ease;
        }
        @keyframes umSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .um-drawer-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 24px; border-bottom: 1px solid #f1f5f9;
        }
        .um-drawer-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #1e293b; }
        .um-drawer-close {
          width: 32px; height: 32px; border: none; background: #f1f5f9; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b;
        }
        .um-drawer-close:hover { background: #fee2e2; color: #dc2626; }
        .um-drawer-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
        .um-activity-row { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f8fafc; }
        .um-act-time { font-size: 11px; color: #94a3b8; white-space: nowrap; min-width: 90px; }
        .um-act-desc { font-size: 13px; color: #475569; line-height: 1.4; }
        .um-spin { animation: umSpinAnim 1s linear infinite; }
        @keyframes umSpinAnim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
