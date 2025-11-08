import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Products.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
      console.error(err);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cart`);
      const totalItems = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(totalItems);
    } catch (err) {
      console.error('Failed to fetch cart count:', err);
    }
  };

  const handleAddToCart = async (productId) => {
    setAddingToCart(productId);
    try {
      await axios.post(`${API_URL}/api/cart`, {
        productId,
        quantity: 1
      });
      await fetchCartCount();
      // Update parent component's cart count if needed
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      alert('Failed to add item to cart');
      console.error(err);
    } finally {
      setAddingToCart(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading luxury collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchProducts} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-hero">
        <h1 className="hero-title">Discover Our Collection</h1>
        <p className="hero-subtitle">Timeless elegance, crafted for you</p>
      </div>
      <div className="products-container">
        <div className="products-grid">
          {products.map(product => (
            <div key={product._id} className="product-card">
              <div className="product-image-container">
                <img 
                  src={product.image || 'https://via.placeholder.com/400x500'} 
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x500?text=Product';
                  }}
                />
                <div className="product-overlay">
                  <button
                    className="btn-primary add-to-cart-btn"
                    onClick={() => handleAddToCart(product._id)}
                    disabled={addingToCart === product._id}
                  >
                    {addingToCart === product._id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-price">{formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Products;

