import React from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartPage = ({ cartItems, removeFromCart, updateCartQuantity }) => {
  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-content">
          <div className="cart-icon-wrapper">
            <ShoppingBag size={80} strokeWidth={1.5} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Start shopping to add items to your cart</p>
          <Link to="/products" className="browse-btn">
            <ShoppingBag size={18} />
            <span>Browse Products</span>
          </Link>
        </div>

        <style jsx>{`
          .empty-cart-container {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
          }

          .empty-cart-content {
            text-align: center;
            padding: 3rem 2rem;
          }

          .cart-icon-wrapper {
            color: #5b47fb;
            margin-bottom: 1.5rem;
            opacity: 0.3;
          }

          .empty-cart-content h2 {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
          }

          .empty-cart-content p {
            font-size: 1rem;
            color: #666;
            margin-bottom: 2rem;
          }

          .browse-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 1.75rem;
            background: #5b47fb;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
          }

          .browse-btn:hover {
            background: #4a38d9;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(91, 71, 251, 0.3);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-main">
          <h1>Shopping Cart ({totalCartItems} item{totalCartItems !== 1 ? 's' : ''})</h1>

          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                </div>
                <div className="item-actions">
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="item-total">${(item.price * item.quantity).toFixed(2)}</div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="clear-cart-btn" onClick={() => cartItems.forEach(item => removeFromCart(item.id))}>
            <Trash2 size={16} />
            Clear Cart
          </button>
        </div>

        <div className="cart-sidebar">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal ({totalCartItems} item{totalCartItems !== 1 ? 's' : ''})</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping">Free</span>
            </div>
            <div className="summary-row">
              <span>Tax (estimated)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-total">
              <span>Total</span>
              <span className="total-amount">${total.toFixed(2)}</span>
            </div>
            <button className="checkout-btn">
              <span>Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cart-page {
          min-height: 70vh;
          background: #f8f9fa;
          padding: 2rem 0;
        }

        .cart-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
        }

        .cart-main h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 1.5rem;
        }

        .cart-items {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .cart-item {
          display: grid;
          grid-template-columns: 80px 1fr auto;
          gap: 1.25rem;
          padding: 1.5rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .cart-item img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .item-info h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .item-price {
          font-size: 1.125rem;
          color: #5b47fb;
          font-weight: 700;
          margin: 0;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
        }

        .quantity-controls button {
          width: 28px;
          height: 28px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          transition: all 0.2s ease;
        }

        .quantity-controls button:hover {
          background: #5b47fb;
          color: white;
          border-color: #5b47fb;
        }

        .quantity {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1a1a1a;
          min-width: 24px;
          text-align: center;
        }

        .item-total {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a1a1a;
          min-width: 80px;
          text-align: right;
        }

        .remove-btn {
          width: 36px;
          height: 36px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #999;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .remove-btn:hover {
          background: #fee;
          color: #ef4444;
        }

        .clear-cart-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.625rem 1.25rem;
          background: transparent;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-cart-btn:hover {
          background: #fef2f2;
          border-color: #ef4444;
        }

        .cart-sidebar {
          position: sticky;
          top: 6rem;
          height: fit-content;
        }

        .order-summary {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .order-summary h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 1.25rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }

        .summary-row span:first-child {
          color: #666;
        }

        .summary-row span:last-child {
          font-weight: 600;
          color: #1a1a1a;
        }

        .free-shipping {
          color: #10b981 !important;
        }

        .summary-divider {
          height: 1px;
          background: #f0f0f0;
          margin: 1.25rem 0;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          font-size: 1.125rem;
        }

        .summary-total span:first-child {
          font-weight: 700;
          color: #1a1a1a;
        }

        .total-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #5b47fb;
        }

        .checkout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #5b47fb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .checkout-btn:hover {
          background: #4a38d9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(91, 71, 251, 0.3);
        }

        @media (max-width: 968px) {
          .cart-container {
            grid-template-columns: 1fr;
          }

          .cart-sidebar {
            position: static;
          }

          .item-actions {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.75rem;
          }
        }

        @media (max-width: 640px) {
          .cart-item {
            grid-template-columns: 60px 1fr;
            gap: 1rem;
          }

          .item-actions {
            grid-column: 1 / -1;
            flex-direction: row;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default CartPage;