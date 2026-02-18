import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  Landmark,
  CreditCard,
  Truck,
  Save,
  CheckCircle,
  ChevronRight,
  Plus,
} from "lucide-react";

/* ── Toast replacement ───────────────────────────────────── */
const toast = ({ title, description }) => console.info(`${title}: ${description}`);

/* ── Price formatter ─────────────────────────────────────── */
const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

/* ── eSewa Logo SVG ──────────────────────────────────────── */
const EsewaLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#60BB46" />
    <path d="M14 24C14 19.5 17.5 16 22 16H34" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <path d="M14 24H34" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <path d="M14 24C14 28.5 17.5 32 22 32H34" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontWeight="800" fontSize="10" fontFamily="Arial, sans-serif" style={{opacity: 0}}>eSewa</text>
  </svg>
);

/* ── Khalti Logo SVG ─────────────────────────────────────── */
const KhaltiLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#5C2D91" />
    <path d="M15 14V34" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <path d="M33 14L21 24L33 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontWeight="800" fontSize="10" fontFamily="Arial, sans-serif" style={{opacity: 0}}>Khalti</text>
  </svg>
);

/* ── Bank Logo SVG ───────────────────────────────────────── */
const BankLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#2563EB" />
    <path d="M11 25V37H15V25H11ZM21 25V37H25V25H21ZM31 25V37H35V25H31ZM4 17L23 7L42 17V21H4V17ZM8 39V43H38V39H8Z" fill="white" />
  </svg>
);

/* ── COD Icon ────────────────────────────────────────────── */
const CodIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#F97316" />
    <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontWeight="800" fontSize="10" fontFamily="Arial, sans-serif">
      COD
    </text>
  </svg>
);

/* ── Saved Address Storage Helpers ────────────────────────── */
const STORAGE_KEY = "electronest_checkout_addresses";

const getSavedAddresses = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveAddress = (address) => {
  const existing = getSavedAddresses();
  const updated = [address, ...existing.filter((a) => a.id !== address.id)].slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

const deleteAddress = (id) => {
  const existing = getSavedAddresses();
  const updated = existing.filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

/* ── Payment Methods ─────────────────────────────────────── */
const paymentMethods = [
  {
    id: "esewa",
    name: "eSewa",
    desc: "Pay via eSewa wallet",
    logo: EsewaLogo,
    color: "#60BB46",
    bgLight: "#f0fbe8",
    borderColor: "#60BB46",
  },
  {
    id: "khalti",
    name: "Khalti",
    desc: "Pay via Khalti wallet",
    logo: KhaltiLogo,
    color: "#5C2D91",
    bgLight: "#f3ecfc",
    borderColor: "#5C2D91",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    desc: "Direct bank transfer",
    logo: BankLogo,
    color: "#2563EB",
    bgLight: "#eff6ff",
    borderColor: "#2563EB",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    desc: "Pay when delivered",
    logo: CodIcon,
    color: "#F97316",
    bgLight: "#fff7ed",
    borderColor: "#F97316",
  },
];

/* ── Styles ──────────────────────────────────────────────── */
const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #fff7ed 0%, #ffffff 35%)",
    padding: "32px 24px 64px",
  },
  container: { maxWidth: 1200, margin: "0 auto" },
  /* breadcrumb */
  breadcrumb: {
    marginBottom: 24,
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#64748b",
  },
  breadcrumbLink: { color: "#64748b", textDecoration: "none", transition: "color .2s" },
  breadcrumbActive: { color: "#F97316", fontWeight: 500 },
  /* header */
  headerWrap: {
    marginBottom: 32,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 16,
  },
  title: {
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
    fontWeight: 800,
    color: "#1e293b",
    lineHeight: 1.15,
  },
  subtitle: { marginTop: 8, fontSize: 15, color: "#64748b" },
  secureTag: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: "#16a34a",
  },
  /* layout grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 400px",
    gap: 32,
    alignItems: "start",
  },
  /* cards */
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  cardTitleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#fff7ed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  /* form */
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  formGroupFull: { display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" },
  label: { fontSize: 13, fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: 6 },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 14,
    color: "#1e293b",
    background: "#f8fafc",
    outline: "none",
    transition: "border-color .2s, box-shadow .2s",
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 14,
    color: "#1e293b",
    background: "#f8fafc",
    outline: "none",
    transition: "border-color .2s, box-shadow .2s",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: 60,
  },
  /* saved addresses */
  savedAddrWrap: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 },
  savedAddrCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 12,
    cursor: "pointer",
    transition: "all .2s",
    background: "#fff",
  },
  savedAddrCardActive: {
    borderColor: "#F97316",
    background: "#fff7ed",
    boxShadow: "0 0 0 3px rgba(249,115,22,0.1)",
  },
  savedAddrRadio: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "2px solid #cbd5e1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "border-color .2s",
  },
  savedAddrRadioActive: {
    borderColor: "#F97316",
  },
  savedAddrDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#F97316",
  },
  savedAddrInfo: { flex: 1, minWidth: 0 },
  savedAddrName: { fontSize: 14, fontWeight: 600, color: "#1e293b" },
  savedAddrDetail: { fontSize: 12, color: "#64748b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  savedAddrDeleteBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 6,
    transition: "background .2s",
  },
  newAddrBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    background: "#fff7ed",
    border: "1.5px dashed #F97316",
    borderRadius: 12,
    color: "#F97316",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background .2s",
  },
  /* payment method */
  paymentGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12 },
  paymentCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "16px 12px",
    border: "2px solid #e2e8f0",
    borderRadius: 14,
    cursor: "pointer",
    transition: "all .22s ease",
    background: "#fff",
    textAlign: "center",
  },
  paymentName: { fontSize: 13, fontWeight: 700, color: "#1e293b" },
  paymentDesc: { fontSize: 11, color: "#94a3b8", marginTop: -4 },
  /* order summary sidebar */
  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    position: "sticky",
    top: 100,
  },
  summaryTitle: { fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 16 },
  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  summaryItemImg: {
    width: 52,
    height: 52,
    borderRadius: 10,
    objectFit: "cover",
    background: "#f1f5f9",
    flexShrink: 0,
  },
  summaryItemInfo: { flex: 1, minWidth: 0 },
  summaryItemName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1e293b",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  summaryItemQty: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  summaryItemPrice: { fontSize: 14, fontWeight: 700, color: "#F97316", flexShrink: 0 },
  summaryRow: { display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: "#64748b" },
  summaryVal: { fontWeight: 600, color: "#1e293b" },
  divider: { height: 1, background: "#e2e8f0", margin: "16px 0" },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 },
  totalLabel: { fontSize: 16, fontWeight: 600, color: "#1e293b" },
  totalVal: { fontSize: 24, fontWeight: 800, color: "#F97316" },
  /* buttons */
  placeOrderBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px",
    background: "#F97316",
    color: "#ffffff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(249,115,22,0.3)",
    transition: "background .2s, transform .1s",
    fontFamily: "inherit",
  },
  placeOrderBtnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  saveBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 8,
    color: "#16a34a",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .2s",
    fontFamily: "inherit",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "transparent",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    color: "#64748b",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .2s",
    textDecoration: "none",
    fontFamily: "inherit",
  },
  features: { marginTop: 20, display: "flex", flexDirection: "column", gap: 10 },
  featureItem: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b" },
  /* toast notification */
  toastOverlay: {
    position: "fixed",
    top: 24,
    right: 24,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    pointerEvents: "none",
  },
  toastCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "14px 20px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    animation: "slideIn .3s ease",
    pointerEvents: "auto",
    maxWidth: 360,
  },
  /* scrollable items */
  itemsScroll: { maxHeight: 240, overflowY: "auto", marginBottom: 12 },
};

/* ── Component ───────────────────────────────────────────── */
const Checkout = ({ cartItems = [], selectedIds = [], onPaymentSuccess }) => {

  /* -- form state -- */
  const emptyForm = {
    fullName: "",
    email: "",
    phone: "",
    city: "",
    street: "",
    landmark: "",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState(getSavedAddresses());
  const [selectedSavedId, setSelectedSavedId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(savedAddresses.length === 0);
  const [toasts, setToasts] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  /* -- cart calculations -- */
  const checkoutItems = selectedIds.length > 0
    ? cartItems.filter((item) => selectedIds.includes(item.id))
    : cartItems;
  const subtotal = checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = checkoutItems.reduce((acc, item) => acc + item.quantity, 0);
  const shipping = subtotal >= 5000 ? 0 : 150;
  const tax = Math.round(subtotal * 0.13); // 13% VAT Nepal
  const total = subtotal + shipping + tax;

  /* -- scroll to top on order success -- */
  useEffect(() => {
    if (orderPlaced) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [orderPlaced]);

  /* -- toast helper -- */
  const showToast = (title, description, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  /* -- form handlers -- */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (selectedSavedId) setSelectedSavedId(null);
  };

  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  const getInputStyle = (field) => ({
    ...s.input,
    ...(focusedField === field
      ? { borderColor: "#F97316", boxShadow: "0 0 0 3px rgba(249,115,22,0.1)" }
      : {}),
  });

  const getTextareaStyle = (field) => ({
    ...s.textarea,
    ...(focusedField === field
      ? { borderColor: "#F97316", boxShadow: "0 0 0 3px rgba(249,115,22,0.1)" }
      : {}),
  });

  /* -- saved address -- */
  const handleSaveAddress = () => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.city.trim() || !form.street.trim()) {
      showToast("Missing Fields", "Fill name, phone, city & street to save.", "error");
      return;
    }
    const addr = { ...form, id: Date.now().toString() };
    const updated = saveAddress(addr);
    setSavedAddresses(updated);
    setSelectedSavedId(addr.id);
    setShowNewAddress(false);
    showToast("Address Saved!", "Your delivery address has been saved.");
  };

  const handleSelectSaved = (addr) => {
    setSelectedSavedId(addr.id);
    setForm({
      fullName: addr.fullName,
      email: addr.email,
      phone: addr.phone,
      city: addr.city,
      street: addr.street,
      landmark: addr.landmark,
      notes: addr.notes,
    });
    setShowNewAddress(false);
  };

  const handleDeleteSaved = (id) => {
    const updated = deleteAddress(id);
    setSavedAddresses(updated);
    if (selectedSavedId === id) {
      setSelectedSavedId(null);
      setForm(emptyForm);
      setShowNewAddress(true);
    }
    showToast("Removed", "Saved address deleted.");
  };

  const handleNewAddress = () => {
    setSelectedSavedId(null);
    setForm(emptyForm);
    setShowNewAddress(true);
  };

  /* -- submit -- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (checkoutItems.length === 0) {
      showToast("Empty Cart", "Add items to cart first.", "error");
      return;
    }
    if (!form.fullName.trim() || !form.phone.trim() || !form.city.trim() || !form.street.trim()) {
      showToast("Missing Fields", "Please fill all required delivery fields.", "error");
      return;
    }
    if (!paymentMethod) {
      showToast("Payment Required", "Please select a payment method.", "error");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2200));

    const methodName = paymentMethods.find((m) => m.id === paymentMethod)?.name || paymentMethod;
    showToast(
      "Order Placed! 🎉",
      `Payment of ${formatPrice(total)} via ${methodName} is processing.`
    );

    const purchasedIds = checkoutItems.map((item) => item.id);
    if (typeof onPaymentSuccess === "function" && purchasedIds.length > 0) {
      onPaymentSuccess(purchasedIds);
    }

    setIsSubmitting(false);
    setOrderPlaced(true);
  };

  /* -- order placed success screen -- */
  if (orderPlaced) {
    return (
      <section style={s.page}>
        <div style={{ ...s.container, maxWidth: 600, textAlign: "center", padding: "80px 24px" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "#f0fdf4", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 24px",
            border: "3px solid #bbf7d0",
          }}>
            <CheckCircle size={40} color="#16a34a" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>
            Order Placed Successfully!
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", marginBottom: 32, lineHeight: 1.6 }}>
            Thank you for your purchase. Your order of {formatPrice(total)} is being processed.
            <br />You'll receive a confirmation shortly.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/" style={{
              ...s.placeOrderBtn,
              width: "auto",
              padding: "12px 28px",
              textDecoration: "none",
            }}>
              <Home size={18} /> Continue Shopping
            </Link>
            <Link to="/cart" style={{
              ...s.backBtn,
              textDecoration: "none",
              padding: "12px 28px",
            }}>
              Back to Cart
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={s.page}>
      <div style={s.container}>
        {/* Toast Notifications */}
        <div style={s.toastOverlay}>
          {toasts.map((t) => (
            <div key={t.id} style={{
              ...s.toastCard,
              borderLeft: `4px solid ${t.type === "error" ? "#ef4444" : "#16a34a"}`,
            }}>
              {t.type === "error"
                ? <span style={{ color: "#ef4444", fontSize: 18 }}>⚠️</span>
                : <CheckCircle size={18} color="#16a34a" />
              }
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{t.title}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{t.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={s.headerWrap}>
          <div>
            <h1 style={s.title}>Checkout</h1>
            <p style={s.subtitle}>
              {checkoutItems.length > 0
                ? `Complete your order — ${totalItems} selected item${totalItems !== 1 ? "s" : ""}`
                : "Your cart is empty. Add items to proceed."
              }
            </p>
          </div>
          <div style={s.secureTag}>
            <ShieldCheck size={14} />
            <span>SSL Encrypted & Secure</span>
          </div>
        </div>

        {checkoutItems.length === 0 ? (
          /* Empty state */
          <div style={{
            textAlign: "center", padding: "80px 24px",
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <CreditCard size={56} color="#F97316" strokeWidth={1.5} style={{ opacity: 0.8 }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginTop: 20 }}>
              Nothing to checkout
            </h2>
            <p style={{ color: "#64748b", marginTop: 8 }}>
              Add products to your cart before proceeding to checkout.
            </p>
            <Link to="/">
              <button style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                marginTop: 24, padding: "12px 28px", borderRadius: 12,
                border: "none", background: "#F97316", color: "#fff",
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                fontFamily: "inherit",
              }}>
                <ArrowRight size={18} /> Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={s.grid} className="checkout-grid">
              {/* LEFT COLUMN — Form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* ── Section 1: Saved Addresses ── */}
                {savedAddresses.length > 0 && (
                  <div style={s.card}>
                    <div style={s.cardTitle}>
                      <div style={s.cardTitleIcon}><MapPin size={16} color="#F97316" /></div>
                      Saved Addresses
                    </div>
                    <div style={s.savedAddrWrap}>
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          style={{
                            ...s.savedAddrCard,
                            ...(selectedSavedId === addr.id ? s.savedAddrCardActive : {}),
                          }}
                          onClick={() => handleSelectSaved(addr)}
                        >
                          <div style={{
                            ...s.savedAddrRadio,
                            ...(selectedSavedId === addr.id ? s.savedAddrRadioActive : {}),
                          }}>
                            {selectedSavedId === addr.id && <div style={s.savedAddrDot} />}
                          </div>
                          <div style={s.savedAddrInfo}>
                            <div style={s.savedAddrName}>{addr.fullName}</div>
                            <div style={s.savedAddrDetail}>
                              {addr.street}, {addr.city}{addr.landmark ? ` (near ${addr.landmark})` : ""}
                            </div>
                          </div>
                          <button
                            type="button"
                            style={s.savedAddrDeleteBtn}
                            onClick={(e) => { e.stopPropagation(); handleDeleteSaved(addr.id); }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    {!showNewAddress && (
                      <button type="button" style={s.newAddrBtn} onClick={handleNewAddress}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fed7aa30")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fff7ed")}
                      >
                        <Plus size={14} /> Use a different address
                      </button>
                    )}
                  </div>
                )}

                {/* ── Section 2: Personal Info + Delivery Address ── */}
                {(showNewAddress || savedAddresses.length === 0) && (
                  <div style={s.card}>
                    <div style={s.cardTitle}>
                      <div style={s.cardTitleIcon}><User size={16} color="#F97316" /></div>
                      Delivery Information
                    </div>
                    <div style={s.formGrid} className="checkout-form-grid">
                      <div style={s.formGroup}>
                        <label style={s.label}><User size={13} /> Full Name *</label>
                        <input
                          name="fullName"
                          placeholder="Ram Bahadur"
                          value={form.fullName}
                          onChange={handleChange}
                          onFocus={() => handleFocus("fullName")}
                          onBlur={handleBlur}
                          style={getInputStyle("fullName")}
                          required
                          maxLength={100}
                        />
                      </div>
                      <div style={s.formGroup}>
                        <label style={s.label}><Phone size={13} /> Phone Number *</label>
                        <input
                          name="phone"
                          type="tel"
                          placeholder="98XXXXXXXX"
                          value={form.phone}
                          onChange={handleChange}
                          onFocus={() => handleFocus("phone")}
                          onBlur={handleBlur}
                          style={getInputStyle("phone")}
                          required
                          maxLength={15}
                        />
                      </div>
                      <div style={s.formGroupFull}>
                        <label style={s.label}><Mail size={13} /> Email</label>
                        <input
                          name="email"
                          type="email"
                          placeholder="ram@example.com"
                          value={form.email}
                          onChange={handleChange}
                          onFocus={() => handleFocus("email")}
                          onBlur={handleBlur}
                          style={getInputStyle("email")}
                          maxLength={255}
                        />
                      </div>

                      {/* Delivery address section */}
                      <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 8,
                          marginBottom: 16, paddingBottom: 10,
                          borderBottom: "1px solid #f1f5f9",
                        }}>
                          <Truck size={16} color="#F97316" />
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Delivery Address</span>
                        </div>
                      </div>

                      <div style={s.formGroup}>
                        <label style={s.label}><MapPin size={13} /> City *</label>
                        <input
                          name="city"
                          placeholder="Kathmandu"
                          value={form.city}
                          onChange={handleChange}
                          onFocus={() => handleFocus("city")}
                          onBlur={handleBlur}
                          style={getInputStyle("city")}
                          required
                          maxLength={100}
                        />
                      </div>
                      <div style={s.formGroup}>
                        <label style={s.label}><Landmark size={13} /> Landmark</label>
                        <input
                          name="landmark"
                          placeholder="Near Bhatbhateni, Maharajgunj"
                          value={form.landmark}
                          onChange={handleChange}
                          onFocus={() => handleFocus("landmark")}
                          onBlur={handleBlur}
                          style={getInputStyle("landmark")}
                          maxLength={200}
                        />
                      </div>
                      <div style={s.formGroupFull}>
                        <label style={s.label}><Home size={13} /> Street Address *</label>
                        <input
                          name="street"
                          placeholder="Tole/Ward No, Street name"
                          value={form.street}
                          onChange={handleChange}
                          onFocus={() => handleFocus("street")}
                          onBlur={handleBlur}
                          style={getInputStyle("street")}
                          required
                          maxLength={300}
                        />
                      </div>
                      <div style={s.formGroupFull}>
                        <label style={s.label}>Order Notes (Optional)</label>
                        <textarea
                          name="notes"
                          placeholder="Any special delivery instructions..."
                          value={form.notes}
                          onChange={handleChange}
                          onFocus={() => handleFocus("notes")}
                          onBlur={handleBlur}
                          style={getTextareaStyle("notes")}
                          rows={2}
                          maxLength={500}
                        />
                      </div>
                    </div>

                    {/* Save address button */}
                    <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                      <button type="button" style={s.saveBtn} onClick={handleSaveAddress}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#dcfce7")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                      >
                        <Save size={14} /> Save this address
                      </button>
                      {savedAddresses.length > 0 && (
                        <button type="button" style={s.backBtn} onClick={() => setShowNewAddress(false)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Section 3: Payment Method ── */}
                <div style={s.card}>
                  <div style={s.cardTitle}>
                    <div style={s.cardTitleIcon}><CreditCard size={16} color="#F97316" /></div>
                    Payment Method
                  </div>
                  <div style={s.paymentGrid} className="checkout-payment-grid">
                    {paymentMethods.map((method) => {
                      const isActive = paymentMethod === method.id;
                      const LogoComp = method.logo;
                      return (
                        <div
                          key={method.id}
                          style={{
                            ...s.paymentCard,
                            borderColor: isActive ? method.borderColor : "#e2e8f0",
                            background: isActive ? method.bgLight : "#fff",
                            boxShadow: isActive ? `0 0 0 3px ${method.borderColor}22` : "none",
                            transform: isActive ? "scale(1.03)" : "scale(1)",
                          }}
                          onClick={() => setPaymentMethod(method.id)}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.borderColor = method.borderColor + "88";
                              e.currentTarget.style.transform = "scale(1.02)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.borderColor = "#e2e8f0";
                              e.currentTarget.style.transform = "scale(1)";
                            }
                          }}
                        >
                          <LogoComp size={44} />
                          <div style={{ ...s.paymentName, color: isActive ? method.color : "#1e293b" }}>
                            {method.name}
                          </div>
                          <div style={s.paymentDesc}>{method.desc}</div>
                          {isActive && (
                            <div style={{
                              width: 20, height: 20, borderRadius: "50%",
                              background: method.color,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <CheckCircle size={12} color="#fff" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile order summary + button */}
                <div className="checkout-mobile-summary" style={{ display: "none" }}>
                  <div style={s.card}>
                    <h3 style={s.summaryTitle}>Order Summary</h3>
                    <div style={s.itemsScroll}>
                      {checkoutItems.map((item) => (
                        <div key={item.id} style={s.summaryItem}>
                          <img src={item.image} alt={item.name} style={s.summaryItemImg} />
                          <div style={s.summaryItemInfo}>
                            <div style={s.summaryItemName}>{item.name}</div>
                            <div style={s.summaryItemQty}>Qty: {item.quantity}</div>
                          </div>
                          <div style={s.summaryItemPrice}>{formatPrice(item.price * item.quantity)}</div>
                        </div>
                      ))}
                    </div>
                    <div style={s.divider} />
                    <div style={s.summaryRow}>
                      <span>Subtotal</span>
                      <span style={s.summaryVal}>{formatPrice(subtotal)}</span>
                    </div>
                    <div style={s.summaryRow}>
                      <span>Shipping</span>
                      <span style={{ ...s.summaryVal, color: shipping === 0 ? "#16a34a" : "#1e293b" }}>
                        {shipping === 0 ? "Free" : formatPrice(shipping)}
                      </span>
                    </div>
                    <div style={s.summaryRow}>
                      <span>VAT (13%)</span>
                      <span style={s.summaryVal}>{formatPrice(tax)}</span>
                    </div>
                    <div style={s.divider} />
                    <div style={s.totalRow}>
                      <span style={s.totalLabel}>Total</span>
                      <span style={s.totalVal}>{formatPrice(total)}</span>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        ...s.placeOrderBtn,
                        ...(isSubmitting ? s.placeOrderBtnDisabled : {}),
                      }}
                    >
                      {isSubmitting ? "Processing..." : <>Place Order — {formatPrice(total)} <ArrowRight size={16} /></>}
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN — Order Summary Sidebar */}
              <div className="checkout-sidebar">
                <div style={s.summaryCard}>
                  <h3 style={s.summaryTitle}>Order Summary</h3>

                  {/* Items list */}
                  <div style={s.itemsScroll}>
                    {checkoutItems.map((item) => (
                      <div key={item.id} style={s.summaryItem}>
                        <img src={item.image} alt={item.name} style={s.summaryItemImg} />
                        <div style={s.summaryItemInfo}>
                          <div style={s.summaryItemName}>{item.name}</div>
                          <div style={s.summaryItemQty}>Qty: {item.quantity}</div>
                        </div>
                        <div style={s.summaryItemPrice}>{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>

                  <div style={s.divider} />

                  <div style={s.summaryRow}>
                    <span>Subtotal ({totalItems} items)</span>
                    <span style={s.summaryVal}>{formatPrice(subtotal)}</span>
                  </div>
                  <div style={s.summaryRow}>
                    <span>Shipping</span>
                    <span style={{ ...s.summaryVal, color: shipping === 0 ? "#16a34a" : "#1e293b" }}>
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div style={s.summaryRow}>
                    <span>VAT (13%)</span>
                    <span style={s.summaryVal}>{formatPrice(tax)}</span>
                  </div>
                  <div style={s.divider} />
                  <div style={s.totalRow}>
                    <span style={s.totalLabel}>Order Total</span>
                    <span style={s.totalVal}>{formatPrice(total)}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      ...s.placeOrderBtn,
                      ...(isSubmitting ? s.placeOrderBtnDisabled : {}),
                    }}
                    onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = "#ea580c"; }}
                    onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = "#F97316"; }}
                  >
                    {isSubmitting ? (
                      <span style={{ animation: "pulse 1.5s infinite" }}>Processing payment...</span>
                    ) : (
                      <>Place Order — {formatPrice(total)} <ArrowRight size={16} /></>
                    )}
                  </button>

                  {/* Security features */}
                  <div style={s.features}>
                    <div style={s.featureItem}>
                      <ShieldCheck size={15} color="#16a34a" />
                      <span>Secure SSL Encryption</span>
                    </div>
                    <div style={s.featureItem}>
                      <Truck size={15} color="#F97316" />
                      <span>{shipping === 0 ? "Free shipping on this order" : "Free shipping on orders over ₹5000"}</span>
                    </div>
                    <div style={s.featureItem}>
                      <Lock size={15} color="#64748b" />
                      <span>Your data is safe with us</span>
                    </div>
                  </div>

                  {/* Payment logos strip */}
                  <div style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                  }}>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Accepted:</span>
                    <EsewaLogo size={28} />
                    <KhaltiLogo size={28} />
                    <BankLogo size={28} />
                    <CodIcon size={28} />
                  </div>
                </div>

                {/* Back to cart link */}
                <Link to="/cart" style={{
                  ...s.backBtn,
                  width: "100%",
                  justifyContent: "center",
                  marginTop: 12,
                  padding: "10px",
                  textDecoration: "none",
                  display: "flex",
                }}>
                  <ArrowLeft size={14} /> Back to Cart
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Responsive + animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-sidebar {
            display: none !important;
          }
          .checkout-mobile-summary {
            display: block !important;
          }
        }
        @media (max-width: 600px) {
          .checkout-form-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-form-grid > * {
            grid-column: auto !important;
          }
          .checkout-payment-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Checkout;
