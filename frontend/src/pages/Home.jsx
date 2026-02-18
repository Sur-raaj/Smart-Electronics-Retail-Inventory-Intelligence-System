import { FiMonitor, FiSmartphone, FiHeadphones, FiCamera, FiCpu, FiWatch, FiHeart } from 'react-icons/fi'

const categories = [
    { name: 'Laptops', icon: FiMonitor },
    { name: 'Smartphones', icon: FiSmartphone },
    { name: 'Audio', icon: FiHeadphones },
    { name: 'Cameras', icon: FiCamera },
    { name: 'Components', icon: FiCpu },
    { name: 'Wearables', icon: FiWatch },
]

const featuredProducts = [
    { id: 1, name: 'MacBook Pro 16"', category: 'Laptops', price: 2499, oldPrice: 2799, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', rating: 4.8 },
    { id: 2, name: 'iPhone 15 Pro Max', category: 'Smartphones', price: 1199, oldPrice: 1299, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', rating: 4.9 },
    { id: 3, name: 'Sony WH-1000XM5', category: 'Audio', price: 349, oldPrice: 399, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', rating: 4.7 },
    { id: 4, name: 'Canon EOS R6 Mark II', category: 'Cameras', price: 2499, oldPrice: 2699, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', rating: 4.8 },
    { id: 5, name: 'Samsung Galaxy Tab S9', category: 'Tablets', price: 799, oldPrice: 899, image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=800&q=80', rating: 4.6 },
    { id: 6, name: 'Apple Watch Ultra 2', category: 'Wearables', price: 799, oldPrice: 849, image: 'https://images.unsplash.com/photo-1579586337278-3f436f25d4d6?auto=format&fit=crop&w=800&q=80', rating: 4.8 },
]

export default function Home({ addToCart, toggleWishlist, wishlistItems = [] }) {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <span className="hero-badge">🔥 New Arrivals 2026</span>
                    <h1 className="hero-title">
                        Your One-Stop <span className="hero-accent">Electronics</span> Store
                    </h1>
                    <p className="hero-subtitle">
                        Discover the latest gadgets, cutting-edge technology, and premium electronics at unbeatable prices.
                    </p>
                    <div className="hero-actions">
                        <button className="btn btn-primary">Shop Now</button>
                        <button className="btn btn-secondary">Browse Categories</button>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="section">
                <h2 className="section-title">Shop by Category</h2>
                <div className="categories-grid">
                    {categories.map((cat) => (
                        <div key={cat.name} className="category-card">
                            <div className="category-icon">
                                <cat.icon size={26} />
                            </div>
                            <span className="category-name">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="section section-surface">
                <h2 className="section-title">Featured Products</h2>
                <div className="products-grid">
                    {featuredProducts.map((product) => {
                        const isInWishlist = wishlistItems.some(item => item.id === product.id);
                        return (
                            <div key={product.id} className="product-card group">
                                <div className="product-image-wrap">
                                    <img src={product.image} alt={product.name} className="product-img" />
                                    <button 
                                        className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                                        onClick={() => toggleWishlist(product)}
                                    >
                                        <FiHeart size={20} className={isInWishlist ? "fill-current" : ""} />
                                    </button>
                                </div>
                                <div className="product-info">
                                    <span className="product-category">{product.category}</span>
                                    <h3 className="product-name">{product.name}</h3>
                                    <div className="product-pricing">
                                        <span className="product-price">${product.price}</span>
                                        <span className="product-old-price">${product.oldPrice}</span>
                                    </div>
                                    <button className="btn btn-primary btn-sm" onClick={() => addToCart(product)}>Add to Cart</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <style>{`
        .home {
          min-height: 60vh;
          background: #fff;
        }

        /* Hero */
        .hero {
          background: #232F3E;
          padding: 4rem 2rem;
          text-align: center;
          position: relative;
        }

        .hero-content {
          max-width: 650px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(249,115,22,0.15);
          color: #F97316;
          padding: 0.4rem 1.1rem;
          border-radius: 50px;
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 0.85rem;
        }

        .hero-accent {
          color: #F97316;
        }

        .hero-subtitle {
          color: rgba(255,255,255,0.65);
          font-size: 1rem;
          margin-bottom: 1.75rem;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Buttons */
        .btn {
          padding: 0.65rem 1.5rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          border: none;
          font-family: inherit;
        }

        .btn-primary {
          background: #F97316;
          color: white;
        }

        .btn-primary:hover {
          background: #ea580c;
        }

        .btn-secondary {
          background: transparent;
          color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.25);
        }

        .btn-secondary:hover {
          border-color: rgba(255,255,255,0.5);
          color: #fff;
        }

        .btn-sm {
          padding: 0.45rem 0.85rem;
          font-size: 0.8rem;
          width: 100%;
          margin-top: 0.6rem;
        }

        /* Sections */
        .section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
        }

        .section-surface {
          max-width: 100%;
          background: #F3F4F6;
          padding: 2.5rem 2rem;
        }

        .section-surface .products-grid {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #232F3E;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        /* Categories */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }

        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.65rem;
          padding: 1.25rem 1rem;
          background: #fff;
          border-radius: 10px;
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
          border: 1px solid #e5e7eb;
        }

        .category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .category-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F3F4F6;
          color: #6b7280;
          transition: background 0.2s, color 0.2s;
        }

        .category-card:hover .category-icon {
          background: #F97316;
          color: #fff;
        }

        .category-name {
          font-weight: 600;
          font-size: 0.85rem;
          color: #374151;
        }

        /* Products */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 1.25rem;
        }

        .product-card {
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          transition: box-shadow 0.2s, transform 0.2s;
        }

        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .product-image-wrap {
          position: relative;
          height: 150px;
          background: #F9FAFB;
          overflow: hidden;
        }

        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .product-card:hover .product-img {
          transform: scale(1.05);
        }

        .wishlist-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transform: translateY(-5px);
          transition: all 0.2s;
          color: #9ca3af;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .product-card:hover .wishlist-btn {
          opacity: 1;
          transform: translateY(0);
        }

        .wishlist-btn:hover {
          color: #ef4444;
          transform: scale(1.1);
        }

        .wishlist-btn.active {
          opacity: 1;
          color: #ef4444;
        }

        .product-info {
          padding: 0.85rem 1rem 1rem;
        }

        .product-category {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #9ca3af;
          font-weight: 600;
        }

        .product-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0.3rem 0 0.4rem;
        }

        .product-pricing {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .product-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: #16A34A;
        }

        .product-old-price {
          font-size: 0.82rem;
          color: #9ca3af;
          text-decoration: line-through;
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 1.85rem;
          }
          .hero {
            padding: 2.5rem 1.25rem;
          }
          .categories-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
        </div>
    )
}
