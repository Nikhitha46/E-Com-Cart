import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await fetch('/api/cart');
        if (response.ok) {
          const data = await response.json();
          const totalItems = data.items.reduce((sum, item) => sum + item.quantity, 0);
          setCartItemCount(totalItems);
        }
      } catch (err) {
        console.error('Failed to fetch cart count:', err);
      }
    };

    fetchCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('cartCountUpdate', (e) => {
      setCartItemCount(e.detail);
    });

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('cartCountUpdate', handleCartUpdate);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">MAISONÉ</span>
          <span className="logo-subtitle">COMMERCE</span>
        </Link>
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Shop</Link>
          <Link to="/cart" className="navbar-link cart-link">
            Cart
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

