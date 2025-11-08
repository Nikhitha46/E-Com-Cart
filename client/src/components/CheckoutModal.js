import React, { useState } from 'react';
import axios from 'axios';
import './CheckoutModal.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function CheckoutModal({ cart, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cartItems = cart.items.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }));

      const response = await axios.post(`${API_URL}/api/checkout`, {
        name: formData.name,
        email: formData.email,
        cartItems
      });

      setReceipt(response.data);
      // Don't dispatch cart update here - wait for user to click Continue Shopping
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleContinueShopping = () => {
    // Dispatch cart update event now
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    // Call onSuccess to close modal and navigate
    onSuccess();
  };

  if (receipt) {
    return (
      <div className="modal-overlay">
        <div className="modal-content receipt-content" onClick={(e) => e.stopPropagation()}>
          <div className="receipt-header">
            <h2>Order Confirmed</h2>
            <p className="receipt-subtitle">Thank you for your purchase</p>
          </div>
          <div className="receipt-body">
            <div className="receipt-info">
              <div className="receipt-row">
                <span>Order ID:</span>
                <span className="order-id">{receipt.orderId}</span>
              </div>
              <div className="receipt-row">
                <span>Customer Name:</span>
                <span>{receipt.customer.name}</span>
              </div>
              <div className="receipt-row">
                <span>Email:</span>
                <span>{receipt.customer.email}</span>
              </div>
              <div className="receipt-row">
                <span>Date:</span>
                <span>{formatDate(receipt.timestamp)}</span>
              </div>
            </div>
            <div className="receipt-divider"></div>
            <div className="receipt-items">
              <h3>Items Purchased</h3>
              {cart.items.map(item => (
                <div key={item._id} className="receipt-item">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>{formatPrice(item.itemTotal)}</span>
                </div>
              ))}
            </div>
            <div className="receipt-divider"></div>
            <div className="receipt-total">
              <span>Total Amount:</span>
              <span className="total-amount">{formatPrice(receipt.total)}</span>
            </div>
          </div>
          <div className="receipt-footer">
            <button className="btn-primary" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="checkout-header">
          <h2>Checkout</h2>
          <p className="checkout-subtitle">Please provide your details to complete your order</p>
        </div>
        <form className="checkout-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
            />
          </div>
          <div className="checkout-summary">
            <div className="summary-row">
              <span>Total Amount:</span>
              <span className="total-amount">{formatPrice(cart.total)}</span>
            </div>
          </div>
          <div className="checkout-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Complete Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckoutModal;