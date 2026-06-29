// backend/scripts/seedProductsLocal.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import connectDB from '../config/db.js';

dotenv.config();

const categories = ['Men', 'Women', 'Kids'];
const subCategories = {
  Men: ['Topwear', 'Bottomwear', 'Winterwear'],
  Women: ['Topwear', 'Bottomwear', 'Winterwear', 'Dresses'],
  Kids: ['Topwear', 'Bottomwear', 'Winterwear'],
};

const productNames = {
  Men: [
    'Classic T-Shirt', 'Denim Jeans', 'Leather Jacket', 
    'Polo Shirt', 'Slim Fit Pants', 'Hoodie', 'Blazer'
  ],
  Women: [
    'Floral Dress', 'Skinny Jeans', 'Blouse', 'Maxi Dress',
    'Crop Top', 'Pencil Skirt', 'Knit Sweater', 'Jumpsuit'
  ],
  Kids: [
    'Comfort T-Shirt', 'Playful Jeans', 'Cartoon Hoodie',
    'Party Dress', 'Summer Shorts', 'Raincoat'
  ]
};

const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateProduct = (category, subCategory, name, index) => {
  const price = getRandomNumber(20, 200);
  const discount = Math.random() > 0.7 ? getRandomNumber(10, 40) : 0;
  const sizes = ['S', 'M', 'L', 'XL'].slice(0, getRandomNumber(3, 5));

  return {
    name: name,
    description: `Premium ${name} designed for ${category.toLowerCase()} featuring high-quality materials and modern style. Perfect for any occasion.`,
    price: price,
    originalPrice: discount > 0 ? Math.round(price * (1 + discount / 100)) : null,
    discount: discount,
    category: category,
    subCategory: subCategory,
    sizes: sizes,
    stock: getRandomNumber(10, 200),
    features: ['Premium quality', 'Comfortable fit', 'Versatile styling'],
    materials: 'Premium Cotton Blend',
    image: [`/images/products/${category.toLowerCase()}/${index}.jpg`], // Use local images
    bestseller: Math.random() > 0.8,
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    reviewCount: getRandomNumber(0, 500),
  };
};

const seedProducts = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const products = [];
    let count = 0;
    const targetCount = 100;

    // Generate products
    for (const category of categories) {
      const subCats = subCategories[category] || ['General'];
      const names = productNames[category] || ['Product'];

      for (const subCategory of subCats) {
        for (let i = 0; i < Math.ceil(targetCount / 12); i++) {
          if (count >= targetCount) break;
          
          const name = getRandomItem(names);
          const product = generateProduct(category, subCategory, `${name} ${count + 1}`, count + 1);
          products.push(product);
          count++;
          
          console.log(`Generated ${count}/${targetCount}: ${product.name}`);
        }
      }
    }

    // Ensure we have exactly 100 products
    while (products.length < targetCount) {
      const category = getRandomItem(categories);
      const subCategory = getRandomItem(subCategories[category] || ['General']);
      const name = getRandomItem(productNames[category] || ['Fashion Item']);
      const product = generateProduct(category, subCategory, `${name} ${products.length + 1}`, products.length + 1);
      products.push(product);
    }

    // Save products in batches
    const batchSize = 50;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      await Product.insertMany(batch);
      console.log(`Saved batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log(`✅ Successfully seeded ${products.length} products!`);
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedProducts();