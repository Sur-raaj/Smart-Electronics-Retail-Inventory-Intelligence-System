import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Users, Package, ShoppingCart, DollarSign, Truck, Activity } from 'lucide-react';
import Plot from 'react-plotly.js';
import { adminAPI } from '../../services/api';
import SystemStatsCard from '../../components/admin/SystemStatsCard';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [usersByRole, setUsersByRole] = useState([]);
  const [registrationTrend, setRegistrationTrend] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [supplierPerformance, setSupplierPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, roleRes, trendRes, actRes, suppRes] = await Promise.all([
        adminAPI.getSystemOverview(),
        adminAPI.getUsersByRole(),
        adminAPI.getRegistrationTrend({ days: 30 }),
        adminAPI.getRecentActivity({ limit: 10 }),
        adminAPI.getSupplierPerformance({ limit: 5 }),
      ]);
      setOverview(ovRes.data);
      setUsersByRole(roleRes.data);
      setRegistrationTrend(trendRes.data);
      setRecentActivity(actRes.data);
      setSupplierPerformance(suppRes.data);
    } catch (err) {
      console.error('Admin dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="adm-loading">
        <RefreshCw size={32} className="adm-spin" />
        <p>Loading admin dashboard...</p>
        <style>{`
          .adm-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: #64748b; gap: 12px; }
          .adm-spin { animation: admSpin 1s linear infinite; }
          @keyframes admSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adm-error">
        <p>{error}</p>
        <button onClick={fetchData} className="adm-retry-btn">
          <RefreshCw size={16} /> Retry
        </button>
        <style>{`
          .adm-error { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: #dc2626; gap: 12px; }
          .adm-retry-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: #dc2626; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
          .adm-retry-btn:hover { background: #b91c1c; }
        `}</style>
      </div>
    );
  }

  const stats = [
    { title: 'Total Users', value: overview?.total_users, change: overview?.user_growth, changeLabel: 'vs last month', icon: Users, color: '#6366f1' },
    { title: 'Total Products', value: overview?.total_products, change: overview?.product_growth, changeLabel: 'vs last month', icon: Package, color: '#2563eb' },
    { title: 'Total Orders', value: overview?.total_orders, change: overview?.order_growth, changeLabel: 'vs last month', icon: ShoppingCart, color: '#ea580c' },
    { title: 'Total Revenue', value: overview?.total_revenue, change: overview?.revenue_growth, changeLabel: 'vs last month', icon: DollarSign, format: 'currency', color: '#16a34a' },
    { title: 'Active Suppliers', value: overview?.active_suppliers, change: overview?.supplier_growth, changeLabel: 'vs last month', icon: Truck, color: '#7c3aed' },
    { title: 'Avg Order Value', value: overview?.avg_order_value, change: overview?.aov_growth, changeLabel: 'vs last month', icon: Activity, format: 'currency', color: '#0891b2' },
  ];

  // Plotly chart data
  const roleLabels = usersByRole.map(r => r.role);
  const roleValues = usersByRole.map(r => r.count);
  const roleColors = ['#94a3b8', '#2563eb', '#ea580c', '#dc2626'];

  const trendDates = registrationTrend.map(d => d.date);
  const trendCounts = registrationTrend.map(d => d.count);

  const suppNames = supplierPerformance.map(s => s.name);
  const suppRates = supplierPerformance.map(s => s.on_time_rate || 0);

  return (
    <div className="adm-dash">
      <div className="adm-dash-header">
        <div>
          <h1 className="adm-dash-title">Admin Dashboard</h1>
          <p className="adm-dash-sub">System-wide overview and monitoring</p>
        </div>
        <button className="adm-refresh-btn" onClick={fetchData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="adm-stats-grid">
        {stats.map((s, i) => (
          <SystemStatsCard key={i} {...s} />
        ))}
      </div>

      <div className="adm-charts-row">
        <div className="adm-chart-card">
          <h3 className="adm-chart-title">Users by Role</h3>
          <Plot
            data={[{
              type: 'pie',
              labels: roleLabels,
              values: roleValues,
              marker: { colors: roleColors },
              hole: 0.45,
              textinfo: 'label+percent',
              textfont: { size: 12 },
              hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>%{percent}<extra></extra>',
            }]}
            layout={{
              height: 300,
              margin: { t: 20, b: 20, l: 20, r: 20 },
              showlegend: true,
              legend: { orientation: 'h', y: -0.1, font: { size: 11 } },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>

        <div className="adm-chart-card">
          <h3 className="adm-chart-title">Registration Trend (30 Days)</h3>
          <Plot
            data={[{
              type: 'scatter',
              mode: 'lines+markers',
              x: trendDates,
              y: trendCounts,
              line: { color: '#dc2626', width: 2, shape: 'spline' },
              marker: { size: 5, color: '#dc2626' },
              fill: 'tozeroy',
              fillcolor: 'rgba(220,38,38,0.08)',
              hovertemplate: '<b>%{x}</b><br>Registrations: %{y}<extra></extra>',
            }]}
            layout={{
              height: 300,
              margin: { t: 20, b: 40, l: 40, r: 20 },
              xaxis: { showgrid: false, tickfont: { size: 10 } },
              yaxis: { showgrid: true, gridcolor: '#f1f5f9', tickfont: { size: 10 } },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="adm-charts-row">
        <div className="adm-chart-card">
          <h3 className="adm-chart-title">Top Supplier Performance</h3>
          <Plot
            data={[{
              type: 'bar',
              x: suppRates,
              y: suppNames,
              orientation: 'h',
              marker: {
                color: suppRates.map(r => r >= 90 ? '#16a34a' : r >= 70 ? '#f59e0b' : '#dc2626'),
                cornerradius: 4,
              },
              text: suppRates.map(r => `${r}%`),
              textposition: 'outside',
              textfont: { size: 11, color: '#475569' },
              hovertemplate: '<b>%{y}</b><br>On-Time: %{x}%<extra></extra>',
            }]}
            layout={{
              height: 300,
              margin: { t: 20, b: 40, l: 120, r: 60 },
              xaxis: { range: [0, 105], showgrid: true, gridcolor: '#f1f5f9', title: { text: 'On-Time Delivery %', font: { size: 11 } } },
              yaxis: { autorange: 'reversed', tickfont: { size: 11 } },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>

        <div className="adm-chart-card">
          <h3 className="adm-chart-title">Recent Activity</h3>
          <div className="adm-activity-feed">
            {recentActivity.length === 0 ? (
              <p className="adm-no-activity">No recent activity</p>
            ) : (
              recentActivity.map((act, i) => (
                <div key={i} className="adm-activity-item">
                  <div className={`adm-activity-dot ${act.type || 'info'}`} />
                  <div className="adm-activity-content">
                    <span className="adm-activity-text">{act.description || act.message}</span>
                    <span className="adm-activity-time">
                      {act.timestamp ? new Date(act.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .adm-dash { padding: 28px 32px 48px; max-width: 1440px; margin: 0 auto; }
        .adm-dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
        .adm-dash-title { margin: 0; font-size: 26px; font-weight: 700; color: #1e293b; }
        .adm-dash-sub { margin: 4px 0 0; font-size: 14px; color: #64748b; }
        .adm-refresh-btn {
          display: flex; align-items: center; gap: 6px; padding: 10px 18px;
          background: #dc2626; color: #fff; border: none; border-radius: 10px;
          font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .adm-refresh-btn:hover { background: #b91c1c; transform: translateY(-1px); }
        .adm-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .adm-charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        @media (max-width: 900px) { .adm-charts-row { grid-template-columns: 1fr; } }
        .adm-chart-card { background: #fff; border-radius: 14px; padding: 20px; border: 1px solid #e5e7eb; }
        .adm-chart-title { margin: 0 0 14px; font-size: 15px; font-weight: 600; color: #1e293b; }
        .adm-activity-feed { display: flex; flex-direction: column; gap: 6px; max-height: 260px; overflow-y: auto; }
        .adm-activity-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 10px; border-radius: 8px; transition: background 0.15s; }
        .adm-activity-item:hover { background: #f8fafc; }
        .adm-activity-dot {
          width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0;
        }
        .adm-activity-dot.info { background: #2563eb; }
        .adm-activity-dot.warning { background: #f59e0b; }
        .adm-activity-dot.error { background: #dc2626; }
        .adm-activity-dot.success { background: #16a34a; }
        .adm-activity-content { flex: 1; }
        .adm-activity-text { font-size: 13px; color: #475569; display: block; line-height: 1.4; }
        .adm-activity-time { font-size: 11px; color: #94a3b8; }
        .adm-no-activity { color: #94a3b8; font-size: 13px; text-align: center; padding: 32px 0; }
      `}</style>
    </div>
  );
}
