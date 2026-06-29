import mongoose from "mongoose";

// ============================================================
// Product Schema
// ============================================================
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    index: true,
    maxlength: [100, "Product name cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"],
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price cannot be negative"],
  },
  originalPrice: {
    type: Number,
    min: [0, "Original price cannot be negative"],
    default: null,
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, "Discount cannot be negative"],
    max: [100, "Discount cannot exceed 100%"],
  },
  image: {
    type: [String],
    required: [true, "At least one product image is required"],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: "At least one product image is required",
    },
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    index: true,
    enum: {
      values: ['Men', 'Women', 'Kids'],
      message: 'Category must be Men, Women, or Kids',
    },
  },
  subCategory: {
    type: String,
    required: [true, "Sub-category is required"],
    trim: true,
  },
  sizes: {
    type: [String],
    default: [],
    enum: {
      values: ['S', 'M', 'L', 'XL', 'XXL'],
      message: 'Invalid size. Must be S, M, L, XL, or XXL',
    },
  },
  colors: {
    type: [String],
    default: [],
  },
  brand: {
    type: String,
    trim: true,
    default: null,
  },
  materials: {
    type: String,
    trim: true,
    default: null,
  },
  features: {
    type: [String],
    default: [],
  },
  bestseller: {
    type: Boolean,
    default: false,
    index: true,
  },
  stock: {
    type: Number,
    required: [true, "Stock quantity is required"],
    default: 0,
    min: [0, "Stock cannot be negative"],
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, "Rating cannot be negative"],
    max: [5, "Rating cannot exceed 5"],
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: [0, "Review count cannot be negative"],
  },
 reviews: [{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}],
  date: {
    type: Number,
    required: true,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ============================================================
// Indexes
// ============================================================
productSchema.index({ name: 'text' });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ bestseller: 1, isActive: 1 });
productSchema.index({ createdAt: -1 });

// ============================================================
// Virtual Fields
// ============================================================
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount && this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

productSchema.virtual('isOnSale').get(function() {
  return this.discount > 0;
});

// ============================================================
// Methods
// ============================================================
productSchema.methods.isInStock = function(quantity = 1) {
  return this.stock >= quantity;
};

productSchema.methods.reduceStock = async function(quantity = 1) {
  if (!this.isInStock(quantity)) {
    throw new Error(`Insufficient stock. Only ${this.stock} items available.`);
  }
  this.stock -= quantity;
  return this.save();
};

productSchema.methods.increaseStock = async function(quantity = 1) {
  this.stock += quantity;
  return this.save();
};

// ============================================================
// Static Methods
// ============================================================
productSchema.statics.getBestsellers = function(limit = 5) {
  return this.find({ bestseller: true, isActive: true })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(limit);
};

productSchema.statics.getByCategory = function(category, limit = null) {
  const query = this.find({ category, isActive: true });
  if (limit) {
    query.limit(limit);
  }
  return query;
};

// ============================================================
// Pre-save Middleware
// ============================================================
productSchema.pre('save', function(next) {
  if (!this.date) {
    this.date = Date.now();
  }
  
  if (this.name) this.name = this.name.trim();
  if (this.description) this.description = this.description.trim();
  if (this.category) this.category = this.category.trim();
  if (this.subCategory) this.subCategory = this.subCategory.trim();
  
  if (!Array.isArray(this.image)) {
    this.image = [this.image];
  }
  
  if (this.sizes && Array.isArray(this.sizes)) {
    this.sizes = this.sizes.filter(size => ['S', 'M', 'L', 'XL', 'XXL'].includes(size));
  }
  
  next();
});

// ============================================================
// Model Creation
// ============================================================
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;