const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecom-cart';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
  initializeProducts();
})
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.log('Note: Make sure MongoDB is running or use MongoDB Atlas');
  console.log('The server will start but database operations will fail until MongoDB is connected.');
});

// Schemas
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String
}, { timestamps: true });

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  items: [{
    product: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
      image: String,
      category: String
    },
    quantity: Number,
    itemTotal: Number
  }],
  total: { type: Number, required: true },
  status: { type: String, default: 'confirmed' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const CartItem = mongoose.model('CartItem', cartItemSchema);
const Order = mongoose.model('Order', orderSchema);

// Initialize products if database is empty
async function initializeProducts() {
  const count = await Product.countDocuments();
  if (count === 0) {
    const products = [
      {
        name: "Classic Monogram Handbag",
        price: 125000,
        description: "Timeless elegance meets modern luxury",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
        category: "Handbags"
      },
      {
        name: "Leather Traveler Wallet",
        price: 45000,
        description: "Premium leather craftsmanship",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
        category: "Accessories"
      },
      {
        name: "Signature Sunglasses",
        price: 35000,
        description: "Sophisticated style for every occasion",
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
        category: "Accessories"
      },
      {
        name: "Luxury Watch Collection",
        price: 285000,
        description: "Precision timepiece with elegant design",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        category: "Watches"
      },
      {
        name: "Designer Scarf",
        price: 28000,
        description: "Silk elegance in every fold",
        image: "https://images.unsplash.com/photo-1562176603-48b2cf0d96b3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1926",
        category: "Accessories"
      },
      {
        name: "Premium Leather Belt",
        price: 32000,
        description: "Classic design with modern comfort",
        image: "https://images.unsplash.com/photo-1664286074240-d7059e004dff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJlbWl1bSUyMGxlYXRoZXIlMjBiZWx0fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600",
        category: "Accessories"
      },
      {
        name: "Evening Clutch",
        price: 68000,
        description: "The perfect companion for special occasions",
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800",
        category: "Handbags"
      },
      {
        name: "Signature Perfume",
        price: 15000,
        description: "An unforgettable fragrance experience",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
        category: "Fragrance"
      }
    ];
    await Product.insertMany(products);
    console.log('Products initialized');
  }
}

// Routes

// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', message: error.message });
  }
});

// POST /api/cart
app.post('/api/cart', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid productId or quantity' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingItem = await CartItem.findOne({ productId });
    
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      res.json(existingItem);
    } else {
      const cartItem = new CartItem({ productId, quantity });
      await cartItem.save();
      res.json(cartItem);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item to cart', message: error.message });
  }
});

// GET /api/cart
app.get('/api/cart', async (req, res) => {
  try {
    const cartItems = await CartItem.find().populate('productId');
    
    let total = 0;
    const items = cartItems.map(item => {
      const itemTotal = item.productId.price * item.quantity;
      total += itemTotal;
      return {
        _id: item._id,
        product: item.productId,
        quantity: item.quantity,
        itemTotal: itemTotal
      };
    });

    res.json({ items, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart', message: error.message });
  }
});

// DELETE /api/cart/:id
app.delete('/api/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await CartItem.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    res.json({ message: 'Item removed from cart', item: deletedItem });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item from cart', message: error.message });
  }
});

// PUT /api/cart/:id
app.put('/api/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const cartItem = await CartItem.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    ).populate('productId');
    
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart item', message: error.message });
  }
});

// POST /api/checkout
app.post('/api/checkout', async (req, res) => {
  try {
    const { name, email, cartItems } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Get cart items with product details
    const cartItemsDb = await CartItem.find().populate('productId');
    
    if (cartItemsDb.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let total = 0;
    const orderItems = cartItemsDb.map(item => {
      const itemTotal = item.productId.price * item.quantity;
      total += itemTotal;
      return {
        product: {
          _id: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          image: item.productId.image,
          category: item.productId.category
        },
        quantity: item.quantity,
        itemTotal: itemTotal
      };
    });

    const orderId = `ORD-${Date.now()}`;
    
    // Create order in database
    const order = new Order({
      orderId: orderId,
      customer: {
        name: name,
        email: email
      },
      items: orderItems,
      total: total,
      status: 'confirmed',
      timestamp: new Date()
    });

    await order.save();

    // Clear cart after checkout
    await CartItem.deleteMany({});

    res.json({
      orderId: order.orderId,
      customer: order.customer,
      total: order.total,
      timestamp: order.timestamp,
      status: order.status
    });
  } catch (error) {
    res.status(500).json({ error: 'Checkout failed', message: error.message });
  }
});

// GET /api/orders/:email - Get orders by email
app.get('/api/orders/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const orders = await Order.find({ 'customer.email': email })
      .sort({ timestamp: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
  }
});

// GET /api/orders/detail/:orderId - Get specific order details
app.get('/api/orders/detail/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId: orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});