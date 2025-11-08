// Script to update product images in the database
// Run with: node update-images.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecom-cart';

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

async function updateImages() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Update Designer Scarf image
    const scarfResult = await Product.updateOne(
      { name: "Designer Scarf" },
      { 
        $set: { 
          image: "https://images.unsplash.com/photo-1562176603-48b2cf0d96b3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1926"
        } 
      }
    );
    console.log(`Updated Designer Scarf: ${scarfResult.modifiedCount} document(s)`);

    // Update Premium Leather Belt image
    const beltResult = await Product.updateOne(
      { name: "Premium Leather Belt" },
      { 
        $set: { 
          image: "https://images.unsplash.com/photo-1664286074240-d7059e004dff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJlbWl1bSUyMGxlYXRoZXIlMjBiZWx0fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600"
        } 
      }
    );
    console.log(`Updated Premium Leather Belt: ${beltResult.modifiedCount} document(s)`);

    console.log('Image update completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating images:', error);
    process.exit(1);
  }
}

updateImages();

