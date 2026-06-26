import mongoose from 'mongoose';

// ============================================================
// Cart Item Schema
// ============================================================
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
    validate: {
      validator: function(value) {
        return Number.isInteger(value) && value > 0;
      },
      message: 'Quantity must be a positive integer'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  productName: {
    type: String,
    trim: true
  },
  productImage: {
    type: String
  }
}, {
  timestamps: true,
  _id: true
});

// ============================================================
// Main Cart Schema
// ============================================================
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  items: {
    type: [cartItemSchema],
    default: []
  },
  totalItems: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPrice: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================================
// Indexes
// ============================================================
cartSchema.index({ userId: 1 }, { unique: true });
cartSchema.index({ 'items.productId': 1 });
cartSchema.index({ userId: 1, 'items.productId': 1 });

// ============================================================
// Virtual Fields
// ============================================================
cartSchema.virtual('formattedTotalPrice').get(function() {
  return `$${this.totalPrice.toFixed(2)}`;
});

cartSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// ============================================================
// Instance Methods
// ============================================================
cartSchema.methods.recalculateTotals = function() {
  let totalItems = 0;
  let totalPrice = 0;

  for (const item of this.items) {
    totalItems += item.quantity;
    totalPrice += item.price * item.quantity;
  }

  this.totalItems = totalItems;
  this.totalPrice = totalPrice;
};

cartSchema.methods.addItem = async function(productId, size, quantity, price, productName, productImage) {
  const existingItemIndex = this.items.findIndex(
    item => item.productId.toString() === productId && item.size === size
  );

  if (existingItemIndex > -1) {
    this.items[existingItemIndex].quantity += quantity;
  } else {
    this.items.push({
      productId,
      size,
      quantity,
      price,
      productName,
      productImage
    });
  }

  this.recalculateTotals();
  return this;
};

cartSchema.methods.removeItem = function(productId, size) {
  this.items = this.items.filter(
    item => !(item.productId.toString() === productId && item.size === size)
  );
  this.recalculateTotals();
  return this;
};

cartSchema.methods.updateItemQuantity = function(productId, size, quantity) {
  const itemIndex = this.items.findIndex(
    item => item.productId.toString() === productId && item.size === size
  );

  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    this.items.splice(itemIndex, 1);
  } else {
    this.items[itemIndex].quantity = quantity;
  }

  this.recalculateTotals();
  return this;
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  this.totalItems = 0;
  this.totalPrice = 0;
  return this;
};

cartSchema.methods.hasItems = function() {
  return this.items.length > 0;
};

cartSchema.methods.getItemCount = function(productId, size) {
  const item = this.items.find(
    i => i.productId.toString() === productId && i.size === size
  );
  return item ? item.quantity : 0;
};

// ============================================================
// Static Methods
// ============================================================
cartSchema.statics.getOrCreate = async function(userId) {
  let cart = await this.findOne({ userId });
  
  if (!cart) {
    cart = new this({
      userId,
      items: [],
      totalItems: 0,
      totalPrice: 0
    });
    await cart.save();
  }
  
  return cart;
};

cartSchema.statics.mergeCarts = async function(userId, guestCartItems) {
  const cart = await this.getOrCreate(userId);
  
  const Product = mongoose.model('Product');
  
  for (const [productId, sizes] of Object.entries(guestCartItems)) {
    for (const [size, quantity] of Object.entries(sizes)) {
      if (quantity > 0) {
        const product = await Product.findById(productId);
        
        if (product) {
          const existingItem = cart.items.find(
            item => item.productId.toString() === productId && item.size === size
          );
          
          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            cart.items.push({
              productId,
              size,
              quantity,
              price: product.price,
              productName: product.name,
              productImage: product.image ? product.image[0] : null
            });
          }
        }
      }
    }
  }
  
  cart.recalculateTotals();
  await cart.save();
  
  return cart;
};

// ============================================================
// ✅ FIXED: Pre-save Middleware - no 'next' parameter
// ============================================================
cartSchema.pre('save', function() {
  // ✅ Don't use next() - just use the function without parameters
  if (this.isModified('items')) {
    this.recalculateTotals();
  }
  
  if (!Array.isArray(this.items)) {
    this.items = [];
  }
});

// ============================================================
// ✅ FIXED: Pre-validate Middleware
// ============================================================
cartSchema.pre('validate', function() {
  // ✅ Don't use next() - just use the function without parameters
  for (const item of this.items) {
    if (!item.productId || !item.size) {
      throw new Error('Each cart item must have productId and size');
    }
  }
});

// ============================================================
// Model Creation
// ============================================================
const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export default Cart;