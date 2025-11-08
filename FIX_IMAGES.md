# Fix Missing Product Images

## Problem
The Designer Scarf and Premium Leather Belt images were not loading.

## Solution
Image URLs have been updated. Choose one of the following methods:

### Method 1: Update Existing Products (Recommended)

If you already have products in your database, run the update script:

```bash
cd server
npm run update-images
```

This will update the image URLs for the Designer Scarf and Premium Leather Belt without affecting other data.

### Method 2: Reset Database

If you want to start fresh with all new image URLs:

1. **Using MongoDB Compass or mongo shell:**
   ```bash
   # Connect to MongoDB
   mongo
   
   # Switch to your database
   use ecom-cart
   
   # Delete all products
   db.products.deleteMany({})
   ```

2. **Or restart your server** - The products will be re-initialized automatically when the server starts if the products collection is empty.

### Method 3: Manual Update via MongoDB

If you prefer to update manually:

```javascript
// In MongoDB shell or Compass
db.products.updateOne(
  { name: "Designer Scarf" },
  { $set: { image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=1000&fit=crop" } }
)

db.products.updateOne(
  { name: "Premium Leather Belt" },
  { $set: { image: "https://images.unsplash.com/photo-1624378515192-85e29842a2a1?w=800&h=1000&fit=crop" } }
)
```

## After Updating

1. Restart your server if it's running
2. Refresh your browser
3. The images should now load correctly

## New Image URLs

- **Designer Scarf**: `https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=1000&fit=crop`
- **Premium Leather Belt**: `https://images.unsplash.com/photo-1624378515192-85e29842a2a1?w=800&h=1000&fit=crop`

