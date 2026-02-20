import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, RefreshCw, AlertCircle, Download, Plus, Filter, Eye } from 'lucide-react';
import { format } from 'date-fns';
import OwnerFilter from '../../components/warehouse/OwnerFilter';
import MovementModal from '../../components/warehouse/MovementModal';
import { warehouseAPI } from '../../services/api';

const TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'Stock In', value: 'stock_in' },
  { label: 'Stock Out', value: 'stock_out' },
  { label: 'Returned', value: 'returned' },
  { label: 'Damaged', value: 'damaged' },
  { label: 'Transferred', value: 'transferred' },
];

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const pageSize = 15;

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page_size: 1000, ordering: '-date' };
      if (ownerFilter) params.owner = ownerFilter;
      if (typeFilter) params.type = typeFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await warehouseAPI.getStockMovements(params);
      setMovements(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch stock movements:', err);
      setError('Failed to load stock movements. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [ownerFilter, typeFilter, dateFrom, dateTo]);

  useEffect(() => { fetchMovements(); }, [fetchMovements]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, ownerFilter, typeFilter, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    let data = [...movements];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(m => m.product_name?.toLowerCase().includes(q) || m.reason?.toLowerCase().includes(q) || m.reference?.toLowerCase().includes(q));
    }
    return data;
  }, [movements, searchQuery]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const typeCounts = useMemo(() => {
    const counts = { stock_in: 0, stock_out: 0, returned: 0, damaged: 0, transferred: 0 };
    movements.forEach(m => { if (counts[m.type] !== undefined) counts[m.type]++; });
    return counts;
  }, [movements]);

  const exportCSV = () => {
    const headers = ['Date', 'Product', 'Type', 'Quantity', 'Owner', 'Reason', 'Reference', 'Performed By'];
    const rows = filtered.map(m => [m.date, m.product_name, m.type, m.quantity, m.owner, m.reason, m.reference, m.performed_by]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `stock_movements_${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddMovement = async (data) => {
    await warehouseAPI.createStockMovement(data);
    setShowAddModal(false);
    fetchMovements();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#F97316' }} />
          <p style={{ marginTop: 12, color: '#6B7280' }}>Loading stock movements...</p>
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
          <button onClick={fetchMovements} style={{ padding: '10px 24px', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="sm-page">
        <div className="sm-header">
          <div>
            <h1 className="sm-title">Stock Movements</h1>
            <p className="sm-subtitle">{movements.length} movements recorded</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="sm-add-btn" onClick={() => setShowAddModal(true)}><Plus size={16} /> Record Movement</button>
            <button className="sm-export-btn" onClick={exportCSV}><Download size={15} /> Export</button>
            <button className="sm-refresh-btn" onClick={fetchMovements}><RefreshCw size={15} /></button>
          </div>
        </div>

        {/* Type Summary Pills */}
        <div className="sm-type-bar">
          {TYPE_OPTIONS.slice(1).map(t => {
            const isIn = t.value === 'stock_in' || t.value === 'returned';
            const count = typeCounts[t.value] || 0;
            return (
              <button key={t.value} className={`sm-type-pill ${typeFilter === t.value ? 'active' : ''}`} onClick={() => setTypeFilter(typeFilter === t.value ? '' : t.value)}>
                {isIn ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />} {t.label} <span className="sm-pill-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="sm-filters">
          <div className="sm-search-wrap">
            <Search size={16} className="sm-search-icon" />
            <input className="sm-search" placeholder="Search product, reason, reference..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <OwnerFilter value={ownerFilter} onChange={setOwnerFilter} />
          <input type="date" className="sm-date-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" />
          <input type="date" className="sm-date-input" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" />
        </div>

        {/* Table */}
        <div className="sm-table-wrap">
          <table className="sm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Owner</th>
                <th>Reason</th>
                <th>Reference</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map(m => {
                const isIn = m.type === 'stock_in' || m.type === 'returned';
                const typeColors = { stock_in: '#16A34A', stock_out: '#2563EB', returned: '#7C3AED', damaged: '#DC2626', transferred: '#D97706' };
                const tc = typeColors[m.type] || '#6B7280';
                return (
                  <tr key={m.id} onClick={() => setSelectedMovement(m)} style={{ cursor: 'pointer' }}>
                    <td className="sm-date">{m.date ? format(new Date(m.date), 'dd MMM yyyy') : '—'}</td>
                    <td><div className="sm-product-name">{m.product_name}</div></td>
                    <td><span className="sm-type-badge" style={{ color: tc, background: `${tc}14` }}>{isIn ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />} {(m.type || '').replace(/_/g, ' ')}</span></td>
                    <td><span style={{ fontWeight: 700, color: isIn ? '#16A34A' : '#DC2626' }}>{isIn ? '+' : '-'}{Math.abs(m.quantity)}</span></td>
                    <td>{m.owner}</td>
                    <td className="sm-reason">{m.reason}</td>
                    <td className="sm-ref">{m.reference || '—'}</td>
                    <td>{m.performed_by || '—'}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>No stock movements found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="sm-pagination">
            <span className="sm-page-info">Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
            <div className="sm-page-btns">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                const page = start + i;
                if (page > totalPages) return null;
                return <button key={page} className={currentPage === page ? 'active' : ''} onClick={() => setCurrentPage(page)}>{page}</button>;
              })}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedMovement && (
        <div className="sm-modal-overlay" onClick={() => setSelectedMovement(null)}>
          <div className="sm-modal-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>Movement Details</h3>
            <div className="sm-detail-grid">
              <div className="sm-detail-item"><span className="sm-detail-label">Product</span><span className="sm-detail-val">{selectedMovement.product_name}</span></div>
              <div className="sm-detail-item"><span className="sm-detail-label">Type</span><span className="sm-detail-val" style={{ textTransform: 'capitalize' }}>{(selectedMovement.type || '').replace(/_/g, ' ')}</span></div>
              <div className="sm-detail-item"><span className="sm-detail-label">Quantity</span><span className="sm-detail-val" style={{ fontWeight: 700 }}>{selectedMovement.quantity}</span></div>
              <div className="sm-detail-item"><span className="sm-detail-label">Date</span><span className="sm-detail-val">{selectedMovement.date ? format(new Date(selectedMovement.date), 'PPpp') : '—'}</span></div>
              <div className="sm-detail-item"><span className="sm-detail-label">Owner</span><span className="sm-detail-val">{selectedMovement.owner}</span></div>
              <div className="sm-detail-item"><span className="sm-detail-label">Reason</span><span className="sm-detail-val">{selectedMovement.reason}</span></div>
              <div className="sm-detail-item"><span className="sm-detail-label">Reference</span><span className="sm-detail-val">{selectedMovement.reference || '—'}</span></div>
              <div className="sm-detail-item"><span className="sm-detail-label">Performed By</span><span className="sm-detail-val">{selectedMovement.performed_by || '—'}</span></div>
            </div>
            <button className="sm-modal-close" onClick={() => setSelectedMovement(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Add Movement Modal */}
      {showAddModal && <MovementModal onClose={() => setShowAddModal(false)} onSubmit={handleAddMovement} />}

      <style>{`
        .sm-page { padding: 28px 32px 40px; max-width: 1400px; margin: 0 auto; }
        .sm-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .sm-title { margin: 0; font-size: 1.6rem; font-weight: 800; color: #111827; }
        .sm-subtitle { margin: 4px 0 0; font-size: 0.88rem; color: #6B7280; }
        .sm-add-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: #F97316; border: none; border-radius: 10px; font-size: 0.82rem; font-weight: 600; color: white; cursor: pointer; }
        .sm-add-btn:hover { background: #EA580C; }
        .sm-export-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: white; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 0.82rem; font-weight: 600; color: #374151; cursor: pointer; }
        .sm-export-btn:hover { border-color: #F97316; color: #F97316; }
        .sm-refresh-btn { width: 38px; height: 38px; border-radius: 10px; border: 1px solid #E5E7EB; background: white; color: #6B7280; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .sm-refresh-btn:hover { border-color: #F97316; color: #F97316; }
        .sm-type-bar { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .sm-type-pill { display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; border: 1px solid #E5E7EB; background: white; color: #6B7280; cursor: pointer; transition: all 0.15s; }
        .sm-type-pill:hover { border-color: #F97316; color: #F97316; }
        .sm-type-pill.active { background: #FFF7ED; border-color: #F97316; color: #F97316; }
        .sm-pill-count { background: #F3F4F6; padding: 1px 7px; border-radius: 10px; font-size: 0.72rem; }
        .sm-type-pill.active .sm-pill-count { background: #FFEDD5; }
        .sm-filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .sm-search-wrap { position: relative; flex: 1; min-width: 220px; }
        .sm-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9CA3AF; }
        .sm-search { width: 100%; padding: 9px 12px 9px 36px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 0.88rem; outline: none; }
        .sm-search:focus { border-color: #F97316; }
        .sm-date-input { padding: 9px 14px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 0.82rem; color: #374151; outline: none; }
        .sm-date-input:focus { border-color: #F97316; }
        .sm-table-wrap { background: white; border: 1px solid #E5E7EB; border-radius: 16px; overflow-x: auto; }
        .sm-table { width: 100%; border-collapse: collapse; }
        .sm-table th { padding: 12px 14px; text-align: left; font-size: 0.75rem; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; background: #F9FAFB; border-bottom: 1px solid #E5E7EB; white-space: nowrap; }
        .sm-table td { padding: 12px 14px; font-size: 0.84rem; color: #374151; border-bottom: 1px solid #F3F4F6; }
        .sm-table tr:hover td { background: #FFFBF5; }
        .sm-date { white-space: nowrap; font-size: 0.8rem; color: #6B7280; }
        .sm-product-name { font-weight: 600; color: #111827; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sm-type-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; text-transform: capitalize; white-space: nowrap; }
        .sm-reason { max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.8rem; color: #6B7280; }
        .sm-ref { font-family: monospace; font-size: 0.78rem; color: #6B7280; }
        .sm-pagination { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; flex-wrap: wrap; gap: 12px; }
        .sm-page-info { font-size: 0.82rem; color: #6B7280; }
        .sm-page-btns { display: flex; gap: 4px; }
        .sm-page-btns button { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #E5E7EB; background: white; color: #374151; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .sm-page-btns button:hover:not(:disabled) { border-color: #F97316; color: #F97316; }
        .sm-page-btns button.active { background: #F97316; color: white; border-color: #F97316; }
        .sm-page-btns button:disabled { opacity: 0.4; cursor: not-allowed; }
        .sm-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 500; }
        .sm-modal-card { background: white; border-radius: 16px; padding: 28px; max-width: 480px; width: 90%; max-height: 80vh; overflow-y: auto; }
        .sm-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .sm-detail-item { display: flex; flex-direction: column; gap: 4px; }
        .sm-detail-label { font-size: 0.72rem; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
        .sm-detail-val { font-size: 0.88rem; color: #111827; }
        .sm-modal-close { width: 100%; padding: 10px; background: #F3F4F6; border: none; border-radius: 10px; font-weight: 600; color: #374151; cursor: pointer; }
        .sm-modal-close:hover { background: #E5E7EB; }
        @media (max-width: 768px) { .sm-page { padding: 20px 16px; } .sm-filters { flex-direction: column; } }
      `}</style>
    </>
  );
}
