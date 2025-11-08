import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CheckoutModal from './CheckoutModal';
import './Cart.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function Cart() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCart();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cart`);
      setCart(response.data);
      setLoading(false);
      // Update cart count in navbar
      const totalItems = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
      window.dispatchEvent(new CustomEvent('cartCountUpdate', { detail: totalItems }));
    } catch (err) {
      setError('Failed to load cart');
      setLoading(false);
      console.error(err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/api/cart/${itemId}`);
      await fetchCart();
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      alert('Failed to remove item');
      console.error(err);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    setUpdating(itemId);
    try {
      await axios.put(`${API_URL}/api/cart/${itemId}`, {
        quantity: newQuantity
      });
      await fetchCart();
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      alert('Failed to update quantity');
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setCart({ items: [], total: 0 });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchCart} className="btn-primary">Retry</button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>Your Cart is Empty</h2>
          <p>Discover our luxury collection</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <p className="cart-item-count">{cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}</p>
      </div>
      <div className="cart-container">
        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item._id} className="cart-item">
              <div className="cart-item-image">
                <img 
                  src={item.product.image || 'https://via.placeholder.com/200'} 
                  alt={item.product.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200?text=Product';
                  }}
                />
              </div>
              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.product.name}</h3>
                <p className="cart-item-category">{item.product.category}</p>
                <p className="cart-item-price">{formatPrice(item.product.price)}</p>
              </div>
              <div className="cart-item-quantity">
                <button
                  className="quantity-btn"
                  onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                  disabled={updating === item._id}
                >
                  −
                </button>
                <span className="quantity-value">{item.quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                  disabled={updating === item._id}
                >
                  +
                </button>
              </div>
              <div className="cart-item-total">
                <p className="item-total-price">{formatPrice(item.itemTotal)}</p>
              </div>
              <button
                className="remove-btn"
                onClick={() => handleRemoveItem(item._id)}
                disabled={updating === item._id}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <div className="summary-card">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
            <button className="btn-primary checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
}

export default Cart;

