import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { mockSalesOverview, mockRevenueTrend, mockTopProducts, mockCategoryPerformance } from '../../data/mockData';
import SalesOverviewCards from '../../components/Owner/SalesOverviewCards';
import RevenueChart from '../../components/Owner/RevenueChart';
import TopProductsTable from '../../components/Owner/TopProductsTable';
import CategoryChart from '../../components/Owner/CategoryChart';

// ── Inline: FilterButtons ──
function FilterButtons({ selectedRange, onRangeChange }) {
  const ranges = [
    { label: 'Last 7 Days', value: 7 },
    { label: 'Last 30 Days', value: 30 },
    { label: 'Last 90 Days', value: 90 },
    { label: 'Last 365 Days', value: 365 },
  ];
  return (
    <div className="owner-filter-btns">
      {ranges.map((r) => (
        <button key={r.value} className={`owner-filter-btn ${selectedRange === r.value ? 'active' : ''}`} onClick={() => onRangeChange(r.value)}>
          {r.label}
        </button>
      ))}
    </div>
  );
}

// ── Inline: useDashboardData hook ──
function useDashboardData(timeRange) {
  const [salesData, setSalesData] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise((r) => setTimeout(r, 600));
      // When backend is ready, replace with ownerAPI calls (see services/api.js)
      setSalesData(mockSalesOverview);
      setRevenueTrend(mockRevenueTrend.slice(0, timeRange <= 7 ? 7 : 30));
      setTopProducts(mockTopProducts);
      setCategoryData(mockCategoryPerformance);
    } catch (err) {
      const msg = !err.response ? 'Network error. Please check your connection.'
        : err.response.status === 403 ? 'You do not have permission to view this data'
        : err.response.status === 500 ? 'Server error. Please try again later.'
        : 'An error occurred. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { salesData, revenueTrend, topProducts, categoryData, loading, error, refetch: fetchData };
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState(30);
  const { salesData, revenueTrend, topProducts, categoryData, loading, error, refetch } = useDashboardData(timeRange);

  return (
    <div className="owner-dash">
      {/* Header */}
      <div className="owner-dash-header">
        <div>
          <h1 className="owner-dash-title">Store Dashboard</h1>
          <p className="owner-dash-sub">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="owner-dash-controls">
          <FilterButtons selectedRange={timeRange} onRangeChange={setTimeRange} />
          <button className="owner-refresh-btn" onClick={refetch} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="owner-dash-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={refetch} className="owner-retry-btn">Retry</button>
        </div>
      )}

      {/* KPI Cards */}
      <section className="owner-dash-section">
        <SalesOverviewCards data={salesData} loading={loading} />
      </section>

      {/* Revenue Chart */}
      <section className="owner-dash-section">
        <RevenueChart data={revenueTrend} loading={loading} />
      </section>

      {/* Bottom Row: Products + Category */}
      <section className="owner-dash-bottom">
        <div className="owner-dash-bottom-left">
          <TopProductsTable data={topProducts} loading={loading} />
        </div>
        <div className="owner-dash-bottom-right">
          <CategoryChart data={categoryData} loading={loading} />
        </div>
      </section>

      <style>{`
        .owner-dash {
          min-height: calc(100vh - 120px);
          background: #F3F4F6;
          padding: 2rem 2rem 3rem;
        }
        .owner-dash-header {
          max-width: 1280px; margin: 0 auto 1.5rem;
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-wrap: wrap; gap: 1rem;
        }
        .owner-dash-title { font-size: 1.65rem; font-weight: 800; color: #1e293b; margin: 0; }
        .owner-dash-sub { font-size: 0.88rem; color: #6b7280; margin-top: 0.2rem; }
        .owner-dash-controls { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .owner-refresh-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0.5rem 1rem; border-radius: 8px;
          background: #232F3E; color: #fff; font-weight: 600;
          font-size: 0.82rem; cursor: pointer; border: none;
          font-family: inherit; transition: background 0.15s;
        }
        .owner-refresh-btn:hover { background: #37475A; }
        .owner-refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spin { animation: spinAnim 1s linear infinite; }
        @keyframes spinAnim { from { transform: rotate(0); } to { transform: rotate(360deg); } }

        .owner-dash-error {
          max-width: 1280px; margin: 0 auto 1.25rem;
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.85rem 1.25rem; border-radius: 10px;
          background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626;
          font-size: 0.85rem; font-weight: 500;
        }
        .owner-retry-btn {
          margin-left: auto; padding: 0.35rem 0.85rem; border-radius: 6px;
          background: #DC2626; color: #fff; font-weight: 600; font-size: 0.78rem;
          border: none; cursor: pointer; font-family: inherit;
        }
        .owner-retry-btn:hover { background: #b91c1c; }

        .owner-dash-section { max-width: 1280px; margin: 0 auto 1.5rem; }

        .owner-dash-bottom {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.25rem;
        }
        .owner-dash-bottom-left { min-width: 0; }
        .owner-dash-bottom-right { min-width: 0; }

        @media (max-width: 900px) {
          .owner-dash { padding: 1.25rem; }
          .owner-dash-bottom { grid-template-columns: 1fr; }
          .owner-dash-header { flex-direction: column; }
        }

        /* FilterButtons */
        .owner-filter-btns { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .owner-filter-btn {
          padding: 0.45rem 1rem; border-radius: 8px; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; border: 1.5px solid #d1d5db; background: #fff; color: #4b5563;
          font-family: inherit; transition: all 0.15s;
        }
        .owner-filter-btn:hover { background: #f3f4f6; border-color: #9ca3af; }
        .owner-filter-btn.active { background: #F97316; color: #fff; border-color: #F97316; }
        .owner-filter-btn.active:hover { background: #ea580c; border-color: #ea580c; }
        @media (max-width: 480px) { .owner-filter-btns { display: grid; grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
}
