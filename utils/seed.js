require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'seed-products.json'), 'utf8')
);

// Add a few admin-style products too for dashboard variety
const extraProducts = [
  {
    name: 'Apple Watch Series 9',
    description: 'Latest smartwatch with advanced health features.',
    price: 429,
    originalPrice: 449,
    category: 'Wearables',
    images: ['/watch.jfif'],
    rating: 4.8,
    ratingCount: 320,
    stock: 42,
    colors: [{ name: 'Silver', hex: '#C0C0C0' }],
    sizes: ['One Size'],
    breadcrumbs: ['Home', 'Wearables', 'Apple Watch Series 9'],
    discount: 4,
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise cancelling headphones.',
    price: 348,
    category: 'Audio',
    images: ['/headphone.jfif'],
    rating: 4.7,
    ratingCount: 210,
    stock: 18,
    colors: [{ name: 'Black', hex: '#111' }],
    sizes: ['One Size'],
    breadcrumbs: ['Home', 'Audio', 'Sony WH-1000XM5'],
  },
  {
    name: 'MacBook Air M3',
    description: 'Thin and light laptop with M3 chip.',
    price: 1099,
    category: 'Laptops',
    images: ['/laptop.jfif'],
    rating: 4.9,
    ratingCount: 150,
    stock: 7,
    colors: [{ name: 'Space Gray', hex: '#4A4A4A' }],
    sizes: ['13-inch'],
    breadcrumbs: ['Home', 'Laptops', 'MacBook Air M3'],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    await User.deleteMany({});

    // Create admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@shop.co',
      password: 'secret123',
      role: 'admin',
    });
    console.log('Admin created:', admin.email);

    // Create demo user
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@shop.co',
      password: 'password123',
      role: 'user',
    });
    console.log('Demo user created:', user.email);

    const allProducts = [...productsData, ...extraProducts];
    await Product.insertMany(allProducts);
    console.log(`Seeded ${allProducts.length} products`);

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
