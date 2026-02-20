import { useMemo } from 'react';
import Plot from 'react-plotly.js';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function CategoryChart({ data, loading }) {
  const plotData = useMemo(() => {
    if (!data || !data.length) return [];
    return [{
      labels: data.map((d) => d.category_name),
      values: data.map((d) => d.total_revenue),
      type: 'pie',
      hole: 0.45,
      marker: { colors: COLORS.slice(0, data.length) },
      textinfo: 'label+percent',
      textposition: 'outside',
      textfont: { size: 11, color: '#374151' },
      hovertemplate: '<b>%{label}</b><br>Revenue: ₹%{value:,.0f}<br>Share: %{percent}<extra></extra>',
      pull: data.map((_, i) => i === 0 ? 0.03 : 0),
    }];
  }, [data]);

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
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          height: 300,
          margin: { t: 10, r: 10, b: 10, l: 10 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { family: 'inherit', size: 11 },
          showlegend: true,
          legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center', font: { size: 11, color: '#4b5563' } },
        }}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
        style={{ width: '100%' }}
      />
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
  .cc-skeleton { width: 200px; height: 200px; border-radius: 50%; margin: 2rem auto; background: #f3f4f6; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
`;
