// Alternative SQLite implementation (optional)
// To use SQLite instead of MongoDB, rename this file to index.js
// and install: npm install sqlite3

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite Database
const dbPath = path.join(__dirname, 'ecom-cart.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('SQLite database connected');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image TEXT,
      category TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Cart items table
    db.run(`CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES products(id)
    )`);

    // Initialize products
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (err) {
        console.error('Error checking products:', err);
        return;
      }
      if (row.count === 0) {
        const products = [
          {
            id: '1',
            name: "Classic Monogram Handbag",
            price: 125000,
            description: "Timeless elegance meets modern luxury",
            image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
            category: "Handbags"
          },
          {
            id: '2',
            name: "Leather Traveler Wallet",
            price: 45000,
            description: "Premium leather craftsmanship",
            image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
            category: "Accessories"
          },
          {
            id: '3',
            name: "Signature Sunglasses",
            price: 35000,
            description: "Sophisticated style for every occasion",
            image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
            category: "Accessories"
          },
          {
            id: '4',
            name: "Luxury Watch Collection",
            price: 285000,
            description: "Precision timepiece with elegant design",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
            category: "Watches"
          },
          {
            id: '5',
            name: "Designer Scarf",
            price: 28000,
            description: "Silk elegance in every fold",
            image: "https://images.unsplash.com/photo-1562176603-48b2cf0d96b3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1926",
            category: "Accessories"
          },
          {
            id: '6',
            name: "Premium Leather Belt",
            price: 32000,
            description: "Classic design with modern comfort",
            image: "https://images.unsplash.com/photo-1664286074240-d7059e004dff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJlbWl1bSUyMGxlYXRoZXIlMjBiZWx0fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600",
            category: "Accessories"
          },
          {
            id: '7',
            name: "Evening Clutch",
            price: 68000,
            description: "The perfect companion for special occasions",
            image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800",
            category: "Handbags"
          },
          {
            id: '8',
            name: "Signature Perfume",
            price: 15000,
            description: "An unforgettable fragrance experience",
            image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
            category: "Fragrance"
          }
        ];

        const stmt = db.prepare('INSERT INTO products (id, name, price, description, image, category) VALUES (?, ?, ?, ?, ?, ?)');
        products.forEach(product => {
          stmt.run(product.id, product.name, product.price, product.description, product.image, product.category);
        });
        stmt.finalize();
        console.log('Products initialized');
      }
    });
  });
}

// Helper function to generate ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Routes

// GET /api/products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch products', message: err.message });
    } else {
      res.json(rows);
    }
  });
});

// POST /api/cart
app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;
  
  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid productId or quantity' });
  }

  // Check if product exists
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already in cart
    db.get('SELECT * FROM cart_items WHERE productId = ?', [productId], (err, existingItem) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', message: err.message });
      }

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, existingItem.id], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update cart', message: err.message });
          }
          db.get('SELECT * FROM cart_items WHERE id = ?', [existingItem.id], (err, updatedItem) => {
            if (err) {
              return res.status(500).json({ error: 'Database error', message: err.message });
            }
            res.json(updatedItem);
          });
        });
      } else {
        const id = generateId();
        db.run('INSERT INTO cart_items (id, productId, quantity) VALUES (?, ?, ?)', 
          [id, productId, quantity], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to add item to cart', message: err.message });
          }
          db.get('SELECT * FROM cart_items WHERE id = ?', [id], (err, newItem) => {
            if (err) {
              return res.status(500).json({ error: 'Database error', message: err.message });
            }
            res.json(newItem);
          });
        });
      }
    });
  });
});

// GET /api/cart
app.get('/api/cart', (req, res) => {
  db.all(`
    SELECT 
      c.id as _id,
      c.quantity,
      p.id as product_id,
      p.name as product_name,
      p.price as product_price,
      p.description as product_description,
      p.image as product_image,
      p.category as product_category,
      (p.price * c.quantity) as item_total
    FROM cart_items c
    JOIN products p ON c.productId = p.id
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch cart', message: err.message });
    }

    let total = 0;
    const items = rows.map(row => {
      total += row.item_total;
      return {
        _id: row._id,
        product: {
          _id: row.product_id,
          name: row.product_name,
          price: row.product_price,
          description: row.product_description,
          image: row.product_image,
          category: row.product_category
        },
        quantity: row.quantity,
        itemTotal: row.item_total
      };
    });

    res.json({ items, total });
  });
});

// DELETE /api/cart/:id
app.delete('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM cart_items WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to remove item from cart', message: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json({ message: 'Item removed from cart' });
  });
});

// PUT /api/cart/:id
app.put('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update cart item', message: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    db.get('SELECT * FROM cart_items WHERE id = ?', [id], (err, cartItem) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', message: err.message });
      }
      res.json(cartItem);
    });
  });
});

// POST /api/checkout
app.post('/api/checkout', (req, res) => {
  const { name, email, cartItems } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Calculate total
  db.all(`
    SELECT 
      c.productId,
      c.quantity,
      p.price
    FROM cart_items c
    JOIN products p ON c.productId = p.id
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Checkout failed', message: err.message });
    }

    let total = 0;
    const items = rows.map(row => {
      const itemTotal = row.price * row.quantity;
      total += itemTotal;
      return {
        productId: row.productId,
        quantity: row.quantity
      };
    });

    const receipt = {
      orderId: `ORD-${Date.now()}`,
      customer: {
        name,
        email
      },
      items: items,
      total: total,
      timestamp: new Date().toISOString(),
      status: 'confirmed'
    };

    // Clear cart after checkout
    db.run('DELETE FROM cart_items', (err) => {
      if (err) {
        console.error('Error clearing cart:', err);
      }
    });

    res.json(receipt);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Close database on exit
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});

