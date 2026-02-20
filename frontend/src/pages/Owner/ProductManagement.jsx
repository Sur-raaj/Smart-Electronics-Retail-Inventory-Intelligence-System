import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, RotateCcw, ChevronLeft, ChevronRight, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { ownerAPI } from '../../services/api';
import ProductModal from '../../components/Owner/ProductModal';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

// ── Inline: useProductFilters hook ──
function useProductFilters(products = []) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.category_name?.toLowerCase().includes(q));
    }
    if (selectedCategory) result = result.filter((p) => p.category_name === selectedCategory);
    if (minPrice !== '') result = result.filter((p) => p.selling_price >= Number(minPrice));
    if (maxPrice !== '') result = result.filter((p) => p.selling_price <= Number(maxPrice));
    result.sort((a, b) => {
      let valA = a[sortBy], valB = b[sortBy];
      if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [products, searchQuery, selectedCategory, minPrice, maxPrice, sortBy, sortOrder]);

  const resetFilters = useCallback(() => {
    setSearchQuery(''); setSelectedCategory(''); setMinPrice(''); setMaxPrice(''); setSortBy('name'); setSortOrder('asc');
  }, []);

  return { filteredProducts, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, minPrice, setMinPrice, maxPrice, setMaxPrice, sortBy, setSortBy, sortOrder, setSortOrder, resetFilters };
}

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const {
    filteredProducts, searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    minPrice, setMinPrice, maxPrice, setMaxPrice,
    sortBy, setSortBy, resetFilters,
  } = useProductFilters(products);

  const fetchData = useCallback(async () => {
    try {
      setPageLoading(true);
      setPageError(null);
      const [prodRes, catRes, supRes] = await Promise.all([
        ownerAPI.getAllProducts({ page_size: 1000 }),
        ownerAPI.getCategories(),
        ownerAPI.getSuppliers(),
      ]);
      setProducts(prodRes.data.results || prodRes.data);
      setCategoriesList(catRes.data);
      setSuppliersList(supRes.data);
    } catch (err) {
      setPageError(err.response?.data?.message || 'Failed to load products. Please try again.');
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const perPage = 10;
  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const paged = filteredProducts.slice((currentPage - 1) * perPage, currentPage * perPage);

  const categories = [...new Set(products.map((p) => p.category_name))];

  const openAdd = () => { setEditingProduct(null); setShowModal(true); };
  const openEdit = (p) => { setEditingProduct(p); setShowModal(true); };

  const handleSave = async (data) => {
    try {
      if (editingProduct) {
        const res = await ownerAPI.updateProduct(editingProduct.id, data);
        setProducts((prev) => prev.map((p) => p.id === editingProduct.id ? res.data : p));
      } else {
        const res = await ownerAPI.createProduct(data);
        setProducts((prev) => [...prev, res.data]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      try {
        await ownerAPI.deleteProduct(deleteConfirm.id);
        setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete product');
      }
    }
  };

  return (
    <div className="owner-pm">
      {/* Header */}
      <div className="owner-pm-header">
        <div>
          <h1 className="owner-pm-title">Product Management</h1>
          <p className="owner-pm-sub">{products.length} products · {products.filter((p) => p.status === 'Active').length} active</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="owner-pm-refresh-btn" onClick={fetchData} disabled={pageLoading}><RefreshCw size={16} className={pageLoading ? 'spin' : ''} /></button>
          <button className="owner-pm-add-btn" onClick={openAdd}><Plus size={18} /> Add Product</button>
        </div>
      </div>

      {/* Error */}
      {pageError && (
        <div className="owner-pm-error">
          <AlertCircle size={18} />
          <span>{pageError}</span>
          <button onClick={fetchData} className="pm-retry-btn">Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="owner-pm-filters">
        <div className="owner-pm-search">
          <Search size={16} className="owner-pm-search-icon" />
          <input placeholder="Search products, brands..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>
        <select className="owner-pm-select" value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" className="owner-pm-price-input" placeholder="Min ₹" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }} />
        <input type="number" className="owner-pm-price-input" placeholder="Max ₹" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }} />
        <select className="owner-pm-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="selling_price">Sort by Price</option>
          <option value="stock_quantity">Sort by Stock</option>
        </select>
        <button className="owner-pm-reset-btn" onClick={() => { resetFilters(); setCurrentPage(1); }}><RotateCcw size={14} /> Reset</button>
      </div>

      {/* Table */}
      <div className="owner-pm-table-wrap">
        <table className="owner-pm-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Cost</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={8} className="owner-pm-empty"><Package size={32} /><span>No products found</span></td></tr>
            ) : (
              paged.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="pm-product-cell">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="pm-product-img" />
                      ) : (
                        <div className="pm-product-img-placeholder"><Package size={16} /></div>
                      )}
                      <span className="pm-product-name">{p.name}</span>
                    </div>
                  </td>
                  <td><span className="pm-cat-badge">{p.category_name}</span></td>
                  <td className="pm-brand">{p.brand}</td>
                  <td className="pm-num">{fmt(p.cost_price)}</td>
                  <td className="pm-num pm-price">{fmt(p.selling_price)}</td>
                  <td className="pm-num">
                    <span className={`pm-stock ${p.stock_quantity === 0 ? 'out' : p.stock_quantity <= (p.reorder_level || 10) ? 'low' : ''}`}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td>
                    <span className={`pm-status-badge ${p.status === 'Active' ? 'active' : 'inactive'}`}>{p.status}</span>
                  </td>
                  <td>
                    <div className="pm-actions">
                      <button className="pm-act-btn edit" onClick={() => openEdit(p)} title="Edit"><Pencil size={14} /></button>
                      <button className="pm-act-btn delete" onClick={() => setDeleteConfirm(p)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="owner-pm-pagination">
          <span className="pm-page-info">Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredProducts.length)} of {filteredProducts.length}</span>
          <div className="pm-page-btns">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="pm-page-btn"><ChevronLeft size={16} /></button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} className={`pm-page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="pm-page-btn"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} product={editingProduct} categories={categoriesList} suppliers={suppliersList} />

      {deleteConfirm && (
        <div className="pm-del-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="pm-del-modal" onClick={(e) => e.stopPropagation()}>
            <Trash2 size={32} color="#ef4444" />
            <h3>Delete Product?</h3>
            <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
            <div className="pm-del-btns">
              <button className="pm-del-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="pm-del-confirm" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .owner-pm { min-height: calc(100vh - 120px); background: #F3F4F6; padding: 2rem; }
        .owner-pm-header { max-width: 1280px; margin: 0 auto 1.25rem; display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; }
        .owner-pm-title { font-size: 1.65rem; font-weight: 800; color: #1e293b; margin: 0; }
        .owner-pm-sub { font-size: 0.85rem; color: #6b7280; margin-top: 0.15rem; }
        .owner-pm-add-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.55rem 1.15rem; border-radius: 8px; background: #F97316; color: #fff; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: none; font-family: inherit; transition: background 0.15s; }
        .owner-pm-add-btn:hover { background: #ea580c; }
        .owner-pm-refresh-btn { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 8px; background: #232F3E; color: #fff; cursor: pointer; border: none; transition: background 0.15s; }
        .owner-pm-refresh-btn:hover { background: #37475A; }
        .owner-pm-refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spin { animation: spinAnim 1s linear infinite; }
        @keyframes spinAnim { from { transform: rotate(0); } to { transform: rotate(360deg); } }

        /* Error */
        .owner-pm-error { max-width: 1280px; margin: 0 auto 1rem; display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1.25rem; border-radius: 10px; background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; font-size: 0.85rem; font-weight: 500; }
        .pm-retry-btn { margin-left: auto; padding: 0.35rem 0.85rem; border-radius: 6px; background: #DC2626; color: #fff; font-weight: 600; font-size: 0.78rem; border: none; cursor: pointer; font-family: inherit; }
        .pm-retry-btn:hover { background: #b91c1c; }

        /* Filters */
        .owner-pm-filters { max-width: 1280px; margin: 0 auto 1rem; display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center; }
        .owner-pm-search { position: relative; flex: 1; min-width: 200px; }
        .owner-pm-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .owner-pm-search input { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.25rem; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 0.85rem; font-family: inherit; color: #1e293b; }
        .owner-pm-search input:focus { outline: none; border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
        .owner-pm-select { padding: 0.5rem 0.75rem; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 0.82rem; font-family: inherit; color: #374151; background: #fff; cursor: pointer; }
        .owner-pm-select:focus { outline: none; border-color: #F97316; }
        .owner-pm-price-input { width: 100px; padding: 0.5rem 0.6rem; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 0.82rem; font-family: inherit; }
        .owner-pm-price-input:focus { outline: none; border-color: #F97316; }
        .owner-pm-reset-btn { display: inline-flex; align-items: center; gap: 4px; padding: 0.5rem 0.85rem; border-radius: 8px; background: #fff; color: #6b7280; font-size: 0.82rem; font-weight: 600; border: 1.5px solid #d1d5db; cursor: pointer; font-family: inherit; }
        .owner-pm-reset-btn:hover { background: #f3f4f6; color: #374151; }

        /* Table */
        .owner-pm-table-wrap { max-width: 1280px; margin: 0 auto; background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .owner-pm-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .owner-pm-table th { text-align: left; padding: 0.75rem 1rem; color: #6b7280; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; background: #f9fafb; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
        .owner-pm-table td { padding: 0.7rem 1rem; border-bottom: 1px solid #f3f4f6; color: #374151; }
        .owner-pm-table tbody tr:hover { background: #FFF7ED; }
        .owner-pm-empty { text-align: center; padding: 2.5rem 1rem !important; color: #9ca3af; }
        .owner-pm-empty span { display: block; margin-top: 0.5rem; font-weight: 500; }

        .pm-product-cell { display: flex; align-items: center; gap: 0.6rem; }
        .pm-product-img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1px solid #e5e7eb; flex-shrink: 0; }
        .pm-product-img-placeholder { width: 40px; height: 40px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #d1d5db; flex-shrink: 0; }
        .pm-product-name { font-weight: 600; color: #1e293b; white-space: nowrap; }
        .pm-cat-badge { font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 5px; background: #EFF6FF; color: #3B82F6; white-space: nowrap; }
        .pm-brand { color: #6b7280; font-weight: 500; }
        .pm-num { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
        .pm-price { color: #16a34a; }
        .pm-stock { font-weight: 700; }
        .pm-stock.low { color: #ca8a04; }
        .pm-stock.out { color: #dc2626; }
        .pm-status-badge { font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 20px; }
        .pm-status-badge.active { background: #DCFCE7; color: #16A34A; }
        .pm-status-badge.inactive { background: #FEE2E2; color: #DC2626; }
        .pm-actions { display: flex; gap: 0.35rem; }
        .pm-act-btn { background: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: 5px 7px; cursor: pointer; color: #9ca3af; transition: all 0.15s; }
        .pm-act-btn.edit:hover { color: #F97316; border-color: #F97316; background: #FFF7ED; }
        .pm-act-btn.delete:hover { color: #ef4444; border-color: #ef4444; background: #FEF2F2; }

        /* Pagination */
        .owner-pm-pagination { max-width: 1280px; margin: 1rem auto 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; }
        .pm-page-info { font-size: 0.82rem; color: #6b7280; font-weight: 500; }
        .pm-page-btns { display: flex; gap: 0.3rem; }
        .pm-page-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #d1d5db; background: #fff; color: #374151; display: flex; align-items: center; justify-content: center; cursor: pointer; font-family: inherit; font-size: 0.82rem; font-weight: 600; transition: all 0.15s; }
        .pm-page-btn:hover:not(:disabled) { background: #FFF7ED; border-color: #F97316; color: #F97316; }
        .pm-page-btn.active { background: #F97316; color: #fff; border-color: #F97316; }
        .pm-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Delete Modal */
        .pm-del-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .pm-del-modal { background: #fff; border-radius: 16px; padding: 2rem; text-align: center; max-width: 380px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .pm-del-modal h3 { font-size: 1.15rem; font-weight: 700; color: #1e293b; margin: 0.75rem 0 0.5rem; }
        .pm-del-modal p { font-size: 0.85rem; color: #6b7280; margin: 0 0 1.25rem; line-height: 1.5; }
        .pm-del-btns { display: flex; gap: 0.75rem; justify-content: center; }
        .pm-del-cancel { padding: 0.5rem 1.25rem; border-radius: 8px; background: #f3f4f6; color: #4b5563; font-weight: 600; font-size: 0.85rem; border: none; cursor: pointer; font-family: inherit; }
        .pm-del-confirm { padding: 0.5rem 1.25rem; border-radius: 8px; background: #ef4444; color: #fff; font-weight: 600; font-size: 0.85rem; border: none; cursor: pointer; font-family: inherit; }
        .pm-del-confirm:hover { background: #dc2626; }

        @media (max-width: 900px) { .owner-pm { padding: 1.25rem; } }
      `}</style>
    </div>
  );
}
