import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Search, ChevronLeft, ChevronRight, Download, Calendar, Filter, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { adminAPI } from '../../services/api';
import LogTable from '../../components/admin/LogTable';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [logStats, setLogStats] = useState(null);
  const [exporting, setExporting] = useState(false);

  const perPage = 25;
  const debounceRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: perPage };
      if (debouncedSearch) params.search = debouncedSearch;
      if (actionFilter) params.action = actionFilter;
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const [logRes, statsRes] = await Promise.all([
        adminAPI.getLogs(params),
        adminAPI.getLogStats(params),
      ]);

      setLogs(logRes.data.results || logRes.data);
      setTotalPages(logRes.data.total_pages || Math.ceil((logRes.data.count || 0) / perPage) || 1);
      setTotalCount(logRes.data.count || (logRes.data.results || logRes.data).length);
      setLogStats(statsRes.data);
    } catch (err) {
      console.error('Fetch logs error:', err);
      setError('Failed to load system logs.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, actionFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await adminAPI.exportLogs(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `system_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export logs: ' + (err.response?.data?.detail || err.message));
    } finally {
      setExporting(false);
    }
  };

  if (error && !loading) {
    return (
      <div className="sl-page-error">
        <p>{error}</p>
        <button onClick={fetchLogs} className="sl-retry"><RefreshCw size={16} /> Retry</button>
        <style>{`
          .sl-page-error { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: #dc2626; gap: 12px; }
          .sl-retry { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: #dc2626; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="sl-page">
      <div className="sl-header">
        <div>
          <h1 className="sl-title">System Logs</h1>
          <p className="sl-sub">{totalCount} log entries</p>
        </div>
        <div className="sl-header-actions">
          <button className="sl-refresh-btn" onClick={fetchLogs}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="sl-export-btn" onClick={handleExport} disabled={exporting}>
            <Download size={16} /> {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {logStats && (
        <div className="sl-stats-bar">
          <div className="sl-stat-item">
            <Activity size={15} className="sl-stat-icon" style={{ color: '#2563eb' }} />
            <span className="sl-stat-val">{logStats.total || totalCount}</span>
            <span className="sl-stat-label">Total</span>
          </div>
          <div className="sl-stat-item">
            <CheckCircle size={15} className="sl-stat-icon" style={{ color: '#16a34a' }} />
            <span className="sl-stat-val">{logStats.success || 0}</span>
            <span className="sl-stat-label">Success</span>
          </div>
          <div className="sl-stat-item">
            <AlertCircle size={15} className="sl-stat-icon" style={{ color: '#dc2626' }} />
            <span className="sl-stat-val">{logStats.failure || 0}</span>
            <span className="sl-stat-label">Failed</span>
          </div>
        </div>
      )}

      <div className="sl-filters">
        <div className="sl-search-wrap">
          <Search size={16} className="sl-search-icon" />
          <input type="text" placeholder="Search logs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="sl-search" />
        </div>
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} className="sl-filter-select">
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="ERROR">Error</option>
          <option value="EXPORT">Export</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="sl-filter-select">
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="warning">Warning</option>
        </select>
        <div className="sl-date-group">
          <Calendar size={14} className="sl-date-icon" />
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="sl-date-input" />
          <span className="sl-date-sep">to</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="sl-date-input" />
        </div>
      </div>

      <div className="sl-table-card">
        <LogTable logs={logs} loading={loading} />
      </div>

      {totalPages > 1 && (
        <div className="sl-pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="sl-page-btn">
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="sl-page-info">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="sl-page-btn">
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      <style>{`
        .sl-page { padding: 28px 32px 48px; max-width: 1440px; margin: 0 auto; }
        .sl-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .sl-title { margin: 0; font-size: 26px; font-weight: 700; color: #1e293b; }
        .sl-sub { margin: 4px 0 0; font-size: 14px; color: #64748b; }
        .sl-header-actions { display: flex; gap: 10px; }
        .sl-refresh-btn, .sl-export-btn {
          display: flex; align-items: center; gap: 6px; padding: 10px 18px;
          border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .sl-refresh-btn { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
        .sl-refresh-btn:hover { background: #e2e8f0; }
        .sl-export-btn { background: #dc2626; color: #fff; }
        .sl-export-btn:hover { background: #b91c1c; }
        .sl-export-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .sl-stats-bar {
          display: flex; gap: 24px; padding: 14px 20px; background: #fff;
          border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 16px;
        }
        .sl-stat-item { display: flex; align-items: center; gap: 8px; }
        .sl-stat-val { font-size: 18px; font-weight: 700; color: #1e293b; }
        .sl-stat-label { font-size: 12px; color: #94a3b8; }
        .sl-filters { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
        .sl-search-wrap { position: relative; flex: 1; min-width: 200px; }
        .sl-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .sl-search {
          width: 100%; padding: 10px 14px 10px 36px; border: 1px solid #e2e8f0; border-radius: 10px;
          font-size: 13px; outline: none; background: #fff;
        }
        .sl-search:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.08); }
        .sl-filter-select {
          padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px;
          font-size: 13px; outline: none; background: #fff; color: #475569; cursor: pointer;
        }
        .sl-filter-select:focus { border-color: #dc2626; }
        .sl-date-group {
          display: flex; align-items: center; gap: 6px; padding: 6px 12px;
          border: 1px solid #e2e8f0; border-radius: 10px; background: #fff;
        }
        .sl-date-icon { color: #94a3b8; }
        .sl-date-input { border: none; outline: none; font-size: 13px; color: #475569; width: 120px; }
        .sl-date-sep { font-size: 12px; color: #94a3b8; }
        .sl-table-card { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; overflow: hidden; }
        .sl-pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
        .sl-page-btn {
          display: flex; align-items: center; gap: 4px; padding: 8px 16px;
          border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;
          font-size: 13px; font-weight: 500; color: #475569; cursor: pointer;
        }
        .sl-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .sl-page-btn:not(:disabled):hover { background: #f8fafc; }
        .sl-page-info { font-size: 13px; color: #64748b; }
      `}</style>
    </div>
  );
}
