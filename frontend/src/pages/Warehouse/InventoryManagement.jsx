import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Package, AlertCircle, RefreshCw, Download, Pencil, Eye } from 'lucide-react';
import { format } from 'date-fns';
import OwnerFilter from '../../components/warehouse/OwnerFilter';
import InventoryTable from '../../components/warehouse/InventoryTable';
import { warehouseAPI } from '../../services/api';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'In Stock', value: 'in_stock' },
  { label: 'Low Stock', value: 'low_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' },
];

const CATEGORY_OPTIONS = ['All Categories', 'Smartphones', 'Laptops', 'Audio', 'Televisions', 'Cameras', 'Wearables', 'Networking', 'Smart Home', 'Gaming', 'Accessories', 'Tablets', 'Storage'];

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('product_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const pageSize = 15;

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page_size: 1000 };
      if (ownerFilter) params.owner = ownerFilter;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter && categoryFilter !== 'All Categories') params.category = categoryFilter;
      const res = await warehouseAPI.getInventoryItems(params);
      setInventory(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError('Failed to load inventory. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [ownerFilter, statusFilter, categoryFilter]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, ownerFilter, statusFilter, categoryFilter]);

  const filtered = useMemo(() => {
    let data = [...inventory];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(i => i.product_name?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q) || i.warehouse_location?.toLowerCase().includes(q));
    }
    data.sort((a, b) => {
      const aVal = a[sortBy] ?? '';
      const bVal = b[sortBy] ?? '';
      if (typeof aVal === 'number') return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      return sortOrder === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return data;
  }, [inventory, searchQuery, sortBy, sortOrder]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportCSV = () => {
    const headers = ['SKU', 'Product', 'Category', 'Owner', 'Supplier', 'Price', 'Stock', 'Reorder Level', 'Location', 'Status'];
    const rows = filtered.map(i => [i.sku, i.product_name, i.category, i.owner, i.supplier, i.unit_price, i.quantity_in_stock, i.reorder_level, i.warehouse_location, i.status]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `inventory_${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const statusCounts = useMemo(() => {
    const counts = { in_stock: 0, low_stock: 0, out_of_stock: 0 };
    inventory.forEach(i => { if (counts[i.status] !== undefined) counts[i.status]++; });
    return counts;
  }, [inventory]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#F97316' }} />
          <p style={{ marginTop: 12, color: '#6B7280' }}>Loading inventory...</p>
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
          <button onClick={fetchInventory} style={{ padding: '10px 24px', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="inv-page">
        <div className="inv-header">
          <div>
            <h1 className="inv-title">Inventory Management</h1>
            <p className="inv-subtitle">{inventory.length} products tracked across all warehouses</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="inv-export-btn" onClick={exportCSV}><Download size={15} /> Export CSV</button>
            <button className="inv-refresh-btn" onClick={fetchInventory}><RefreshCw size={15} /></button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="inv-status-bar">
          <div className="inv-status-chip" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <span className="inv-chip-count">{statusCounts.in_stock}</span> In Stock
          </div>
          <div className="inv-status-chip" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <span className="inv-chip-count">{statusCounts.low_stock}</span> Low Stock
          </div>
          <div className="inv-status-chip" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <span className="inv-chip-count">{statusCounts.out_of_stock}</span> Out of Stock
          </div>
        </div>

        {/* Filters */}
        <div className="inv-filters">
          <div className="inv-search-wrap">
            <Search size={16} className="inv-search-icon" />
            <input className="inv-search" placeholder="Search by name, SKU, or location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <OwnerFilter value={ownerFilter} onChange={setOwnerFilter} />
          <select className="inv-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="inv-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                {[
                  { key: 'sku', label: 'SKU' },
                  { key: 'product_name', label: 'Product' },
                  { key: 'category', label: 'Category' },
                  { key: 'owner', label: 'Owner' },
                  { key: 'unit_price', label: 'Unit Price' },
                  { key: 'quantity_in_stock', label: 'Stock' },
                  { key: 'reorder_level', label: 'Reorder' },
                  { key: 'warehouse_location', label: 'Location' },
                  { key: 'status', label: 'Status' },
                ].map(col => (
                  <th key={col.key} onClick={() => { setSortBy(col.key); setSortOrder(sortBy === col.key && sortOrder === 'asc' ? 'desc' : 'asc'); }} style={{ cursor: 'pointer' }}>
                    {col.label} {sortBy === col.key ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map(item => {
                const statusColor = item.status === 'in_stock' ? '#16A34A' : item.status === 'low_stock' ? '#D97706' : '#DC2626';
                const stockPercent = item.max_stock ? Math.min(100, (item.quantity_in_stock / item.max_stock) * 100) : 0;
                return (
                  <tr key={item.id}>
                    <td className="inv-sku">{item.sku}</td>
                    <td><div className="inv-product-name">{item.product_name}</div></td>
                    <td>{item.category}</td>
                    <td>{item.owner}</td>
                    <td className="inv-price">NPR {(item.unit_price || 0).toLocaleString()}</td>
                    <td>
                      <div className="inv-stock-cell">
                        <span style={{ fontWeight: 700, color: statusColor }}>{item.quantity_in_stock}</span>
                        <div className="inv-stock-bar"><div className="inv-stock-bar-fill" style={{ width: `${stockPercent}%`, background: statusColor }} /></div>
                      </div>
                    </td>
                    <td>{item.reorder_level}</td>
                    <td className="inv-location">{item.warehouse_location}</td>
                    <td><span className="inv-status-badge" style={{ color: statusColor, background: `${statusColor}14` }}>{(item.status || '').replace(/_/g, ' ')}</span></td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>No inventory items found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="inv-pagination">
            <span className="inv-page-info">Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
            <div className="inv-page-btns">
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

      <style>{`
        .inv-page { padding: 28px 32px 40px; max-width: 1400px; margin: 0 auto; }
        .inv-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .inv-title { margin: 0; font-size: 1.6rem; font-weight: 800; color: #111827; }
        .inv-subtitle { margin: 4px 0 0; font-size: 0.88rem; color: #6B7280; }
        .inv-export-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: white; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 0.82rem; font-weight: 600; color: #374151; cursor: pointer; transition: all 0.15s; }
        .inv-export-btn:hover { border-color: #F97316; color: #F97316; }
        .inv-refresh-btn { width: 38px; height: 38px; border-radius: 10px; border: 1px solid #E5E7EB; background: white; color: #6B7280; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .inv-refresh-btn:hover { border-color: #F97316; color: #F97316; }
        .inv-status-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .inv-status-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 600; }
        .inv-chip-count { font-weight: 800; }
        .inv-filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .inv-search-wrap { position: relative; flex: 1; min-width: 220px; }
        .inv-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9CA3AF; }
        .inv-search { width: 100%; padding: 9px 12px 9px 36px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 0.88rem; outline: none; }
        .inv-search:focus { border-color: #F97316; }
        .inv-select { padding: 9px 14px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 0.82rem; color: #374151; outline: none; background: white; cursor: pointer; }
        .inv-select:focus { border-color: #F97316; }
        .inv-table-wrap { background: white; border: 1px solid #E5E7EB; border-radius: 16px; overflow-x: auto; }
        .inv-table { width: 100%; border-collapse: collapse; }
        .inv-table th { padding: 12px 14px; text-align: left; font-size: 0.75rem; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; background: #F9FAFB; border-bottom: 1px solid #E5E7EB; white-space: nowrap; user-select: none; }
        .inv-table th:hover { color: #F97316; }
        .inv-table td { padding: 12px 14px; font-size: 0.84rem; color: #374151; border-bottom: 1px solid #F3F4F6; }
        .inv-table tr:hover td { background: #FFFBF5; }
        .inv-sku { font-family: monospace; font-size: 0.78rem; color: #6B7280; }
        .inv-product-name { font-weight: 600; color: #111827; max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .inv-price { font-weight: 600; white-space: nowrap; }
        .inv-location { font-family: monospace; font-size: 0.78rem; }
        .inv-stock-cell { display: flex; flex-direction: column; gap: 4px; min-width: 70px; }
        .inv-stock-bar { height: 4px; background: #F3F4F6; border-radius: 2px; overflow: hidden; }
        .inv-stock-bar-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
        .inv-status-badge { font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; text-transform: capitalize; white-space: nowrap; }
        .inv-pagination { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; flex-wrap: wrap; gap: 12px; }
        .inv-page-info { font-size: 0.82rem; color: #6B7280; }
        .inv-page-btns { display: flex; gap: 4px; }
        .inv-page-btns button { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #E5E7EB; background: white; color: #374151; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .inv-page-btns button:hover:not(:disabled) { border-color: #F97316; color: #F97316; }
        .inv-page-btns button.active { background: #F97316; color: white; border-color: #F97316; }
        .inv-page-btns button:disabled { opacity: 0.4; cursor: not-allowed; }
        @media (max-width: 768px) { .inv-page { padding: 20px 16px; } .inv-filters { flex-direction: column; } }
      `}</style>
    </>
  );
}
