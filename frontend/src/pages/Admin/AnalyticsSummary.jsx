import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, DollarSign, TrendingUp, Users, ShoppingCart, BarChart3 } from 'lucide-react';
import Plot from 'react-plotly.js';
import { adminAPI } from '../../services/api';
import SystemStatsCard from '../../components/admin/SystemStatsCard';

export default function AnalyticsSummary() {
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [revenueByOwner, setRevenueByOwner] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { days: timeRange };
      const [revRes, ownerRes, trendRes, catRes, custRes, growthRes] = await Promise.all([
        adminAPI.getRevenueSummary(params),
        adminAPI.getRevenueByOwner(params),
        adminAPI.getRevenueTrend(params),
        adminAPI.getCategoryPerformance(params),
        adminAPI.getCustomerAnalytics(params),
        adminAPI.getUserGrowth(params),
      ]);
      setRevenueSummary(revRes.data);
      setRevenueByOwner(ownerRes.data);
      setRevenueTrend(trendRes.data);
      setCategoryPerformance(catRes.data);
      setCustomerAnalytics(custRes.data);
      setUserGrowth(growthRes.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="an-loading">
        <RefreshCw size={32} className="an-spin" />
        <p>Loading analytics...</p>
        <style>{`
          .an-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: #64748b; gap: 12px; }
          .an-spin { animation: anSpin 1s linear infinite; }
          @keyframes anSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="an-error">
        <p>{error}</p>
        <button onClick={fetchData} className="an-retry"><RefreshCw size={16} /> Retry</button>
        <style>{`
          .an-error { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: #dc2626; gap: 12px; }
          .an-retry { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: #dc2626; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
        `}</style>
      </div>
    );
  }

  const revenueCards = [
    { title: 'Total Revenue', value: revenueSummary?.total_revenue, change: revenueSummary?.revenue_growth, changeLabel: 'vs previous period', icon: DollarSign, format: 'currency', color: '#16a34a' },
    { title: 'Total Orders', value: revenueSummary?.total_orders, change: revenueSummary?.order_growth, changeLabel: 'vs previous period', icon: ShoppingCart, color: '#2563eb' },
    { title: 'Avg Order Value', value: revenueSummary?.avg_order_value, change: revenueSummary?.aov_growth, changeLabel: 'vs previous period', icon: TrendingUp, format: 'currency', color: '#7c3aed' },
    { title: 'Active Customers', value: customerAnalytics?.active_customers, change: customerAnalytics?.customer_growth, changeLabel: 'vs previous period', icon: Users, color: '#ea580c' },
  ];

  // Revenue by owner chart
  const ownerNames = revenueByOwner.map(o => o.owner_name || o.name);
  const ownerRevenues = revenueByOwner.map(o => o.revenue || 0);

  // Revenue trend (multi-line if available)
  const trendDates = revenueTrend.map(d => d.date);
  const trendRevenue = revenueTrend.map(d => d.revenue || 0);
  const trendOrders = revenueTrend.map(d => d.orders || 0);

  // Category performance
  const catNames = categoryPerformance.map(c => c.name);
  const catRevenues = categoryPerformance.map(c => c.revenue || 0);
  const catOrders = categoryPerformance.map(c => c.order_count || 0);

  // User growth
  const growthDates = userGrowth.map(d => d.date);
  const growthCustomers = userGrowth.map(d => d.customers || 0);
  const growthOwners = userGrowth.map(d => d.owners || 0);

  return (
    <div className="an-page">
      <div className="an-header">
        <div>
          <h1 className="an-title">Analytics Summary</h1>
          <p className="an-sub">Cross-platform performance metrics</p>
        </div>
        <div className="an-header-actions">
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="an-range-select">
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <button className="an-refresh-btn" onClick={fetchData}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="an-kpis">
        {revenueCards.map((c, i) => <SystemStatsCard key={i} {...c} />)}
      </div>

      <div className="an-charts-row">
        <div className="an-chart-card">
          <h3 className="an-chart-title">Revenue by Owner</h3>
          <Plot
            data={[{
              type: 'bar',
              x: ownerNames,
              y: ownerRevenues,
              marker: {
                color: ownerRevenues.map((_, i) => ['#6366f1', '#2563eb', '#0891b2', '#16a34a', '#ea580c', '#dc2626', '#7c3aed', '#db2777'][i % 8]),
                cornerradius: 6,
              },
              text: ownerRevenues.map(r => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(r)),
              textposition: 'outside',
              textfont: { size: 10, color: '#475569' },
              hovertemplate: '<b>%{x}</b><br>Revenue: ₹%{y:,.0f}<extra></extra>',
            }]}
            layout={{
              height: 320,
              margin: { t: 20, b: 60, l: 60, r: 20 },
              xaxis: { tickangle: -30, tickfont: { size: 11 } },
              yaxis: { showgrid: true, gridcolor: '#f1f5f9', tickfont: { size: 10 } },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>

        <div className="an-chart-card">
          <h3 className="an-chart-title">Revenue & Orders Trend</h3>
          <Plot
            data={[
              {
                type: 'scatter',
                mode: 'lines',
                name: 'Revenue',
                x: trendDates,
                y: trendRevenue,
                line: { color: '#16a34a', width: 2, shape: 'spline' },
                fill: 'tozeroy',
                fillcolor: 'rgba(22,163,74,0.06)',
                hovertemplate: 'Revenue: ₹%{y:,.0f}<extra></extra>',
                yaxis: 'y',
              },
              {
                type: 'scatter',
                mode: 'lines',
                name: 'Orders',
                x: trendDates,
                y: trendOrders,
                line: { color: '#2563eb', width: 2, dash: 'dot', shape: 'spline' },
                hovertemplate: 'Orders: %{y}<extra></extra>',
                yaxis: 'y2',
              },
            ]}
            layout={{
              height: 320,
              margin: { t: 20, b: 40, l: 60, r: 60 },
              xaxis: { showgrid: false, tickfont: { size: 10 } },
              yaxis: { title: { text: 'Revenue (₹)', font: { size: 11 } }, showgrid: true, gridcolor: '#f1f5f9', tickfont: { size: 10 } },
              yaxis2: { title: { text: 'Orders', font: { size: 11 } }, overlaying: 'y', side: 'right', showgrid: false, tickfont: { size: 10 } },
              legend: { orientation: 'h', y: -0.15, font: { size: 11 } },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="an-charts-row">
        <div className="an-chart-card">
          <h3 className="an-chart-title">Category Performance</h3>
          <Plot
            data={[
              {
                type: 'bar',
                name: 'Revenue',
                x: catNames,
                y: catRevenues,
                marker: { color: '#6366f1', cornerradius: 4 },
                hovertemplate: '<b>%{x}</b><br>Revenue: ₹%{y:,.0f}<extra></extra>',
                yaxis: 'y',
              },
              {
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Orders',
                x: catNames,
                y: catOrders,
                line: { color: '#dc2626', width: 2 },
                marker: { size: 6, color: '#dc2626' },
                hovertemplate: '<b>%{x}</b><br>Orders: %{y}<extra></extra>',
                yaxis: 'y2',
              },
            ]}
            layout={{
              height: 320,
              margin: { t: 20, b: 60, l: 60, r: 60 },
              xaxis: { tickangle: -30, tickfont: { size: 11 } },
              yaxis: { title: { text: 'Revenue', font: { size: 11 } }, showgrid: true, gridcolor: '#f1f5f9' },
              yaxis2: { title: { text: 'Orders', font: { size: 11 } }, overlaying: 'y', side: 'right', showgrid: false },
              legend: { orientation: 'h', y: -0.2, font: { size: 11 } },
              barmode: 'group',
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>

        <div className="an-chart-card">
          <h3 className="an-chart-title">User Growth</h3>
          <Plot
            data={[
              {
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Customers',
                x: growthDates,
                y: growthCustomers,
                line: { color: '#6366f1', width: 2, shape: 'spline' },
                marker: { size: 4 },
                fill: 'tozeroy',
                fillcolor: 'rgba(99,102,241,0.06)',
                hovertemplate: 'Customers: %{y}<extra></extra>',
              },
              {
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Owners',
                x: growthDates,
                y: growthOwners,
                line: { color: '#ea580c', width: 2, shape: 'spline' },
                marker: { size: 4 },
                hovertemplate: 'Owners: %{y}<extra></extra>',
              },
            ]}
            layout={{
              height: 320,
              margin: { t: 20, b: 40, l: 40, r: 20 },
              xaxis: { showgrid: false, tickfont: { size: 10 } },
              yaxis: { showgrid: true, gridcolor: '#f1f5f9', tickfont: { size: 10 } },
              legend: { orientation: 'h', y: -0.15, font: { size: 11 } },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {customerAnalytics && (
        <div className="an-customer-section">
          <h3 className="an-section-title">Customer Insights</h3>
          <div className="an-customer-grid">
            <div className="an-insight-card">
              <span className="an-insight-label">Repeat Purchase Rate</span>
              <span className="an-insight-val">{customerAnalytics.repeat_rate || 0}%</span>
            </div>
            <div className="an-insight-card">
              <span className="an-insight-label">Avg Lifetime Value</span>
              <span className="an-insight-val">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(customerAnalytics.avg_lifetime_value || 0)}</span>
            </div>
            <div className="an-insight-card">
              <span className="an-insight-label">Cart Abandonment</span>
              <span className="an-insight-val">{customerAnalytics.cart_abandonment_rate || 0}%</span>
            </div>
            <div className="an-insight-card">
              <span className="an-insight-label">Avg Reviews/Product</span>
              <span className="an-insight-val">{customerAnalytics.avg_reviews_per_product || 0}</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .an-page { padding: 28px 32px 48px; max-width: 1440px; margin: 0 auto; }
        .an-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .an-title { margin: 0; font-size: 26px; font-weight: 700; color: #1e293b; }
        .an-sub { margin: 4px 0 0; font-size: 14px; color: #64748b; }
        .an-header-actions { display: flex; gap: 10px; align-items: center; }
        .an-range-select {
          padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px;
          font-size: 13px; outline: none; background: #fff; color: #475569; cursor: pointer;
        }
        .an-range-select:focus { border-color: #dc2626; }
        .an-refresh-btn {
          display: flex; align-items: center; gap: 6px; padding: 10px 18px;
          background: #dc2626; color: #fff; border: none; border-radius: 10px;
          font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .an-refresh-btn:hover { background: #b91c1c; }
        .an-kpis { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .an-charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        @media (max-width: 900px) { .an-charts-row { grid-template-columns: 1fr; } }
        .an-chart-card { background: #fff; border-radius: 14px; padding: 20px; border: 1px solid #e5e7eb; }
        .an-chart-title { margin: 0 0 14px; font-size: 15px; font-weight: 600; color: #1e293b; }
        .an-customer-section { margin-top: 8px; }
        .an-section-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 16px; }
        .an-customer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
        .an-insight-card {
          background: #fff; border-radius: 12px; padding: 18px 20px;
          border: 1px solid #e5e7eb; display: flex; flex-direction: column; gap: 6px;
        }
        .an-insight-label { font-size: 12px; color: #64748b; font-weight: 500; }
        .an-insight-val { font-size: 22px; font-weight: 700; color: #1e293b; }
      `}</style>
    </div>
  );
}
