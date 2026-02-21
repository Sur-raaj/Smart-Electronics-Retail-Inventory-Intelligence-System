import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, Truck, ShieldCheck, RotateCcw, Package, Cpu, HardDrive, Monitor, Award } from 'lucide-react';
import { customerAPI } from '../../services/api';

/* ── Hardcoded fallback (mirrors Home.jsx until backend is live) ── */
const fallbackProducts = [
  { id: 1, name: 'MacBook Pro 16"', category: 'Laptops', price: 2499, oldPrice: 2799, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', rating: 4.8, performance: "M3 Pro chip, 12-core CPU", memory: "18GB Unified, 512GB SSD", display: '16.2″ Liquid Retina XDR, 120Hz', warranty: "1 Year AppleCare", description: "The most advanced MacBook Pro ever, featuring the M3 Pro chip for unprecedented performance and battery life." },
  { id: 2, name: 'iPhone 15 Pro Max', category: 'Smartphones', price: 1199, oldPrice: 1299, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', rating: 4.9, performance: "A17 Pro chip, 6-core GPU", memory: "8GB RAM, 256GB Storage", display: '6.7″ Super Retina XDR, 120Hz', warranty: "1 Year AppleCare", description: "The ultimate iPhone with titanium design, A17 Pro chip, and the most powerful camera system ever." },
  { id: 3, name: 'Sony WH-1000XM5', category: 'Headphones', price: 349, oldPrice: 399, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', rating: 4.7, performance: "Integrated V1, QN1 Processor", memory: "N/A", display: "N/A", warranty: "1 Year Sony Warranty", description: "Industry-leading noise cancellation with exceptional sound quality and all-day comfort." },
  { id: 4, name: 'Canon EOS R6 Mark II', category: 'Cameras', price: 2499, oldPrice: 2699, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', rating: 4.8, performance: "DIGIC X Image Processor", memory: "Dual SD Card Slots", display: '3.0″ Vari-Angle Touchscreen', warranty: "2 Years Canon Warranty", description: "Professional full-frame mirrorless camera with blazing autofocus and 4K 60p video." },
  { id: 5, name: 'Samsung Galaxy Tab S9', category: 'Tablets', price: 799, oldPrice: 899, image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=800&q=80', rating: 4.6, performance: "Snapdragon 8 Gen 2", memory: "8GB RAM, 128GB Storage", display: '11″ Dynamic AMOLED 2X, 120Hz', warranty: "1 Year Samsung Warranty", description: "Premium Android tablet with stunning display, S Pen included, and Galaxy ecosystem integration." },
  { id: 6, name: 'Apple Watch Ultra 2', category: 'Wearables', price: 799, oldPrice: 849, image: 'https://images.unsplash.com/photo-1579586337278-3f436f25d4d6?auto=format&fit=crop&w=800&q=80', rating: 4.8, performance: "S9 SiP, 4-core Neural Engine", memory: "64GB Capacity", display: 'Always-On Retina OLED, 3000 nits', warranty: "1 Year AppleCare", description: "The most rugged and capable Apple Watch, designed for exploration, adventure, and endurance." },
];

const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);

export default function ProductDetail({ addToCart, toggleWishlist, wishlistItems = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await customerAPI.getProduct(id);
        setProduct(res.data);
      } catch {
        // Fallback to local data when backend is unavailable
        const local = fallbackProducts.find(p => p.id === Number(id));
        setProduct(local || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div style={s.loaderWrap}>
        <div style={s.spinner} />
        <p style={{ color: '#64748b', marginTop: 16 }}>Loading product...</p>
        <style>{spinnerCSS}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={s.loaderWrap}>
        <Package size={48} style={{ color: '#cbd5e1', marginBottom: 16 }} />
        <h2 style={{ color: '#334155', marginBottom: 8 }}>Product Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>The product you're looking for doesn't exist.</p>
        <Link to="/" style={s.backBtn}><ArrowLeft size={16} /> Back to Home</Link>
      </div>
    );
  }

  const isInWishlist = wishlistItems.some(i => i.id === product.id);
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  const specs = [
    { icon: Cpu, label: 'Performance', value: product.performance },
    { icon: HardDrive, label: 'Memory / Storage', value: product.memory },
    { icon: Monitor, label: 'Display', value: product.display },
    { icon: Award, label: 'Warranty', value: product.warranty },
  ].filter(sp => sp.value && sp.value !== 'N/A');

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Breadcrumb */}
        <nav style={s.breadcrumb}>
          <Link to="/" style={s.breadLink}>Home</Link>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ color: '#F97316', fontWeight: 500 }}>{product.name}</span>
        </nav>

        <div style={s.grid}>
          {/* Image */}
          <div style={s.imageCard}>
            {discount > 0 && <span style={s.badge}>-{discount}%</span>}
            <img src={product.image} alt={product.name} style={s.img} />
          </div>

          {/* Info */}
          <div style={s.infoCol}>
            <span style={s.category}>{product.category}</span>
            <h1 style={s.title}>{product.name}</h1>

            {/* Rating */}
            <div style={s.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < Math.round(product.rating) ? '#FBBF24' : 'none'} stroke={i < Math.round(product.rating) ? '#FBBF24' : '#D1D5DB'} />
              ))}
              <span style={{ marginLeft: 8, fontSize: 14, color: '#64748b' }}>{product.rating} / 5</span>
            </div>

            {/* Price */}
            <div style={s.priceRow}>
              <span style={s.price}>{formatPrice(product.price)}</span>
              {product.oldPrice && <span style={s.oldPrice}>{formatPrice(product.oldPrice)}</span>}
              {discount > 0 && <span style={s.saveBadge}>Save {formatPrice(product.oldPrice - product.price)}</span>}
            </div>

            {product.description && <p style={s.desc}>{product.description}</p>}

            {/* Quantity + Actions */}
            <div style={s.actionsRow}>
              <div style={s.qtyWrap}>
                <button style={s.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span style={s.qtyVal}>{qty}</span>
                <button style={s.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button style={s.cartBtn} onClick={() => { for (let i = 0; i < qty; i++) addToCart(product); }}>
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button style={{ ...s.wishBtn, ...(isInWishlist ? { background: '#fef2f2', borderColor: '#fecaca', color: '#ef4444' } : {}) }} onClick={() => toggleWishlist(product)}>
                <Heart size={18} fill={isInWishlist ? '#ef4444' : 'none'} />
              </button>
            </div>

            {/* Trust badges */}
            <div style={s.trustRow}>
              <div style={s.trustItem}><Truck size={16} style={{ color: '#16a34a' }} /><span>Free Shipping</span></div>
              <div style={s.trustItem}><ShieldCheck size={16} style={{ color: '#2563eb' }} /><span>Secure Payment</span></div>
              <div style={s.trustItem}><RotateCcw size={16} style={{ color: '#F97316' }} /><span>Easy Returns</span></div>
            </div>
          </div>
        </div>

        {/* Specs */}
        {specs.length > 0 && (
          <div style={s.specsCard}>
            <h2 style={s.specsTitle}>Specifications</h2>
            <div style={s.specsGrid}>
              {specs.map((sp, i) => (
                <div key={i} style={s.specItem}>
                  <div style={s.specIcon}><sp.icon size={20} /></div>
                  <div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{sp.label}</div>
                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{sp.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{spinnerCSS}</style>
    </div>
  );
}

/* ── Styles ── */
const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 35%)', padding: '32px 24px 64px' },
  container: { maxWidth: 1100, margin: '0 auto' },
  breadcrumb: { display: 'flex', gap: 8, fontSize: 13, marginBottom: 28, alignItems: 'center' },
  breadLink: { color: '#64748b', textDecoration: 'none' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' },
  imageCard: { position: 'relative', background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  badge: { position: 'absolute', top: 16, left: 16, background: '#ef4444', color: '#fff', padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700, zIndex: 2 },
  img: { width: '100%', height: 420, objectFit: 'cover', display: 'block' },
  infoCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  category: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' },
  title: { fontSize: 28, fontWeight: 800, color: '#1e293b', lineHeight: 1.2, margin: 0 },
  ratingRow: { display: 'flex', alignItems: 'center' },
  priceRow: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  price: { fontSize: 28, fontWeight: 800, color: '#16a34a' },
  oldPrice: { fontSize: 18, color: '#94a3b8', textDecoration: 'line-through' },
  saveBadge: { fontSize: 13, fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '4px 10px', borderRadius: 999 },
  desc: { fontSize: 15, color: '#475569', lineHeight: 1.7 },
  actionsRow: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 4 },
  qtyWrap: { display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' },
  qtyBtn: { width: 36, height: 38, background: '#f8fafc', border: 'none', fontSize: 18, cursor: 'pointer', color: '#334155', fontWeight: 600 },
  qtyVal: { width: 40, textAlign: 'center', fontSize: 15, fontWeight: 600, color: '#1e293b' },
  cartBtn: { display: 'flex', alignItems: 'center', gap: 8, background: '#F97316', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'background .2s' },
  wishBtn: { width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', color: '#64748b', transition: 'all .2s' },
  trustRow: { display: 'flex', gap: 20, marginTop: 8, flexWrap: 'wrap' },
  trustItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', fontWeight: 500 },
  specsCard: { marginTop: 40, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  specsTitle: { fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 20, margin: '0 0 20px' },
  specsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 },
  specItem: { display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' },
  specIcon: { width: 40, height: 40, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316', flexShrink: 0 },
  loaderWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  spinner: { width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #F97316', borderRadius: '50%', animation: 'pd-spin 0.8s linear infinite' },
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#F97316', fontWeight: 600, textDecoration: 'none', fontSize: 14 },
};

const spinnerCSS = `@keyframes pd-spin { to { transform: rotate(360deg); } }
@media (max-width: 768px) {
  /* stack image/info vertically on mobile — applied via inline grid override via JS is impractical, so we use this media query */
}`;
