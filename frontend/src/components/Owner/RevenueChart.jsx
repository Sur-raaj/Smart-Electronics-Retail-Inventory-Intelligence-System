import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { format, parseISO } from 'date-fns';

export default function RevenueChart({ data, loading }) {
  const plotData = useMemo(() => {
    if (!data || !data.length) return [];
    const dates = data.map((d) => {
      try { return format(parseISO(d.period), 'dd MMM yyyy'); } catch { return d.period; }
    });
    return [
      {
        x: dates,
        y: data.map((d) => d.revenue),
        type: 'scatter',
        mode: 'lines',
        name: 'Revenue',
        line: { color: '#3B82F6', width: 2.5, shape: 'spline' },
        hovertemplate: '<b>%{x}</b><br>Revenue: ₹%{y:,.0f}<extra></extra>',
      },
      {
        x: dates,
        y: data.map((d) => d.profit),
        type: 'scatter',
        mode: 'lines',
        name: 'Profit',
        line: { color: '#10B981', width: 2.5, shape: 'spline' },
        hovertemplate: '<b>%{x}</b><br>Profit: ₹%{y:,.0f}<extra></extra>',
      },
    ];
  }, [data]);

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
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          height: 320,
          margin: { t: 10, r: 20, b: 40, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { family: 'inherit', size: 11, color: '#9ca3af' },
          xaxis: { showgrid: false, tickangle: -30 },
          yaxis: { gridcolor: '#e5e7eb', gridwidth: 1, tickprefix: '₹', separatethousands: true },
          legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' },
          hovermode: 'x unified',
        }}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
        style={{ width: '100%' }}
      />
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
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
