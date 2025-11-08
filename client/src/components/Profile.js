import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function Profile() {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    // Check if user email is stored in localStorage
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      setIsLoggedIn(true);
      fetchOrders(storedEmail);
    }
  }, []);

  const fetchOrders = async (userEmail) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/orders/${userEmail}`);
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    // Store email in localStorage
    localStorage.setItem('userEmail', email);
    setIsLoggedIn(true);
    fetchOrders(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    setEmail('');
    setIsLoggedIn(false);
    setOrders([]);
    setSelectedOrder(null);
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

  if (!isLoggedIn) {
    return (
      <div className="profile-page">
        <div className="profile-login">
          <div className="login-card">
            <h2>View Your Orders</h2>
            <p className="login-subtitle">Enter your email to access your order history</p>
            <form onSubmit={handleLogin} className="login-form">
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <button type="submit" className="btn-primary">
                View Orders
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="profile-page">
        <div className="order-detail-container">
          <button className="back-btn" onClick={() => setSelectedOrder(null)}>
            ← Back to Orders
          </button>
          <div className="order-detail-card">
            <div className="order-detail-header">
              <div>
                <h2>Order Details</h2>
                <p className="order-id">Order ID: {selectedOrder.orderId}</p>
              </div>
              <div className="order-status-badge">{selectedOrder.status}</div>
            </div>
            
            <div className="order-detail-section">
              <h3>Customer Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{selectedOrder.customer.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedOrder.customer.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Order Date:</span>
                  <span className="info-value">{formatDate(selectedOrder.timestamp)}</span>
                </div>
              </div>
            </div>

            <div className="order-detail-section">
              <h3>Items Ordered</h3>
              <div className="order-items-list">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="order-detail-item">
                    <div className="order-item-image">
                      <img 
                        src={item.product.image || 'https://via.placeholder.com/100'} 
                        alt={item.product.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100?text=Product';
                        }}
                      />
                    </div>
                    <div className="order-item-info">
                      <h4>{item.product.name}</h4>
                      <p className="item-category">{item.product.category}</p>
                      <p className="item-price">{formatPrice(item.product.price)} × {item.quantity}</p>
                    </div>
                    <div className="order-item-total">
                      {formatPrice(item.itemTotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-detail-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div>
            <h1>My Profile</h1>
            <p className="profile-email">{email}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary logout-btn">
            Logout
          </button>
        </div>

        <div className="orders-section">
          <h2>Order History</h2>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={() => fetchOrders(email)} className="btn-primary">
                Retry
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <p>You haven't placed any orders yet.</p>
              <a href="/" className="btn-primary">Start Shopping</a>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <h3>{order.orderId}</h3>
                      <p className="order-date">{formatDate(order.timestamp)}</p>
                    </div>
                    <span className="status-badge">{order.status}</span>
                  </div>
                  
                  <div className="order-card-items">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="order-card-item">
                        <img 
                          src={item.product.image || 'https://via.placeholder.com/60'} 
                          alt={item.product.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60?text=Product';
                          }}
                        />
                        <div className="order-card-item-info">
                          <p className="item-name">{item.product.name}</p>
                          <p className="item-quantity">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="more-items">+{order.items.length - 3} more item(s)</p>
                    )}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total">
                      <span>Total:</span>
                      <span className="total-amount">{formatPrice(order.total)}</span>
                    </div>
                    <button 
                      className="btn-outline"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;