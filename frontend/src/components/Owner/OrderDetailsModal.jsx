import { X, Copy, Printer, CheckCircle2, Clock, Truck, Package, CreditCard } from 'lucide-react';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const statusColors = {
  Pending: { bg: '#FEF3C7', color: '#CA8A04' },
  Processing: { bg: '#DBEAFE', color: '#2563EB' },
  Shipped: { bg: '#F3E8FF', color: '#7C3AED' },
  Delivered: { bg: '#DCFCE7', color: '#16A34A' },
  Cancelled: { bg: '#FEE2E2', color: '#DC2626' },
};

const timelineSteps = [
  { key: 'Pending', label: 'Order Placed', icon: Package },
  { key: 'Processing', label: 'Processing', icon: Clock },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
];

const statusRank = { Pending: 0, Processing: 1, Shipped: 2, Delivered: 3, Cancelled: -1 };

export default function OrderDetailsModal({ isOpen, onClose, order, onStatusUpdate }) {
  if (!isOpen || !order) return null;

  const st = statusColors[order.status] || statusColors.Pending;
  const currentRank = statusRank[order.status] ?? -1;

  const copyTracking = () => {
    if (order.tracking_number) navigator.clipboard.writeText(order.tracking_number);
  };

  return (
    <div className="odm-overlay" onClick={onClose}>
      <div className="odm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="odm-header">
          <div>
            <h2 className="odm-title">Order #{order.order_id}</h2>
            <span className="odm-date">{new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="odm-header-right">
            <span className="odm-status-badge" style={{ background: st.bg, color: st.color }}>{order.status}</span>
            <button className="odm-close" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        <div className="odm-body">
          {/* Timeline */}
          <div className="odm-section">
            <h3 className="odm-section-title">Order Timeline</h3>
            <div className="odm-timeline">
              {timelineSteps.map((step, i) => {
                const rank = statusRank[step.key];
                const done = currentRank >= rank && currentRank !== -1;
                const current = currentRank === rank;
                const Icon = step.icon;
                return (
                  <div key={step.key} className={`odm-tl-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                    <div className="odm-tl-icon"><Icon size={16} /></div>
                    <span className="odm-tl-label">{step.label}</span>
                    {i < timelineSteps.length - 1 && <div className={`odm-tl-line ${done && !current ? 'done' : ''}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Info */}
          <div className="odm-section">
            <h3 className="odm-section-title">Customer Information</h3>
            <div className="odm-info-grid">
              <div><span className="odm-info-label">Name</span><span className="odm-info-value">{order.user_name}</span></div>
              <div><span className="odm-info-label">Email</span><span className="odm-info-value">{order.user_email}</span></div>
              <div><span className="odm-info-label">Phone</span><span className="odm-info-value">{order.user_phone}</span></div>
              <div><span className="odm-info-label">Shipping Address</span><span className="odm-info-value">{order.shipping_address}</span></div>
            </div>
          </div>

          {/* Payment + Delivery */}
          <div className="odm-two-col">
            <div className="odm-section">
              <h3 className="odm-section-title">Payment</h3>
              <div className="odm-info-grid">
                <div><span className="odm-info-label">Method</span><span className="odm-info-value"><CreditCard size={14} style={{ marginRight: 4 }} />{order.payment_method}</span></div>
                <div><span className="odm-info-label">Status</span><span className="odm-info-value" style={{ color: order.payment_status === 'Completed' ? '#16a34a' : order.payment_status === 'Refunded' ? '#dc2626' : '#ca8a04' }}>{order.payment_status}</span></div>
              </div>
            </div>
            <div className="odm-section">
              <h3 className="odm-section-title">Delivery</h3>
              <div className="odm-info-grid">
                <div>
                  <span className="odm-info-label">Tracking</span>
                  <span className="odm-info-value">
                    {order.tracking_number ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <code style={{ fontSize: '0.78rem', background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{order.tracking_number}</code>
                        <button onClick={copyTracking} className="odm-copy-btn"><Copy size={13} /></button>
                      </span>
                    ) : 'Not yet assigned'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="odm-section">
            <h3 className="odm-section-title">Order Summary</h3>
            <div className="odm-summary">
              <div className="odm-sum-row"><span>Subtotal ({order.items_count} items)</span><span>{fmt(order.total_amount)}</span></div>
              <div className="odm-sum-row"><span>Tax</span><span>{fmt(order.tax_amount)}</span></div>
              <div className="odm-sum-row"><span>Shipping</span><span>{order.shipping_cost > 0 ? fmt(order.shipping_cost) : 'Free'}</span></div>
              {order.discount_amount > 0 && <div className="odm-sum-row discount"><span>Discount</span><span>-{fmt(order.discount_amount)}</span></div>}
              <div className="odm-sum-total"><span>Grand Total</span><span>{fmt(order.grand_total)}</span></div>
            </div>
          </div>

          {/* Update Status */}
          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
            <div className="odm-section">
              <h3 className="odm-section-title">Update Status</h3>
              <div className="odm-status-actions">
                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].filter((s) => s !== order.status).map((s) => {
                  const sc = statusColors[s];
                  return (
                    <button key={s} className="odm-status-action-btn" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}30` }}
                      onClick={() => onStatusUpdate(order.order_id, s)}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="odm-footer">
          <button className="odm-btn odm-btn-print" onClick={() => window.print()}><Printer size={15} /> Print Invoice</button>
          <button className="odm-btn odm-btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .odm-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(2px); }
  .odm-modal { background: #fff; border-radius: 16px; width: 100%; max-width: 720px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
  .odm-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
  .odm-title { font-size: 1.15rem; font-weight: 700; color: #1e293b; }
  .odm-date { font-size: 0.78rem; color: #9ca3af; }
  .odm-header-right { display: flex; align-items: center; gap: 0.75rem; }
  .odm-status-badge { padding: 0.3rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
  .odm-close { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px; border-radius: 6px; }
  .odm-close:hover { color: #ef4444; }
  .odm-body { padding: 1.25rem 1.5rem; overflow-y: auto; flex: 1; }
  .odm-section { margin-bottom: 1.25rem; }
  .odm-section-title { font-size: 0.82rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.6rem; }

  /* Timeline */
  .odm-timeline { display: flex; align-items: center; gap: 0; padding: 0.5rem 0; }
  .odm-tl-step { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; }
  .odm-tl-icon { width: 36px; height: 36px; border-radius: 50%; background: #f3f4f6; color: #9ca3af; display: flex; align-items: center; justify-content: center; border: 2px solid #e5e7eb; z-index: 1; }
  .odm-tl-step.done .odm-tl-icon { background: #F0FDF4; color: #16a34a; border-color: #16a34a; }
  .odm-tl-step.current .odm-tl-icon { background: #FFF7ED; color: #F97316; border-color: #F97316; }
  .odm-tl-label { font-size: 0.7rem; margin-top: 4px; color: #9ca3af; font-weight: 500; text-align: center; }
  .odm-tl-step.done .odm-tl-label { color: #16a34a; }
  .odm-tl-step.current .odm-tl-label { color: #F97316; font-weight: 700; }
  .odm-tl-line { position: absolute; top: 18px; left: 50%; width: 100%; height: 2px; background: #e5e7eb; z-index: 0; }
  .odm-tl-line.done { background: #16a34a; }

  /* Info Grid */
  .odm-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
  .odm-info-label { display: block; font-size: 0.72rem; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.03em; }
  .odm-info-value { display: flex; align-items: center; font-size: 0.85rem; color: #1e293b; font-weight: 500; margin-top: 1px; }
  .odm-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 540px) { .odm-info-grid, .odm-two-col { grid-template-columns: 1fr; } }

  .odm-copy-btn { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 2px; }
  .odm-copy-btn:hover { color: #F97316; }

  /* Summary */
  .odm-summary { background: #f9fafb; border-radius: 10px; padding: 1rem; }
  .odm-sum-row { display: flex; justify-content: space-between; padding: 0.3rem 0; font-size: 0.85rem; color: #4b5563; }
  .odm-sum-row.discount { color: #16a34a; }
  .odm-sum-total { display: flex; justify-content: space-between; padding: 0.6rem 0 0; margin-top: 0.4rem; border-top: 2px solid #e5e7eb; font-size: 1.05rem; font-weight: 800; color: #1e293b; }

  /* Status Actions */
  .odm-status-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .odm-status-action-btn { padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; }
  .odm-status-action-btn:hover { opacity: 0.85; transform: translateY(-1px); }

  /* Footer */
  .odm-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; }
  .odm-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.82rem; cursor: pointer; font-family: inherit; border: none; transition: all 0.15s; }
  .odm-btn-print { background: #f3f4f6; color: #4b5563; }
  .odm-btn-print:hover { background: #e5e7eb; }
  .odm-btn-close { background: #F97316; color: #fff; }
  .odm-btn-close:hover { background: #ea580c; }
`;
