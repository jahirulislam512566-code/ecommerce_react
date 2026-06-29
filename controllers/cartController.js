import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

/* =========================================
   HELPERS
========================================= */
const getUserId = (req) => {
  return req.userId || req.user?._id?.toString();
};

const calculateTotals = (items) => {
  let totalItems = 0;
  let totalPrice = 0;

  for (const item of items) {
    totalItems += item.quantity;
    totalPrice += item.price * item.quantity;
  }

  return { totalItems, totalPrice };
};

/* =========================================
   ADD TO CART
========================================= */
export const addToCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId, size, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!productId || !size) {
      return res.status(400).json({
        success: false,
        message: "Product ID and size required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // safer size check
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      if (!product.sizes.includes(size)) {
        return res.status(400).json({
          success: false,
          message: `Size ${size} not available`,
        });
      }
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    }

    const index = cart.items.findIndex(
      (i) => i.productId.toString() === productId && i.size === size
    );

    if (index > -1) {
      cart.items[index].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        size,
        quantity,
        price: product.price,
        productName: product.name,
        productImage: product.image?.[0] || null,
      });
    }

    const totals = calculateTotals(cart.items);
    cart.totalItems = totals.totalItems;
    cart.totalPrice = totals.totalPrice;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================================
   UPDATE CART
========================================= */
export const updateCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId, size, quantity } = req.body;

    if (!userId) return res.status(401).json({ success: false });

    let cart = await Cart.findOne({ userId });

    if (!cart)
      return res.status(404).json({ success: false, message: "Cart not found" });

    const index = cart.items.findIndex(
      (i) => i.productId.toString() === productId && i.size === size
    );

    if (index === -1)
      return res.status(404).json({ success: false, message: "Item not found" });

    if (quantity <= 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = quantity;
    }

    const totals = calculateTotals(cart.items);
    cart.totalItems = totals.totalItems;
    cart.totalPrice = totals.totalPrice;

    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

/* =========================================
   GET CART
========================================= */
export const getCart = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false });
    }

    const cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name price image"
    );

    res.json({
      success: true,
      cart: cart || {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

/* =========================================
   REMOVE ITEM
========================================= */
export const removeFromCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId, size } = req.params;

    let cart = await Cart.findOne({ userId });

    if (!cart)
      return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => !(i.productId.toString() === productId && i.size === size)
    );

    const totals = calculateTotals(cart.items);
    cart.totalItems = totals.totalItems;
    cart.totalPrice = totals.totalPrice;

    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

/* =========================================
   CLEAR CART
========================================= */
export const clearCart = async (req, res) => {
  try {
    const userId = getUserId(req);

    await Cart.findOneAndUpdate(
      { userId },
      { items: [], totalItems: 0, totalPrice: 0 }
    );

    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

/* =========================================
   SYNC CART (OPTIMIZED)
========================================= */
export const syncCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { cartItems } = req.body;

    if (!userId) return res.status(401).json({ success: false });

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const productIds = Object.keys(cartItems);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map();
    products.forEach((p) => productMap.set(p._id.toString(), p));

    cart.items = [];

    for (const productId of productIds) {
      const sizes = cartItems[productId];

      for (const size in sizes) {
        const quantity = sizes[size];

        if (quantity > 0 && productMap.has(productId)) {
          const product = productMap.get(productId);

          cart.items.push({
            productId,
            size,
            quantity,
            price: product.price,
            productName: product.name,
            productImage: product.image?.[0] || null,
          });
        }
      }
    }

    const totals = calculateTotals(cart.items);
    cart.totalItems = totals.totalItems;
    cart.totalPrice = totals.totalPrice;

    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};