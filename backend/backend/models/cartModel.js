import mongoose from "mongoose";

/* =========================================
   CART ITEM SCHEMA
========================================= */
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    size: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be integer",
      },
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    productName: String,
    productImage: String,
  },
  { timestamps: true }
);

/* =========================================
   CART SCHEMA
========================================= */
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },

    totalItems: {
      type: Number,
      default: 0,
    },

    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* =========================================


/* =========================================
   HELPER
========================================= */
cartSchema.methods.recalculateTotals = function () {
  let totalItems = 0;
  let totalPrice = 0;

  for (const item of this.items) {
    totalItems += item.quantity;
    totalPrice += item.price * item.quantity;
  }

  this.totalItems = totalItems;
  this.totalPrice = totalPrice;
};

/* =========================================
   ADD ITEM (SAFE)
========================================= */
cartSchema.methods.addItem = function (
  productId,
  size,
  quantity,
  price,
  productName,
  productImage
) {
  const index = this.items.findIndex(
    (i) => i.productId.toString() === productId && i.size === size
  );

  if (index > -1) {
    this.items[index].quantity += quantity;
  } else {
    this.items.push({
      productId,
      size,
      quantity,
      price,
      productName,
      productImage: Array.isArray(productImage)
        ? productImage[0]
        : productImage || null,
    });
  }

  this.recalculateTotals();
  return this;
};

/* =========================================
   REMOVE ITEM
========================================= */
cartSchema.methods.removeItem = function (productId, size) {
  this.items = this.items.filter(
    (i) => !(i.productId.toString() === productId && i.size === size)
  );

  this.recalculateTotals();
  return this;
};

/* =========================================
   CLEAR CART
========================================= */
cartSchema.methods.clearCart = function () {
  this.items = [];
  this.totalItems = 0;
  this.totalPrice = 0;
  return this;
};

/* =========================================
   SAFE PRE-SAVE (FIXED)
   IMPORTANT: DO NOT RELY ON THIS ONLY
========================================= */
cartSchema.pre("save", function (next) {
  if (Array.isArray(this.items)) {
    this.recalculateTotals();
  }
  next();
});

/* =========================================
   STATIC: GET OR CREATE
========================================= */
cartSchema.statics.getOrCreate = async function (userId) {
  let cart = await this.findOne({ userId });

  if (!cart) {
    cart = await this.create({
      userId,
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  }

  return cart;
};

/* =========================================
   MODEL
========================================= */
const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;