import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import Product from '../models/productModel.js';
import connectDB from '../config/db.js';

dotenv.config();

// ============================================================
// Configuration
// ============================================================
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// Check if Unsplash API key is available
const USE_UNSPLASH = UNSPLASH_ACCESS_KEY && UNSPLASH_ACCESS_KEY !== 'your_unsplash_access_key_here';

console.log(`🔑 Using Unsplash: ${USE_UNSPLASH ? 'Yes' : 'No (using fallback)'}`);

// ============================================================
// E-Commerce Related Search Queries
// ============================================================
const ECOMMERCE_SEARCH_QUERIES = {
  Men: [
    'men fashion clothing',
    'men casual wear',
    'men formal wear',
    'men t-shirt fashion',
    'men jeans style',
    'men jacket outfit',
    'men hoodie fashion',
    'men suit style',
    'men streetwear',
    'men sportswear',
    'men winter coat',
    'men blazer outfit',
    'men shirt style',
    'men pants fashion',
    'men accessories'
  ],
  Women: [
    'women fashion clothing',
    'women dress style',
    'women casual wear',
    'women formal wear',
    'women jeans fashion',
    'women jacket outfit',
    'women blouse style',
    'women skirt fashion',
    'women gown dress',
    'women streetwear',
    'women winter coat',
    'women top style',
    'women pants fashion',
    'women accessories',
    'women handbag fashion'
  ],
  Kids: [
    'kids fashion clothing',
    'children casual wear',
    'kids dress style',
    'kids t-shirt fashion',
    'kids jeans style',
    'kids jacket outfit',
    'kids hoodie fashion',
    'kids party dress',
    'kids school uniform',
    'kids winter coat',
    'kids shorts style',
    'kids top fashion',
    'kids pants style',
    'kids accessories',
    'children streetwear'
  ]
};

const CATEGORIES = ['Men', 'Women', 'Kids'];
const SUB_CATEGORIES = {
  Men: ['Topwear', 'Bottomwear', 'Winterwear', 'Accessories'],
  Women: ['Topwear', 'Bottomwear', 'Winterwear', 'Dresses', 'Accessories'],
  Kids: ['Topwear', 'Bottomwear', 'Winterwear', 'Accessories'],
};

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const BRANDS = ['Nike', 'Adidas', 'Zara', 'H&M', 'Puma', 'Levi\'s', 'Gucci', 'Channel', 'Dior'];

const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ============================================================
// Fetch Images from Unsplash
// ============================================================
const fetchUnsplashImages = async (query, count = 4) => {
  if (!USE_UNSPLASH) {
    // Fallback to picsum.photos
    console.log(`⚠️ Using fallback images for: ${query}`);
    const fallbackImages = [];
    const seed = `${query}-${Date.now()}`;
    for (let i = 0; i < count; i++) {
      fallbackImages.push(`https://picsum.photos/seed/${seed}${i}/600/600`);
    }
    return fallbackImages;
  }

  try {
    // Search for e-commerce related images
    const response = await axios.get(`${UNSPLASH_API_URL}/search/photos`, {
      params: {
        query: query,
        per_page: count,
        orientation: 'squarish',
        content_filter: 'high',
        order_by: 'relevant',
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
      timeout: 10000,
    });
    
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results.map((photo) => photo.urls.regular);
    }
    
    // Fallback if no results
    console.log(`⚠️ No results for ${query}, using fallback`);
    const fallbackImages = [];
    const seed = `${query}-${Date.now()}`;
    for (let i = 0; i < count; i++) {
      fallbackImages.push(`https://picsum.photos/seed/${seed}${i}/600/600`);
    }
    return fallbackImages;
    
  } catch (error) {
    console.error(`❌ Failed to fetch images for ${query}:`, error.message);
    // Fallback to picsum.photos
    const fallbackImages = [];
    const seed = `${query}-${Date.now()}`;
    for (let i = 0; i < count; i++) {
      fallbackImages.push(`https://picsum.photos/seed/${seed}${i}/600/600`);
    }
    return fallbackImages;
  }
};

// ============================================================
// Generate Product with E-Commerce Images
// ============================================================
const generateProduct = async (category, subCategory, name, index) => {
  const price = getRandomNumber(20, 200);
  const discount = Math.random() > 0.7 ? getRandomNumber(10, 40) : 0;
  const sizes = SIZES.slice(0, getRandomNumber(3, 5));
  const brand = getRandomItem(BRANDS);
  
  // Get e-commerce related search query
  const searchQueries = ECOMMERCE_SEARCH_QUERIES[category] || ['fashion clothing'];
  const searchQuery = getRandomItem(searchQueries);
  
  // Fetch images from Unsplash
  const imageCount = getRandomNumber(2, 4);
  const images = await fetchUnsplashImages(searchQuery, imageCount);

  return {
    name: `${brand} ${name}`,
    description: `Premium ${name} designed for ${category.toLowerCase()}. High quality materials and modern style. Perfect for any occasion.`,
    price: price,
    originalPrice: discount > 0 ? Math.round(price * (1 + discount / 100)) : null,
    discount: discount,
    category: category,
    subCategory: subCategory,
    sizes: sizes,
    brand: brand,
    stock: getRandomNumber(10, 200),
    image: images,
    bestseller: Math.random() > 0.8,
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    reviewCount: getRandomNumber(0, 500),
    date: Date.now(),
  };
};

// ============================================================
// MAIN SEEDING FUNCTION
// ============================================================
const seedProducts = async () => {
  try {
    await connectDB();
    console.log('📦 Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    const products = [];
    const targetCount = 100;
    let count = 0;

    console.log(`🚀 Generating ${targetCount} products with e-commerce images...`);
    if (USE_UNSPLASH) {
      console.log(`📸 Using Unsplash for e-commerce images`);
    } else {
      console.log(`📸 Using fallback images (get Unsplash key for better results)`);
    }

    const productNames = {
      Men: [
        'Classic T-Shirt', 'Denim Jeans', 'Leather Jacket', 'Polo Shirt', 
        'Slim Fit Pants', 'Hoodie', 'Blazer', 'Cargo Pants', 'Shorts', 
        'Sweater', 'Trench Coat', 'Windbreaker', 'Cardigan', 'Henley Shirt',
        'V-Neck T-Shirt', 'Henley', 'Flannel Shirt', 'Parka Jacket', 'Sweatpants',
        'Joggers', 'Track Pants', 'Dress Shirt', 'Tuxedo Jacket', 'Khaki Pants'
      ],
      Women: [
        'Floral Dress', 'Maxi Dress', 'Mini Dress', 'Bodycon Dress', 
        'A-Line Skirt', 'Blouse', 'Tank Top', 'Crop Top', 'Oversized T-Shirt', 
        'Knit Sweater', 'Leather Jacket', 'Denim Jacket', 'Trench Coat', 
        'Cardigan', 'Kimono', 'Jumpsuit', 'Romper', 'Pencil Skirt',
        'Wrap Dress', 'Evening Gown', 'Party Dress', 'Work Blouse', 'Pencil Dress'
      ],
      Kids: [
        'Comfort T-Shirt', 'Playful Jeans', 'Cartoon Hoodie', 'Party Dress', 
        'Summer Shorts', 'School Uniform', 'Sweatpants', 'Adventure Coat', 
        'Raincoat', 'Baby Onesie', 'Toddler Dress', 'Kids Joggers', 
        'Polo Shirt', 'Denim Overall', 'Knit Sweater', 'Kids Jacket',
        'Kids Jumpsuit', 'Kids Romper', 'Kids Sweater', 'Kids Pants'
      ]
    };

    // Generate products
    for (let i = 0; i < targetCount; i++) {
      const category = getRandomItem(CATEGORIES);
      const subCategory = getRandomItem(SUB_CATEGORIES[category]);
      const name = getRandomItem(productNames[category] || ['Fashion Item']);
      
      const product = await generateProduct(category, subCategory, `${name} ${i + 1}`, i + 1);
      products.push(product);
      count++;
      
      if (count % 10 === 0) {
        console.log(`✅ Generated ${count}/${targetCount} products`);
      }
    }

    // Save products in batches
    const batchSize = 50;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      await Product.insertMany(batch);
      console.log(`📦 Saved batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log(`✅ Successfully seeded ${products.length} products!`);
    console.log(`📸 Images from: ${USE_UNSPLASH ? 'Unsplash' : 'Fallback (picsum.photos)'}`);
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();