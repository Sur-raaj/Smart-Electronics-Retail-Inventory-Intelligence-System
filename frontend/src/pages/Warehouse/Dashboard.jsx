import { useState, useEffect, useCallback, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Package, TrendingUp, AlertTriangle, Truck, Users, BarChart3, ArrowDownLeft, ArrowUpRight, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import StockLevelCard from '../../components/warehouse/StockLevelCard';
import OwnerFilter from '../../components/warehouse/OwnerFilter';
import AlertBadge from '../../components/warehouse/AlertBadge';
import { warehouseAPI } from '../../services/api';

export default function WarehouseDashboard() {
  const [ownerFilter, setOwnerFilter] = useState('');
  const [overview, setOverview] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [ownerData, setOwnerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = ownerFilter ? { owner: ownerFilter } : {};
      const [overviewRes, inventoryRes, alertsRes, movementsRes, deliveriesRes, catRes, ownerRes] = await Promise.all([
        warehouseAPI.getOverview(params),
        warehouseAPI.getInventoryItems({ ...params, page_size: 1000 }),
        warehouseAPI.getAlerts(params),
        warehouseAPI.getStockMovements({ ...params, page_size: 8, ordering: '-date' }),
        warehouseAPI.getRecentDeliveries(params),
        warehouseAPI.getStockByCategory(params),
        warehouseAPI.getStockByOwner(),
      ]);
      setOverview(overviewRes.data?.results || overviewRes.data);
      setInventory(inventoryRes.data?.results || inventoryRes.data || []);
      setAlerts(alertsRes.data?.results || alertsRes.data || []);
      setMovements(movementsRes.data?.results || movementsRes.data || []);
      setDeliveries(deliveriesRes.data?.results || deliveriesRes.data || []);
      setCategoryData(catRes.data?.results || catRes.data || []);
      setOwnerData(ownerRes.data?.results || ownerRes.data || []);
    } catch (err) {
      console.error('Failed to fetch warehouse dashboard data:', err);
      setError('Failed to load dashboard data. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [ownerFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalStock = useMemo(() => inventory.reduce((sum, i) => sum + (i.quantity_in_stock || 0), 0), [inventory]);
  const totalValue = useMemo(() => inventory.reduce((sum, i) => sum + (i.unit_price || 0) * (i.quantity_in_stock || 0), 0), [inventory]);
  const lowStockCount = useMemo(() => alerts.filter(a => a.severity === 'warning' || a.severity === 'critical').length, [alerts]);
  const outOfStockCount = useMemo(() => inventory.filter(i => i.status === 'out_of_stock').length, [inventory]);
  const formatNPR = (val) => `NPR ${(val / 1000000).toFixed(1)}M`;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#F97316' }} />
          <p style={{ marginTop: 12, color: '#6B7280', fontSize: '0.9rem' }}>Loading dashboard...</p>
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
          <button onClick={fetchData} style={{ padding: '10px 24px', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="wh-dashboard">
        <div className="wh-page-header">
          <div>
            <h1 className="wh-page-title">Warehouse Dashboard</h1>
            <p className="wh-page-subtitle">Real-time inventory overview & analytics</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <OwnerFilter value={ownerFilter} onChange={setOwnerFilter} />
            <button className="wh-refresh-btn" onClick={fetchData} title="Refresh data"><RefreshCw size={16} /></button>
          </div>
        </div>

        <div className="wh-stats-grid">
          <StockLevelCard title="Total Products" value={inventory.length} subtitle={`${totalStock} units in stock`} icon={Package} trend="up" color="#F97316" />
          <StockLevelCard title="Stock Value" value={formatNPR(totalValue)} subtitle="Total inventory valuation" icon={TrendingUp} color="#2563EB" />
          <StockLevelCard title="Low Stock Items" value={lowStockCount} subtitle={`${outOfStockCount} out of stock`} icon={AlertTriangle} trend="down" color="#D97706" />
          <StockLevelCard title="Pending Deliveries" value={Array.isArray(deliveries) ? deliveries.filter(d => d.status !== 'delivered').length : 0} subtitle="Shipments in transit" icon={Truck} color="#7C3AED" />
        </div>

        <div className="wh-charts-row">
          <div className="wh-chart-card">
            <h3 className="wh-card-title"><BarChart3 size={17} /> Stock by Category</h3>
            {categoryData.length > 0 ? (
              <Plot
                data={[{ type: 'bar', x: categoryData.map(c => c.category), y: categoryData.map(c => c.total_stock), marker: { color: categoryData.map((_, i) => ['#F97316','#2563EB','#16A34A','#7C3AED','#EC4899','#D97706','#0891B2','#6366F1','#DC2626','#059669','#8B5CF6','#F43F5E'][i % 12]), cornerradius: 6 }, hovertemplate: '<b>%{x}</b><br>Stock: %{y} units<extra></extra>' }]}
                layout={{ margin: { t: 10, b: 60, l: 50, r: 20 }, height: 280, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', xaxis: { tickangle: -30, tickfont: { size: 11, color: '#6B7280' }, gridcolor: '#F3F4F6' }, yaxis: { tickfont: { size: 11, color: '#6B7280' }, gridcolor: '#F3F4F6' }, hoverlabel: { bgcolor: '#1F2937', font: { color: 'white', size: 13 } } }}
                config={{ displayModeBar: false, responsive: true }} useResizeHandler style={{ width: '100%' }}
              />
            ) : <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 40 }}>No category data available</p>}
          </div>
          <div className="wh-chart-card">
            <h3 className="wh-card-title"><Users size={17} /> Stock by Owner</h3>
            {ownerData.length > 0 ? (
              <Plot
                data={[{ type: 'pie', labels: ownerData.map(o => o.owner), values: ownerData.map(o => o.total_stock), hole: 0.5, marker: { colors: ['#F97316','#2563EB','#16A34A','#7C3AED','#EC4899'] }, textinfo: 'percent', textfont: { size: 12, color: 'white' }, hovertemplate: '<b>%{label}</b><br>Stock: %{value} units<br>%{percent}<extra></extra>' }]}
                layout={{ margin: { t: 10, b: 10, l: 10, r: 10 }, height: 280, paper_bgcolor: 'transparent', showlegend: true, legend: { orientation: 'h', y: -0.1, font: { size: 11, color: '#6B7280' } }, hoverlabel: { bgcolor: '#1F2937', font: { color: 'white', size: 13 } } }}
                config={{ displayModeBar: false, responsive: true }} useResizeHandler style={{ width: '100%' }}
              />
            ) : <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 40 }}>No owner data available</p>}
          </div>
        </div>

        <div className="wh-bottom-row">
          <div className="wh-card wh-movements-card">
            <h3 className="wh-card-title">Recent Stock Movements</h3>
            <div className="wh-movements-list">
              {movements.length > 0 ? movements.map(m => {
                const isIn = m.type === 'stock_in' || m.type === 'returned';
                return (
                  <div key={m.id} className="wh-movement-item">
                    <div className={`wh-mvt-icon ${isIn ? 'in' : 'out'}`}>{isIn ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}</div>
                    <div className="wh-mvt-info"><p className="wh-mvt-name">{m.product_name}</p><p className="wh-mvt-meta">{m.reason}</p></div>
                    <div className="wh-mvt-right"><span className={`wh-mvt-qty ${isIn ? 'positive' : 'negative'}`}>{isIn ? '+' : '-'}{Math.abs(m.quantity)}</span><span className="wh-mvt-date">{m.date ? format(new Date(m.date), 'dd MMM') : ''}</span></div>
                  </div>
                );
              }) : <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20, fontSize: '0.85rem' }}>No movements found</p>}
            </div>
          </div>

          <div className="wh-card wh-alerts-card">
            <h3 className="wh-card-title"><AlertTriangle size={17} color="#D97706" /> Low Stock Alerts <span className="wh-alert-count">{alerts.length}</span></h3>
            <div className="wh-alerts-list">
              {alerts.length > 0 ? alerts.slice(0, 6).map(alert => (
                <div key={alert.id} className="wh-alert-item">
                  <div className="wh-alert-top"><span className="wh-alert-name">{alert.product_name}</span><AlertBadge severity={alert.severity} size="sm" /></div>
                  <div className="wh-alert-details"><span>Stock: <strong>{alert.current_stock}</strong></span><span className="wh-alert-sep">|</span><span>Reorder: {alert.reorder_level}</span><span className="wh-alert-sep">|</span><span>{alert.owner}</span></div>
                </div>
              )) : <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20, fontSize: '0.85rem' }}>No alerts</p>}
            </div>
          </div>

          <div className="wh-card wh-deliveries-card">
            <h3 className="wh-card-title"><Truck size={17} /> Recent Deliveries</h3>
            <div className="wh-deliveries-list">
              {Array.isArray(deliveries) && deliveries.length > 0 ? deliveries.slice(0, 6).map(del => {
                const sc = del.status === 'delivered' ? '#16A34A' : del.status === 'in_transit' ? '#2563EB' : '#D97706';
                return (
                  <div key={del.id} className="wh-delivery-item">
                    <div className="wh-del-info"><p className="wh-del-product">{del.product_summary}</p><p className="wh-del-supplier">{del.supplier} · {del.items_count} items</p></div>
                    <span className="wh-del-status" style={{ color: sc, background: `${sc}14` }}>{(del.status || '').replace('_', ' ')}</span>
                  </div>
                );
              }) : <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20, fontSize: '0.85rem' }}>No deliveries found</p>}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .wh-dashboard { padding: 28px 32px 40px; max-width: 1400px; margin: 0 auto; }
        .wh-page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .wh-page-title { margin: 0; font-size: 1.6rem; font-weight: 800; color: #111827; }
        .wh-page-subtitle { margin: 4px 0 0 0; font-size: 0.88rem; color: #6B7280; }
        .wh-refresh-btn { width: 38px; height: 38px; border-radius: 10px; border: 1px solid #E5E7EB; background: white; color: #6B7280; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .wh-refresh-btn:hover { border-color: #F97316; color: #F97316; }
        .wh-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
        .wh-charts-row { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; margin-bottom: 28px; }
        .wh-chart-card { background: white; border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; }
        .wh-card-title { margin: 0 0 16px 0; font-size: 0.95rem; font-weight: 700; color: #111827; display: flex; align-items: center; gap: 8px; }
        .wh-bottom-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
        .wh-card { background: white; border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; }
        .wh-movements-list { display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; }
        .wh-movement-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; background: #F9FAFB; transition: background 0.15s; }
        .wh-movement-item:hover { background: #F3F4F6; }
        .wh-mvt-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .wh-mvt-icon.in { background: #DCFCE7; color: #16A34A; }
        .wh-mvt-icon.out { background: #DBEAFE; color: #2563EB; }
        .wh-mvt-info { flex: 1; min-width: 0; }
        .wh-mvt-name { margin: 0; font-size: 0.82rem; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .wh-mvt-meta { margin: 2px 0 0; font-size: 0.72rem; color: #9CA3AF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .wh-mvt-right { text-align: right; flex-shrink: 0; }
        .wh-mvt-qty { display: block; font-weight: 700; font-size: 0.85rem; }
        .wh-mvt-qty.positive { color: #16A34A; } .wh-mvt-qty.negative { color: #DC2626; }
        .wh-mvt-date { font-size: 0.7rem; color: #9CA3AF; }
        .wh-alerts-list { display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; }
        .wh-alert-count { background: #FEF3C7; color: #D97706; font-size: 0.72rem; padding: 2px 8px; border-radius: 12px; margin-left: auto; }
        .wh-alert-item { padding: 10px 12px; border-radius: 10px; background: #F9FAFB; }
        .wh-alert-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
        .wh-alert-name { font-size: 0.82rem; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .wh-alert-details { font-size: 0.72rem; color: #6B7280; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .wh-alert-sep { color: #D1D5DB; }
        .wh-deliveries-list { display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; }
        .wh-delivery-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: #F9FAFB; gap: 10px; }
        .wh-del-info { flex: 1; min-width: 0; }
        .wh-del-product { margin: 0; font-size: 0.82rem; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .wh-del-supplier { margin: 2px 0 0; font-size: 0.72rem; color: #9CA3AF; }
        .wh-del-status { font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; text-transform: capitalize; white-space: nowrap; }
        @media (max-width: 1200px) { .wh-stats-grid { grid-template-columns: repeat(2, 1fr); } .wh-charts-row { grid-template-columns: 1fr; } .wh-bottom-row { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
