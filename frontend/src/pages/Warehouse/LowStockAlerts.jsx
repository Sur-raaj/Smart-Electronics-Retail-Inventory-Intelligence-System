import { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, RefreshCw, AlertCircle, Bell, BellOff, ChevronLeft, ChevronRight, Download, Filter, Eye, EyeOff, Package } from 'lucide-react';
import { format } from 'date-fns';
import OwnerFilter from '../../components/warehouse/OwnerFilter';
import { warehouseAPI } from '../../services/api';

const SEVERITY_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Critical', value: 'critical' },
  { label: 'Warning', value: 'warning' },
  { label: 'Info', value: 'info' },
];

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Dismissed', value: 'dismissed' },
];

export default function LowStockAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [actionLoading, setActionLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page_size: 1000, ordering: '-created_at' };
      if (ownerFilter) params.owner = ownerFilter;
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await warehouseAPI.getAlerts(params);
      setAlerts(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setError('Failed to load alerts. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [ownerFilter, severityFilter, statusFilter]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);
  useEffect(() => { setCurrentPage(1); }, [ownerFilter, severityFilter, statusFilter]);

  const handleResolve = async (id) => {
    setActionLoading(id);
    try { await warehouseAPI.resolveAlert(id); fetchAlerts(); } catch (err) { alert('Failed to resolve alert: ' + (err.response?.data?.detail || err.message)); }
    setActionLoading(null);
  };

  const handleDismiss = async (id) => {
    setActionLoading(id);
    try { await warehouseAPI.dismissAlert(id); fetchAlerts(); } catch (err) { alert('Failed to dismiss alert: ' + (err.response?.data?.detail || err.message)); }
    setActionLoading(null);
  };

  const totalPages = Math.ceil(alerts.length / pageSize);
  const paginated = alerts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = useMemo(() => {
    const s = { total: alerts.length, critical: 0, warning: 0, info: 0 };
    alerts.forEach(a => { if (s[a.severity] !== undefined) s[a.severity]++; });
    return s;
  }, [alerts]);

  const exportCSV = () => {
    const headers = ['Date', 'Product', 'SKU', 'Severity', 'Status', 'Current Stock', 'Threshold', 'Owner', 'Message'];
    const rows = alerts.map(a => [a.created_at, a.product_name, a.sku, a.severity, a.status, a.current_stock, a.threshold, a.owner, a.message]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `low_stock_alerts_${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#F97316' }} />
          <p style={{ marginTop: 12, color: '#6B7280' }}>Loading alerts...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <AlertCircle size={40} color="#EF4444" />
          <h3 style={{ color: '#1F2937', margin: '12px 0 6px' }}>Failed to Load</h3>
          <p style={{ color: '#6B7280', fontSize: '0.88rem', marginBottom: 16 }}>{error}</p>
          <button onClick={fetchAlerts} style={{ padding: '10px 24px', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="la-page">
        <div className="la-header">
          <div>
            <h1 className="la-title">Low Stock Alerts</h1>
            <p className="la-subtitle">{stats.total} alerts — {stats.critical} critical, {stats.warning} warning, {stats.info} info</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="la-export-btn" onClick={exportCSV}><Download size={15} /> Export</button>
            <button className="la-refresh-btn" onClick={fetchAlerts}><RefreshCw size={15} /></button>
          </div>
        </div>

        {/* Severity Summary */}
        <div className="la-stat-row">
          <div className="la-stat-card la-stat-critical" onClick={() => setSeverityFilter(severityFilter === 'critical' ? '' : 'critical')}>
            <AlertTriangle size={20} />
            <div className="la-stat-num">{stats.critical}</div>
            <div className="la-stat-label">Critical</div>
          </div>
          <div className="la-stat-card la-stat-warning" onClick={() => setSeverityFilter(severityFilter === 'warning' ? '' : 'warning')}>
            <Bell size={20} />
            <div className="la-stat-num">{stats.warning}</div>
            <div className="la-stat-label">Warning</div>
          </div>
          <div className="la-stat-card la-stat-info" onClick={() => setSeverityFilter(severityFilter === 'info' ? '' : 'info')}>
            <AlertCircle size={20} />
            <div className="la-stat-num">{stats.info}</div>
            <div className="la-stat-label">Info</div>
          </div>
        </div>

        {/* Filters */}
        <div className="la-filters">
          <OwnerFilter value={ownerFilter} onChange={setOwnerFilter} />
          <select className="la-select" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
            {SEVERITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} Severity</option>)}
          </select>
          <select className="la-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} Status</option>)}
          </select>
        </div>

        {/* Alert Cards */}
        {paginated.length > 0 ? (
          <div className="la-grid">
            {paginated.map(alert => {
              const sevColors = { critical: { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', icon: '#DC2626' }, warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', icon: '#D97706' }, info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB', icon: '#2563EB' } };
              const sc = sevColors[alert.severity] || sevColors.info;
              const stockPct = alert.threshold ? Math.min((alert.current_stock / alert.threshold) * 100, 100) : 0;
              const isActive = alert.status === 'active';
              return (
                <div key={alert.id} className="la-card" style={{ borderLeftColor: sc.icon, opacity: isActive ? 1 : 0.65 }}>
                  <div className="la-card-top">
                    <span className="la-sev-badge" style={{ color: sc.text, background: sc.bg, borderColor: sc.border }}>
                      {alert.severity === 'critical' ? <AlertTriangle size={12} /> : alert.severity === 'warning' ? <Bell size={12} /> : <AlertCircle size={12} />}
                      {alert.severity}
                    </span>
                    <span className={`la-status-badge la-status-${alert.status}`}>{alert.status}</span>
                  </div>
                  <h3 className="la-card-product">{alert.product_name}</h3>
                  {alert.sku && <p className="la-card-sku">SKU: {alert.sku}</p>}
                  <div className="la-stock-bar-wrap">
                    <div className="la-stock-bar-track">
                      <div className="la-stock-bar-fill" style={{ width: `${stockPct}%`, background: sc.icon }} />
                    </div>
                    <div className="la-stock-nums">
                      <span>Current: <strong>{alert.current_stock ?? '—'}</strong></span>
                      <span>Threshold: <strong>{alert.threshold ?? '—'}</strong></span>
                    </div>
                  </div>
                  {alert.message && <p className="la-card-msg">{alert.message}</p>}
                  <div className="la-card-meta">
                    <span>{alert.owner}</span>
                    <span>{alert.created_at ? format(new Date(alert.created_at), 'dd MMM yyyy') : '—'}</span>
                  </div>
                  {isActive && (
                    <div className="la-card-actions">
                      <button className="la-resolve-btn" onClick={() => handleResolve(alert.id)} disabled={actionLoading === alert.id}>
                        <CheckCircle2 size={14} /> Resolve
                      </button>
                      <button className="la-dismiss-btn" onClick={() => handleDismiss(alert.id)} disabled={actionLoading === alert.id}>
                        <BellOff size={14} /> Dismiss
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="la-empty">
            <Package size={44} />
            <h3>No alerts found</h3>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="la-pagination">
            <span className="la-page-info">Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, alerts.length)} of {alerts.length}</span>
            <div className="la-page-btns">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                const pg = start + i;
                if (pg > totalPages) return null;
                return <button key={pg} className={currentPage === pg ? 'active' : ''} onClick={() => setCurrentPage(pg)}>{pg}</button>;
              })}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .la-page { padding: 28px 32px 40px; max-width: 1400px; margin: 0 auto; }
        .la-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .la-title { margin: 0; font-size: 1.6rem; font-weight: 800; color: #111827; }
        .la-subtitle { margin: 4px 0 0; font-size: 0.88rem; color: #6B7280; }
        .la-export-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: white; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 0.82rem; font-weight: 600; color: #374151; cursor: pointer; }
        .la-export-btn:hover { border-color: #F97316; color: #F97316; }
        .la-refresh-btn { width: 38px; height: 38px; border-radius: 10px; border: 1px solid #E5E7EB; background: white; color: #6B7280; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .la-refresh-btn:hover { border-color: #F97316; color: #F97316; }

        .la-stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 22px; }
        .la-stat-card { padding: 18px; border-radius: 14px; text-align: center; cursor: pointer; transition: all 0.15s; border: 2px solid transparent; }
        .la-stat-card:hover { transform: translateY(-2px); }
        .la-stat-critical { background: #FEF2F2; color: #DC2626; }
        .la-stat-critical:hover, .la-stat-critical.active { border-color: #DC2626; }
        .la-stat-warning { background: #FFFBEB; color: #D97706; }
        .la-stat-warning:hover { border-color: #D97706; }
        .la-stat-info { background: #EFF6FF; color: #2563EB; }
        .la-stat-info:hover { border-color: #2563EB; }
        .la-stat-num { font-size: 1.8rem; font-weight: 800; margin: 6px 0 2px; }
        .la-stat-label { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

        .la-filters { display: flex; gap: 12px; margin-bottom: 22px; flex-wrap: wrap; align-items: center; }
        .la-select { padding: 9px 14px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 0.84rem; color: #374151; background: white; outline: none; cursor: pointer; }
        .la-select:focus { border-color: #F97316; }

        .la-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
        .la-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid #E5E7EB; border-left: 4px solid; transition: all 0.15s; }
        .la-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-1px); }
        .la-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .la-sev-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.04em; border: 1px solid; }
        .la-status-badge { font-size: 0.7rem; font-weight: 600; padding: 2px 10px; border-radius: 20px; text-transform: capitalize; }
        .la-status-active { background: #DCFCE7; color: #16A34A; }
        .la-status-resolved { background: #EFF6FF; color: #2563EB; }
        .la-status-dismissed { background: #F3F4F6; color: #6B7280; }
        .la-card-product { margin: 0 0 4px; font-size: 1rem; font-weight: 700; color: #111827; }
        .la-card-sku { margin: 0 0 12px; font-size: 0.78rem; color: #9CA3AF; font-family: monospace; }
        .la-stock-bar-wrap { margin-bottom: 12px; }
        .la-stock-bar-track { height: 6px; background: #F3F4F6; border-radius: 3px; overflow: hidden; }
        .la-stock-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
        .la-stock-nums { display: flex; justify-content: space-between; margin-top: 6px; font-size: 0.76rem; color: #6B7280; }
        .la-card-msg { margin: 0 0 10px; font-size: 0.82rem; color: #6B7280; line-height: 1.4; }
        .la-card-meta { display: flex; justify-content: space-between; font-size: 0.76rem; color: #9CA3AF; margin-bottom: 12px; }
        .la-card-actions { display: flex; gap: 8px; }
        .la-resolve-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 8px; background: #DCFCE7; border: none; border-radius: 8px; font-size: 0.78rem; font-weight: 600; color: #16A34A; cursor: pointer; }
        .la-resolve-btn:hover { background: #BBF7D0; }
        .la-dismiss-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 8px; background: #F3F4F6; border: none; border-radius: 8px; font-size: 0.78rem; font-weight: 600; color: #6B7280; cursor: pointer; }
        .la-dismiss-btn:hover { background: #E5E7EB; }
        .la-resolve-btn:disabled, .la-dismiss-btn:disabled { opacity: 0.5; cursor: wait; }

        .la-empty { text-align: center; padding: 60px 20px; color: #9CA3AF; }
        .la-empty h3 { margin: 14px 0 6px; color: #6B7280; font-size: 1.1rem; }
        .la-empty p { font-size: 0.88rem; }

        .la-pagination { display: flex; align-items: center; justify-content: space-between; margin-top: 22px; flex-wrap: wrap; gap: 12px; }
        .la-page-info { font-size: 0.82rem; color: #6B7280; }
        .la-page-btns { display: flex; gap: 4px; }
        .la-page-btns button { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #E5E7EB; background: white; color: #374151; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .la-page-btns button:hover:not(:disabled) { border-color: #F97316; color: #F97316; }
        .la-page-btns button.active { background: #F97316; color: white; border-color: #F97316; }
        .la-page-btns button:disabled { opacity: 0.4; cursor: not-allowed; }
        @media (max-width: 768px) { .la-page { padding: 20px 16px; } .la-stat-row { grid-template-columns: 1fr; } .la-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
