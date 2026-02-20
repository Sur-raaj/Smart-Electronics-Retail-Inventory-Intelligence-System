import { useState, useEffect, useCallback, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, AlertTriangle, Printer, Download, RefreshCw, AlertCircle, SlidersHorizontal } from 'lucide-react';
import { ownerAPI } from '../../services/api';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
const fmtShort = (v) => { if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`; if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`; return `₹${v}`; };
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Interactive filter states ──
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [revenueRange, setRevenueRange] = useState([0, 100]);
  const [maxRevenueValue, setMaxRevenueValue] = useState(100);

  // API data states
  const [summary, setSummary] = useState({ total_revenue: 0, total_profit: 0, total_orders: 0 });
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryRes, trendRes, monthlyRes, topRes, catRes, payRes, statusRes, lowStockRes, ordersRes] = await Promise.all([
        ownerAPI.getSalesOverview(),
        ownerAPI.getRevenueTrend(),
        ownerAPI.getRevenueTrend({ period: 'monthly' }),
        ownerAPI.getTopProducts(),
        ownerAPI.getCategoryPerformance(),
        ownerAPI.getPaymentMethodStats(),
        ownerAPI.getOrderStatusStats(),
        ownerAPI.getLowStockProducts(),
        ownerAPI.getAllOrders({ page_size: 6, ordering: '-order_date' }),
      ]);
      setSummary(summaryRes.data);
      setRevenueTrend(trendRes.data);
      setMonthlyRevenue(monthlyRes.data);
      const top = topRes.data;
      setTopProducts(top);
      setCategoryData(catRes.data);
      setPaymentMethods(payRes.data);
      setStatusDistribution(statusRes.data);
      setLowStockProducts(lowStockRes.data);
      setRecentOrders(ordersRes.data.results || ordersRes.data);
      // Set slider max from top product revenue
      if (top.length) {
        const maxRev = Math.max(...top.map((p) => p.total_revenue));
        setMaxRevenueValue(maxRev);
        setRevenueRange([0, maxRev]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalRevenue = summary.total_revenue || 0;
  const totalProfit = summary.total_profit || 0;
  const totalOrders = summary.total_orders || 0;

  // Derive unique categories for dropdown
  const categoryOptions = useMemo(() => {
    const cats = [...new Set(topProducts.map((p) => p.category))].filter(Boolean);
    return cats;
  }, [topProducts]);

  // Filtered top products based on dropdown + slider
  const filteredTopProducts = useMemo(() => {
    return topProducts.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (p.total_revenue < revenueRange[0] || p.total_revenue > revenueRange[1]) return false;
      return true;
    });
  }, [topProducts, selectedCategory, revenueRange]);

  const tabs = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'products', label: 'Products' },
    { key: 'orders', label: 'Orders' },
  ];

  return (
    <div className="owner-an">
      {/* Header */}
      <div className="owner-an-header">
        <div>
          <h1 className="owner-an-title">Analytics & Reports</h1>
          <p className="owner-an-sub">Insights into your store performance</p>
        </div>
        <div className="owner-an-actions">
          <button className="an-action-btn" onClick={fetchData} disabled={loading}><RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh</button>
          <button className="an-action-btn" onClick={() => window.print()}><Printer size={16} /> Print</button>
          <button className="an-action-btn primary"><Download size={16} /> Export</button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="owner-an-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={fetchData} className="an-retry-btn">Retry</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="owner-an-summary">
        <div className="an-sum-card">
          <div className="an-sum-icon" style={{ background: '#3B82F6' }}><DollarSign size={20} color="#fff" /></div>
          <div><span className="an-sum-label">Total Revenue</span><span className="an-sum-value">{fmt(totalRevenue)}</span></div>
        </div>
        <div className="an-sum-card">
          <div className="an-sum-icon" style={{ background: '#10B981' }}><TrendingUp size={20} color="#fff" /></div>
          <div><span className="an-sum-label">Total Profit</span><span className="an-sum-value">{fmt(totalProfit)}</span></div>
        </div>
        <div className="an-sum-card">
          <div className="an-sum-icon" style={{ background: '#8B5CF6' }}><Users size={20} color="#fff" /></div>
          <div><span className="an-sum-label">Total Orders</span><span className="an-sum-value">{totalOrders.toLocaleString('en-IN')}</span></div>
        </div>
        <div className="an-sum-card">
          <div className="an-sum-icon" style={{ background: '#F97316' }}><Package size={20} color="#fff" /></div>
          <div><span className="an-sum-label">Low Stock Items</span><span className="an-sum-value">{lowStockProducts.length}</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="owner-an-tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`an-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="an-content">
          <div className="an-grid-2">
            {/* Monthly Revenue Bar Chart — Plotly */}
            <div className="an-chart-card">
              <h3 className="an-card-title">Monthly Revenue vs Profit</h3>
              <Plot
                data={[
                  { x: monthlyRevenue.map((d) => d.month), y: monthlyRevenue.map((d) => d.revenue), type: 'bar', name: 'Revenue', marker: { color: '#3B82F6', cornerradius: 4 }, hovertemplate: '<b>%{x}</b><br>Revenue: ₹%{y:,.0f}<extra></extra>' },
                  { x: monthlyRevenue.map((d) => d.month), y: monthlyRevenue.map((d) => d.profit), type: 'bar', name: 'Profit', marker: { color: '#10B981', cornerradius: 4 }, hovertemplate: '<b>%{x}</b><br>Profit: ₹%{y:,.0f}<extra></extra>' },
                ]}
                layout={{ autosize: true, height: 300, margin: { t: 10, r: 10, b: 40, l: 60 }, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { family: 'inherit', size: 11, color: '#9ca3af' }, barmode: 'group', xaxis: { showgrid: false }, yaxis: { gridcolor: '#e5e7eb', tickprefix: '₹', separatethousands: true }, legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' }, hovermode: 'x unified' }}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler style={{ width: '100%' }}
              />
            </div>

            {/* Payment Methods Pie — Plotly */}
            <div className="an-chart-card">
              <h3 className="an-card-title">Revenue by Payment Method</h3>
              <Plot
                data={[{
                  labels: paymentMethods.map((d) => d.name),
                  values: paymentMethods.map((d) => d.value),
                  type: 'pie', hole: 0.4,
                  marker: { colors: COLORS.slice(0, paymentMethods.length) },
                  hovertemplate: '<b>%{label}</b><br>₹%{value:,.0f}<br>%{percent}<extra></extra>',
                  textinfo: 'label+percent', textposition: 'outside', textfont: { size: 11 },
                }]}
                layout={{ autosize: true, height: 300, margin: { t: 10, r: 10, b: 10, l: 10 }, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { family: 'inherit', size: 11 }, showlegend: true, legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center', font: { size: 10, color: '#4b5563' } } }}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Daily Trend — Plotly */}
          <div className="an-chart-card">
            <h3 className="an-card-title">Daily Revenue Trend</h3>
            <Plot
              data={[
                { x: revenueTrend.map((d) => d.period), y: revenueTrend.map((d) => d.revenue), type: 'scatter', mode: 'lines', name: 'Revenue', line: { color: '#3B82F6', width: 2, shape: 'spline' }, hovertemplate: '<b>%{x}</b><br>Revenue: ₹%{y:,.0f}<extra></extra>' },
                { x: revenueTrend.map((d) => d.period), y: revenueTrend.map((d) => d.profit), type: 'scatter', mode: 'lines', name: 'Profit', line: { color: '#10B981', width: 2, shape: 'spline' }, hovertemplate: '<b>%{x}</b><br>Profit: ₹%{y:,.0f}<extra></extra>' },
              ]}
              layout={{ autosize: true, height: 280, margin: { t: 10, r: 20, b: 40, l: 60 }, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { family: 'inherit', size: 11, color: '#9ca3af' }, xaxis: { showgrid: false, tickangle: -30 }, yaxis: { gridcolor: '#e5e7eb', tickprefix: '₹', separatethousands: true }, legend: { orientation: 'h', y: -0.22, x: 0.5, xanchor: 'center' }, hovermode: 'x unified' }}
              config={{ responsive: true, displayModeBar: false }}
              useResizeHandler style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="an-content">
          {/* ── Interactive Filters: Dropdown + Slider ── */}
          <div className="an-filters-bar">
            <SlidersHorizontal size={16} color="#6b7280" />
            <span className="an-filters-label">Filters:</span>

            {/* Category Dropdown */}
            <div className="an-filter-group">
              <label className="an-filter-lbl">Category</label>
              <select className="an-filter-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Revenue Range Slider */}
            <div className="an-filter-group slider-group">
              <label className="an-filter-lbl">Min Revenue: {fmtShort(revenueRange[0])}</label>
              <input type="range" className="an-filter-slider" min={0} max={maxRevenueValue} step={Math.max(1, Math.round(maxRevenueValue / 100))} value={revenueRange[0]} onChange={(e) => setRevenueRange([Number(e.target.value), revenueRange[1]])} />
            </div>
            <div className="an-filter-group slider-group">
              <label className="an-filter-lbl">Max Revenue: {fmtShort(revenueRange[1])}</label>
              <input type="range" className="an-filter-slider" min={0} max={maxRevenueValue} step={Math.max(1, Math.round(maxRevenueValue / 100))} value={revenueRange[1]} onChange={(e) => setRevenueRange([revenueRange[0], Number(e.target.value)])} />
            </div>

            <button className="an-filter-reset" onClick={() => { setSelectedCategory('all'); setRevenueRange([0, maxRevenueValue]); }}>Reset</button>
          </div>

          <div className="an-grid-2">
            {/* Category Performance — Plotly horizontal bar */}
            <div className="an-chart-card">
              <h3 className="an-card-title">Category Performance</h3>
              <Plot
                data={[{
                  y: categoryData.map((d) => d.category_name),
                  x: categoryData.map((d) => d.total_revenue),
                  type: 'bar', orientation: 'h', name: 'Revenue',
                  marker: { color: '#F97316', cornerradius: 4 },
                  hovertemplate: '<b>%{y}</b><br>Revenue: ₹%{x:,.0f}<extra></extra>',
                }]}
                layout={{ autosize: true, height: 300, margin: { t: 0, r: 20, b: 30, l: 110 }, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { family: 'inherit', size: 11, color: '#374151' }, xaxis: { gridcolor: '#e5e7eb', tickprefix: '₹', separatethousands: true }, yaxis: { autorange: 'reversed' } }}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler style={{ width: '100%' }}
              />
            </div>

            {/* Top Products (filtered) */}
            <div className="an-chart-card">
              <h3 className="an-card-title">Top Products by Revenue {selectedCategory !== 'all' ? `(${selectedCategory})` : ''}</h3>
              <div className="an-top-list">
                {filteredTopProducts.slice(0, 5).map((p, i) => (
                  <div key={p.product_id} className="an-top-item">
                    <span className="an-top-rank">{i + 1}</span>
                    <div className="an-top-info">
                      <span className="an-top-name">{p.name}</span>
                      <span className="an-top-meta">{p.brand} · {p.total_quantity_sold.toLocaleString('en-IN')} sold</span>
                    </div>
                    <span className="an-top-revenue">{fmt(p.total_revenue)}</span>
                  </div>
                ))}
                {filteredTopProducts.length === 0 && <p className="an-no-data">No products match current filters</p>}
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="an-chart-card">
            <h3 className="an-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} color="#CA8A04" /> Low Stock Items ({lowStockProducts.length})
            </h3>
            <div className="an-low-stock-table">
              <table className="owner-om-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.6rem 0.75rem', background: '#f9fafb', color: '#6b7280', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e5e7eb' }}>Product</th>
                    <th style={{ padding: '0.6rem 0.75rem', background: '#f9fafb', color: '#6b7280', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e5e7eb' }}>Category</th>
                    <th style={{ padding: '0.6rem 0.75rem', background: '#f9fafb', color: '#6b7280', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>Stock</th>
                    <th style={{ padding: '0.6rem 0.75rem', background: '#f9fafb', color: '#6b7280', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>Reorder Level</th>
                    <th style={{ padding: '0.6rem 0.75rem', background: '#f9fafb', color: '#6b7280', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.product_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#1e293b' }}>{p.name}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#6b7280' }}>{p.category_name}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700, color: p.stock_quantity === 0 ? '#dc2626' : '#ca8a04' }}>{p.stock_quantity}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#6b7280' }}>{p.reorder_level}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 20, background: p.stock_quantity === 0 ? '#FEE2E2' : '#FEF3C7', color: p.stock_quantity === 0 ? '#DC2626' : '#CA8A04' }}>
                          {p.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="an-content">
          <div className="an-grid-2">
            {/* Order Status Distribution — Plotly Pie */}
            <div className="an-chart-card">
              <h3 className="an-card-title">Order Status Distribution</h3>
              <Plot
                data={[{
                  labels: statusDistribution.map((d) => d.name),
                  values: statusDistribution.map((d) => d.value),
                  type: 'pie', hole: 0.4,
                  marker: { colors: statusDistribution.map((d) => ({ Pending: '#F59E0B', Processing: '#3B82F6', Shipped: '#8B5CF6', Delivered: '#10B981', Cancelled: '#EF4444' }[d.name] || COLORS[0])) },
                  hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>%{percent}<extra></extra>',
                  textinfo: 'label+percent', textposition: 'outside', textfont: { size: 11 },
                }]}
                layout={{ autosize: true, height: 300, margin: { t: 10, r: 10, b: 10, l: 10 }, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { family: 'inherit', size: 11 }, showlegend: true, legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center', font: { size: 10, color: '#4b5563' } } }}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler style={{ width: '100%' }}
              />
            </div>

            {/* Recent Orders */}
            <div className="an-chart-card">
              <h3 className="an-card-title">Orders Summary</h3>
              <div className="an-top-list">
                {recentOrders.slice(0, 6).map((o) => {
                  const sc = { Pending: '#CA8A04', Processing: '#2563EB', Shipped: '#7C3AED', Delivered: '#16A34A', Cancelled: '#DC2626' };
                  return (
                    <div key={o.id} className="an-top-item">
                      <span className="an-order-id">#{o.id}</span>
                      <div className="an-top-info">
                        <span className="an-top-name">{o.user_name}</span>
                        <span className="an-top-meta">{new Date(o.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <span className="an-top-status" style={{ color: sc[o.status] }}>{o.status}</span>
                      <span className="an-top-revenue">{fmt(o.grand_total)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .owner-an { min-height: calc(100vh - 120px); background: #F3F4F6; padding: 2rem; }
        .owner-an-header { max-width: 1280px; margin: 0 auto 1.5rem; display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; }
        .owner-an-title { font-size: 1.65rem; font-weight: 800; color: #1e293b; margin: 0; }
        .owner-an-sub { font-size: 0.88rem; color: #6b7280; margin-top: 0.2rem; }
        .owner-an-actions { display: flex; gap: 0.5rem; }
        .an-action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.82rem; cursor: pointer; font-family: inherit; border: 1.5px solid #d1d5db; background: #fff; color: #4b5563; transition: all 0.15s; }
        .an-action-btn:hover { border-color: #9ca3af; background: #f3f4f6; }
        .an-action-btn.primary { background: #F97316; color: #fff; border-color: #F97316; }
        .an-action-btn.primary:hover { background: #ea580c; }
        .spin { animation: spinAnim 1s linear infinite; }
        @keyframes spinAnim { from { transform: rotate(0); } to { transform: rotate(360deg); } }

        /* Error */
        .owner-an-error { max-width: 1280px; margin: 0 auto 1.25rem; display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1.25rem; border-radius: 10px; background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; font-size: 0.85rem; font-weight: 500; }
        .an-retry-btn { margin-left: auto; padding: 0.35rem 0.85rem; border-radius: 6px; background: #DC2626; color: #fff; font-weight: 600; font-size: 0.78rem; border: none; cursor: pointer; font-family: inherit; }
        .an-retry-btn:hover { background: #b91c1c; }

        /* Summary */
        .owner-an-summary { max-width: 1280px; margin: 0 auto 1.5rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
        .an-sum-card { background: #fff; padding: 1.15rem; border-radius: 12px; border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 0.85rem; }
        .an-sum-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .an-sum-label { display: block; font-size: 0.72rem; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.03em; }
        .an-sum-value { display: block; font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-top: 1px; }

        /* Tabs */
        .owner-an-tabs { max-width: 1280px; margin: 0 auto 1.25rem; display: flex; gap: 0; background: #fff; border-radius: 10px; border: 1px solid #e5e7eb; overflow: hidden; }
        .an-tab { flex: 1; padding: 0.65rem 1rem; text-align: center; font-weight: 600; font-size: 0.85rem; color: #6b7280; background: transparent; border: none; cursor: pointer; font-family: inherit; transition: all 0.15s; border-bottom: 2px solid transparent; }
        .an-tab:hover { color: #1e293b; background: #f9fafb; }
        .an-tab.active { color: #F97316; border-bottom-color: #F97316; background: #FFF7ED; }

        /* Content */
        .an-content { max-width: 1280px; margin: 0 auto; }
        .an-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
        .an-chart-card { background: #fff; padding: 1.5rem; border-radius: 14px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .an-card-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem; }

        /* Filters Bar */
        .an-filters-bar {
          max-width: 1280px; margin: 0 auto 1.25rem;
          display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
          background: #fff; padding: 0.85rem 1.25rem; border-radius: 12px;
          border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .an-filters-label { font-size: 0.82rem; font-weight: 700; color: #374151; }
        .an-filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
        .an-filter-lbl { font-size: 0.7rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.03em; }
        .an-filter-select {
          padding: 0.4rem 0.75rem; border-radius: 8px; border: 1.5px solid #d1d5db;
          font-size: 0.82rem; font-family: inherit; color: #1e293b; background: #fff;
          cursor: pointer; min-width: 160px;
        }
        .an-filter-select:focus { outline: none; border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
        .slider-group { min-width: 150px; }
        .an-filter-slider {
          width: 100%; height: 6px; border-radius: 3px; -webkit-appearance: none; appearance: none;
          background: linear-gradient(to right, #F97316, #3B82F6); outline: none; cursor: pointer;
        }
        .an-filter-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
          background: #fff; border: 2px solid #F97316; cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .an-filter-slider::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff; border: 2px solid #F97316; cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .an-filter-reset {
          padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.78rem; font-weight: 600;
          border: 1.5px solid #d1d5db; background: #fff; color: #6b7280; cursor: pointer;
          font-family: inherit; transition: all 0.15s; margin-left: auto;
        }
        .an-filter-reset:hover { border-color: #F97316; color: #F97316; background: #FFF7ED; }

        .an-no-data { text-align: center; color: #9ca3af; font-size: 0.85rem; padding: 1.5rem 0; }

        /* Top List */
        .an-top-list { display: flex; flex-direction: column; gap: 0; }
        .an-top-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0; border-bottom: 1px solid #f3f4f6; }
        .an-top-item:last-child { border-bottom: none; }
        .an-top-rank { width: 26px; height: 26px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; color: #6b7280; flex-shrink: 0; }
        .an-order-id { font-weight: 700; color: #1e293b; font-size: 0.82rem; min-width: 50px; }
        .an-top-info { flex: 1; min-width: 0; }
        .an-top-name { display: block; font-weight: 600; color: #1e293b; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .an-top-meta { display: block; font-size: 0.7rem; color: #9ca3af; }
        .an-top-revenue { font-weight: 700; color: #1e293b; font-size: 0.85rem; white-space: nowrap; }
        .an-top-status { font-weight: 600; font-size: 0.78rem; white-space: nowrap; }
        .an-low-stock-table { overflow-x: auto; }

        @media (max-width: 900px) {
          .owner-an { padding: 1.25rem; }
          .owner-an-summary { grid-template-columns: 1fr 1fr; }
          .an-grid-2 { grid-template-columns: 1fr; }
          .an-filters-bar { flex-direction: column; align-items: stretch; }
        }
        @media (max-width: 540px) {
          .owner-an-summary { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
