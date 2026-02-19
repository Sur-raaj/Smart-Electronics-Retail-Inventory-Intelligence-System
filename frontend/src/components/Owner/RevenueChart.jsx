import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

const fmt = (v) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rc-tooltip-box">
      <p className="rc-tooltip-date">{label ? format(parseISO(label), 'MMM dd, yyyy') : ''}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: '4px 0', fontSize: '0.82rem', fontWeight: 600 }}>
          {p.name}: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function RevenueChart({ data, loading }) {
  if (loading) {
    return (
      <div className="owner-chart-card">
        <div className="owner-chart-title">Revenue Trend</div>
        <div className="owner-chart-skeleton"><div className="skel-rect" /></div>
      </div>
    );
  }

  return (
    <div className="owner-chart-card">
      <div className="owner-chart-header">
        <div className="owner-chart-title">Revenue Trend</div>
        <div className="owner-chart-legend">
          <span className="legend-dot" style={{ background: '#3B82F6' }} /> Revenue
          <span className="legend-dot" style={{ background: '#10B981', marginLeft: 12 }} /> Profit
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => { try { return format(parseISO(v), 'dd MMM'); } catch { return v; } }} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={fmt} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ display: 'none' }} />
          <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#3B82F6' }} />
          <Line type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#10B981' }} />
        </LineChart>
      </ResponsiveContainer>
      <style>{`
        .owner-chart-card {
          background: #fff; padding: 1.5rem; border-radius: 14px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .owner-chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
        .owner-chart-title { font-size: 1.15rem; font-weight: 700; color: #1e293b; }
        .owner-chart-legend { display: flex; align-items: center; font-size: 0.78rem; color: #6b7280; font-weight: 500; }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 5px; }
        .owner-chart-skeleton { height: 320px; background: #f3f4f6; border-radius: 10px; animation: pulse 1.5s infinite; }
        .rc-tooltip-box {
          background: #fff; padding: 10px 14px; border-radius: 10px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12); border: 1px solid #e5e7eb;
        }
        .rc-tooltip-date { font-weight: 600; font-size: 0.82rem; color: #374151; margin: 0 0 6px; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
