# Quick Setup Guide

## Step-by-Step Installation

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 2. Set Up Database

**Option A: MongoDB (Recommended)**

1. Install MongoDB locally or use MongoDB Atlas
2. Create `server/.env` file:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecom-cart
   ```
3. If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string

**Option B: SQLite (Alternative)**

1. Install SQLite3:
   ```bash
   cd server
   npm install sqlite3
   ```
2. Rename `index-sqlite.js` to `index.js` (backup the MongoDB version first)
3. The database file will be created automatically at `server/ecom-cart.db`

### 3. Start the Application

**Option 1: Run both together (Recommended)**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is installed and running
- Check connection string in `server/.env`
- For MongoDB Atlas, verify IP whitelist settings

### Port Already in Use
- Change PORT in `server/.env` if 5000 is taken
- React app will ask to use a different port if 3000 is taken

### Module Not Found
- Make sure you've run `npm install` in both `server/` and `client/` directories
- Delete `node_modules` and `package-lock.json`, then reinstall

## Testing the API

You can test the API endpoints using curl or Postman:

```bash
# Get all products
curl http://localhost:5000/api/products

# Get cart
curl http://localhost:5000/api/cart

# Add item to cart
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId": "PRODUCT_ID", "quantity": 1}'
```

## Notes

- Products are automatically initialized when the server starts
- Cart persists in the database
- The application uses a proxy in development (configured in `client/package.json`)

