import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="cc-tooltip">
      <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>{d.category_name}</p>
      <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#374151' }}>
        Revenue: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(d.total_revenue)}
      </p>
      <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#6b7280' }}>Share: {d.percentage}%</p>
    </div>
  );
};

const renderLabel = ({ category_name, percentage, cx, midAngle, outerRadius }) => {
  if (percentage < 4) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 22;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cx + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#374151" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={600}>
      {category_name} ({percentage}%)
    </text>
  );
};

export default function CategoryChart({ data, loading }) {
  if (loading) {
    return (
      <div className="owner-cc-card">
        <div className="owner-chart-title">Sales by Category</div>
        <div className="cc-skeleton" />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="owner-cc-card">
      <div className="owner-cc-header">
        <div className="owner-chart-title">Sales by Category</div>
        <span className="owner-cc-sub">Revenue Distribution</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="total_revenue" nameKey="category_name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={2} label={renderLabel} labelLine={false}>
            {data?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ color: '#4b5563', fontSize: '0.78rem', fontWeight: 500 }}>{val}</span>} />
        </PieChart>
      </ResponsiveContainer>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .owner-cc-card {
    background: #fff; padding: 1.5rem; border-radius: 14px;
    border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .owner-cc-header { margin-bottom: 0.5rem; }
  .owner-chart-title { font-size: 1.15rem; font-weight: 700; color: #1e293b; }
  .owner-cc-sub { font-size: 0.78rem; color: #9ca3af; }
  .cc-tooltip {
    background: #fff; padding: 10px 14px; border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12); border: 1px solid #e5e7eb;
  }
  .cc-skeleton { width: 200px; height: 200px; border-radius: 50%; margin: 2rem auto; background: #f3f4f6; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
`;
