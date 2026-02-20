import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, AlertTriangle, Printer, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { ownerAPI } from '../../services/api';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
const fmtShort = (v) => { if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`; if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`; if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`; return `₹${v}`; };
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setTopProducts(topRes.data);
      setCategoryData(catRes.data);
      setPaymentMethods(payRes.data);
      setStatusDistribution(statusRes.data);
      setLowStockProducts(lowStockRes.data);
      setRecentOrders(ordersRes.data.results || ordersRes.data);
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
            {/* Monthly Revenue Bar Chart */}
            <div className="an-chart-card">
              <h3 className="an-card-title">Monthly Revenue vs Profit</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={fmtShort} />
                  <Tooltip formatter={(v) => fmt(v)} labelStyle={{ fontWeight: 600, color: '#1e293b' }} contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Methods Pie */}
            <div className="an-chart-card">
              <h3 className="an-card-title">Revenue by Payment Method</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={paymentMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={45} paddingAngle={3}>
                    {paymentMethods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Trend */}
          <div className="an-chart-card">
            <h3 className="an-card-title">Daily Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueTrend} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => v.substring(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={fmtShort} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }} />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="an-content">
          <div className="an-grid-2">
            {/* Category Performance */}
            <div className="an-chart-card">
              <h3 className="an-card-title">Category Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={fmtShort} />
                  <YAxis type="category" dataKey="category_name" tick={{ fontSize: 11, fill: '#374151' }} width={100} />
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="total_revenue" name="Revenue" fill="#F97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products */}
            <div className="an-chart-card">
              <h3 className="an-card-title">Top Products by Revenue</h3>
              <div className="an-top-list">
                {topProducts.slice(0, 5).map((p, i) => (
                  <div key={p.product_id} className="an-top-item">
                    <span className="an-top-rank">{i + 1}</span>
                    <div className="an-top-info">
                      <span className="an-top-name">{p.name}</span>
                      <span className="an-top-meta">{p.brand} · {p.total_quantity_sold.toLocaleString('en-IN')} sold</span>
                    </div>
                    <span className="an-top-revenue">{fmt(p.total_revenue)}</span>
                  </div>
                ))}
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
            {/* Order Status Distribution */}
            <div className="an-chart-card">
              <h3 className="an-card-title">Order Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={45} paddingAngle={3}>
                    {statusDistribution.map((entry, i) => {
                      const colorMap = { Pending: '#F59E0B', Processing: '#3B82F6', Shipped: '#8B5CF6', Delivered: '#10B981', Cancelled: '#EF4444' };
                      return <Cell key={i} fill={colorMap[entry.name] || COLORS[i]} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue per Order */}
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
        }
        @media (max-width: 540px) {
          .owner-an-summary { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
