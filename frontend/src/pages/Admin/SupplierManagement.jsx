import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Search, Plus, ChevronLeft, ChevronRight, Truck, TrendingUp, Star, Package } from 'lucide-react';
import Plot from 'react-plotly.js';
import { adminAPI } from '../../services/api';
import SupplierTable from '../../components/admin/SupplierTable';
import SupplierModal from '../../components/admin/SupplierModal';
import SystemStatsCard from '../../components/admin/SystemStatsCard';

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [stats, setStats] = useState(null);
  const [performance, setPerformance] = useState([]);

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: perPage };
      if (debouncedSearch) params.search = debouncedSearch;
      if (tab === 'owner') params.type = 'owner';
      else if (tab === 'manufacturer') params.type = 'manufacturer';

      const [suppRes, statsRes, perfRes] = await Promise.all([
        adminAPI.getSuppliers(params),
        adminAPI.getSupplierStats(),
        adminAPI.getSupplierPerformance({ limit: 8 }),
      ]);

      setSuppliers(suppRes.data.results || suppRes.data);
      setTotalPages(suppRes.data.total_pages || Math.ceil((suppRes.data.count || 0) / perPage) || 1);
      setTotalCount(suppRes.data.count || (suppRes.data.results || suppRes.data).length);
      setStats(statsRes.data);
      setPerformance(perfRes.data);
    } catch (err) {
      console.error('Supplier management fetch error:', err);
      setError('Failed to load supplier data.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (data, supplierId) => {
    if (supplierId) {
      await adminAPI.updateSupplier(supplierId, data);
    } else {
      await adminAPI.createSupplier(data);
    }
    fetchData();
  };

  const handleToggleStatus = async (supplier) => {
    try {
      await adminAPI.toggleSupplierStatus(supplier.id);
      fetchData();
    } catch (err) {
      alert('Failed to toggle status: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEdit = (supplier) => {
    setEditSupplier(supplier);
    setShowModal(true);
  };

  if (error && !loading) {
    return (
      <div className="smp-error">
        <p>{error}</p>
        <button onClick={fetchData} className="smp-retry"><RefreshCw size={16} /> Retry</button>
        <style>{`
          .smp-error { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: #dc2626; gap: 12px; }
          .smp-retry { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: #dc2626; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
        `}</style>
      </div>
    );
  }

  const kpis = [
    { title: 'Total Suppliers', value: stats?.total || 0, icon: Truck, color: '#6366f1' },
    { title: 'Avg On-Time Rate', value: stats?.avg_on_time_rate || 0, icon: TrendingUp, format: 'percentage', color: '#16a34a' },
    { title: 'Avg Rating', value: stats?.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : '—', icon: Star, color: '#f59e0b' },
    { title: 'Total Products', value: stats?.total_products || 0, icon: Package, color: '#2563eb' },
  ];

  const perfNames = performance.map(p => p.name);
  const perfRates = performance.map(p => p.on_time_rate || 0);

  return (
    <div className="smp-page">
      <div className="smp-header">
        <div>
          <h1 className="smp-title">Supplier Management</h1>
          <p className="smp-sub">{totalCount} suppliers total</p>
        </div>
        <button className="smp-add-btn" onClick={() => { setEditSupplier(null); setShowModal(true); }}>
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      <div className="smp-kpis">
        {kpis.map((k, i) => <SystemStatsCard key={i} {...k} />)}
      </div>

      <div className="smp-content-row">
        <div className="smp-table-section">
          <div className="smp-tabs">
            {['all', 'manufacturer', 'owner'].map(t => (
              <button key={t} className={`smp-tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setPage(1); }}>
                {t === 'all' ? 'All Suppliers' : t === 'manufacturer' ? 'Manufacturers' : 'Owner-Suppliers'}
              </button>
            ))}
          </div>

          <div className="smp-filters">
            <div className="smp-search-wrap">
              <Search size={16} className="smp-search-icon" />
              <input type="text" placeholder="Search suppliers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="smp-search" />
            </div>
          </div>

          <div className="smp-table-card">
            <SupplierTable
              suppliers={suppliers}
              loading={loading}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          </div>

          {totalPages > 1 && (
            <div className="smp-pagination">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="smp-page-btn">
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="smp-page-info">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="smp-page-btn">
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="smp-chart-panel">
          <div className="smp-chart-card">
            <h3 className="smp-chart-title">Supplier Performance Comparison</h3>
            <Plot
              data={[{
                type: 'bar',
                x: perfRates,
                y: perfNames,
                orientation: 'h',
                marker: {
                  color: perfRates.map(r => r >= 90 ? '#16a34a' : r >= 70 ? '#f59e0b' : '#dc2626'),
                  cornerradius: 4,
                },
                text: perfRates.map(r => `${r}%`),
                textposition: 'outside',
                textfont: { size: 11, color: '#475569' },
                hovertemplate: '<b>%{y}</b><br>On-Time: %{x}%<extra></extra>',
              }]}
              layout={{
                height: 350,
                margin: { t: 10, b: 40, l: 130, r: 50 },
                xaxis: { range: [0, 105], showgrid: true, gridcolor: '#f1f5f9', title: { text: 'On-Time %', font: { size: 11 } } },
                yaxis: { autorange: 'reversed', tickfont: { size: 11 } },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <SupplierModal
          supplier={editSupplier}
          onClose={() => { setShowModal(false); setEditSupplier(null); }}
          onSubmit={handleSubmit}
        />
      )}

      <style>{`
        .smp-page { padding: 28px 32px 48px; max-width: 1440px; margin: 0 auto; }
        .smp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .smp-title { margin: 0; font-size: 26px; font-weight: 700; color: #1e293b; }
        .smp-sub { margin: 4px 0 0; font-size: 14px; color: #64748b; }
        .smp-add-btn {
          display: flex; align-items: center; gap: 6px; padding: 10px 18px;
          background: #dc2626; color: #fff; border: none; border-radius: 10px;
          font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .smp-add-btn:hover { background: #b91c1c; }
        .smp-kpis { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .smp-content-row { display: grid; grid-template-columns: 1fr 380px; gap: 20px; align-items: start; }
        @media (max-width: 1100px) { .smp-content-row { grid-template-columns: 1fr; } }
        .smp-table-section { min-width: 0; }
        .smp-tabs { display: flex; gap: 4px; margin-bottom: 12px; }
        .smp-tab {
          padding: 8px 18px; border: 1px solid #e2e8f0; border-radius: 8px;
          background: #fff; font-size: 13px; font-weight: 500; color: #64748b;
          cursor: pointer; transition: all 0.15s;
        }
        .smp-tab.active { background: #dc2626; color: #fff; border-color: #dc2626; }
        .smp-tab:not(.active):hover { background: #f8fafc; }
        .smp-filters { display: flex; gap: 12px; margin-bottom: 12px; }
        .smp-search-wrap { position: relative; flex: 1; }
        .smp-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .smp-search {
          width: 100%; padding: 10px 14px 10px 36px; border: 1px solid #e2e8f0; border-radius: 10px;
          font-size: 13px; outline: none; background: #fff;
        }
        .smp-search:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.08); }
        .smp-table-card { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; overflow: hidden; }
        .smp-pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
        .smp-page-btn {
          display: flex; align-items: center; gap: 4px; padding: 8px 16px;
          border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;
          font-size: 13px; font-weight: 500; color: #475569; cursor: pointer;
        }
        .smp-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .smp-page-btn:not(:disabled):hover { background: #f8fafc; }
        .smp-page-info { font-size: 13px; color: #64748b; }
        .smp-chart-panel {}
        .smp-chart-card { background: #fff; border-radius: 14px; padding: 20px; border: 1px solid #e5e7eb; }
        .smp-chart-title { margin: 0 0 14px; font-size: 15px; font-weight: 600; color: #1e293b; }
      `}</style>
    </div>
  );
}
