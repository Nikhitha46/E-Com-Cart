# Vibe Commerce - E-Commerce Shopping Cart

A full-stack e-commerce shopping cart application with a luxury design inspired by high-end fashion brands. Built with React (frontend), Node.js/Express (backend), and MongoDB (database).

## Features

- ✅ Product catalog with elegant product grid
- ✅ Add/remove items from shopping cart
- ✅ Update item quantities in cart
- ✅ Cart total calculation
- ✅ Checkout form with receipt generation
- ✅ Responsive design for all devices
- ✅ MongoDB persistence for cart and products
- ✅ Error handling throughout the application
- ✅ Luxury UI/UX design

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- CSS3 with luxury styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- RESTful API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd E-Com-Cart
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up MongoDB**
   
   Option A: Local MongoDB
   - Install MongoDB locally
   - Make sure MongoDB service is running
   - The default connection string is: `mongodb://localhost:27017/ecom-cart`

   Option B: MongoDB Atlas (Cloud)
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster and get your connection string
   - Update the connection string in `server/.env`

4. **Configure environment variables**
   
   Create a `server/.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecom-cart
   ```
   
   Or for MongoDB Atlas:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   ```

## Running the Application

### Option 1: Run both server and client together (Recommended)
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

### Option 2: Run separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## API Endpoints

### Products
- `GET /api/products` - Get all products

### Cart
- `GET /api/cart` - Get cart items with total
- `POST /api/cart` - Add item to cart
  ```json
  {
    "productId": "product_id",
    "quantity": 1
  }
  ```
- `DELETE /api/cart/:id` - Remove item from cart
- `PUT /api/cart/:id` - Update item quantity
  ```json
  {
    "quantity": 2
  }
  ```

### Checkout
- `POST /api/checkout` - Process checkout
  ```json
  {
    "name": "Customer Name",
    "email": "customer@email.com",
    "cartItems": [
      {
        "productId": "product_id",
        "quantity": 1
      }
    ]
  }
  ```

## Project Structure

```
E-Com-Cart/
├── server/
│   ├── index.js          # Express server and API routes
│   ├── package.json      # Server dependencies
│   └── .env              # Environment variables (create this)
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js          # Navigation component
│   │   │   ├── Products.js        # Products grid
│   │   │   ├── Cart.js            # Shopping cart
│   │   │   └── CheckoutModal.js   # Checkout form and receipt
│   │   ├── App.js                 # Main app component
│   │   ├── App.css                # Global styles
│   │   └── index.js               # React entry point
│   └── package.json      # Client dependencies
├── package.json          # Root package.json with scripts
└── README.md
```

## Features in Detail

### Product Catalog
- Displays 8 luxury products with images, names, categories, and prices
- Hover effects with "Add to Cart" button
- Responsive grid layout

### Shopping Cart
- View all cart items with quantities
- Update item quantities (+/- buttons)
- Remove items from cart
- Real-time total calculation
- Persistent cart (saved in MongoDB)

### Checkout
- Customer information form (name, email)
- Order summary
- Receipt generation with order ID
- Order confirmation modal

## Design

The application features a luxury design with:
- Elegant typography (Playfair Display for headings, Inter for body)
- Sophisticated color palette (dark blacks, gold accents)
- Smooth animations and transitions
- Clean, minimalist layout
- Responsive design for mobile, tablet, and desktop

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running: `mongod` or check MongoDB service
- Verify connection string in `server/.env`
- For MongoDB Atlas, check IP whitelist and connection string

### Port Already in Use
- Change PORT in `server/.env` if 5000 is taken
- Change React app port by setting `PORT=3001` in `client/.env`

### CORS Errors
- Ensure backend server is running before starting frontend
- Check that proxy is set correctly in `client/package.json`

## Future Enhancements

- User authentication and profiles
- Product search and filtering
- Product categories and filters
- Order history
- Payment integration (Stripe, PayPal)
- Admin dashboard
- Product reviews and ratings
- Wishlist functionality

## License

This project is created for Vibe Commerce screening assignment.

## Author

Built with ❤️ for Vibe Commerce

