// backend/controllers/cartController.js
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';

// ============================================================
// Add to Cart - FIXED with better error handling
// ============================================================
export const addToCart = async (req, res) => {
  try {
    console.log('📦 Add to cart request received');
    console.log('Request body:', req.body);
    console.log('User ID:', req.userId);
    
    const { productId, size, quantity = 1 } = req.body;
    const userId = req.userId;

    // Validate input
    if (!productId || !size) {
      console.log('❌ Missing productId or size');
      return res.status(400).json({
        success: false,
        message: 'Product ID and size are required'
      });
    }

    // Validate userId
    if (!userId) {
      console.log('❌ No userId found');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log('❌ Product not found:', productId);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('✅ Product found:', product.name);

    // Check if product has the size
    if (product.sizes && !product.sizes.includes(size)) {
      console.log('❌ Size not available:', size);
      return res.status(400).json({
        success: false,
        message: `Size ${size} is not available for this product`
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      console.log('🆕 Creating new cart for user:', userId);
      cart = new Cart({
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0
      });
    }

    console.log('📋 Current cart items:', cart.items.length);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.size === size
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      console.log('🔄 Updated existing item quantity:', cart.items[existingItemIndex].quantity);
    } else {
      // Add new item
      cart.items.push({
        productId,
        size,
        quantity,
        price: product.price,
        productName: product.name,
        productImage: product.image && product.image.length > 0 ? product.image[0] : null
      });
      console.log('➕ Added new item to cart');
    }

    // Recalculate totals
    let totalItems = 0;
    let totalPrice = 0;
    for (const item of cart.items) {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
    }
    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;

    console.log('💾 Saving cart...');
    // Save cart
    await cart.save();
    console.log('✅ Cart saved successfully');

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart: {
        items: cart.items,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice
      }
    });

  } catch (error) {
    console.error('❌ Add to cart error:', error);
    console.error('Error stack:', error.stack);
    
    // Send detailed error response
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============================================================
// Update Cart Item - FIXED
// ============================================================
export const updateCart = async (req, res) => {
  try {
    console.log('📦 Update cart request received');
    const { productId, size, quantity } = req.body;
    const userId = req.userId;

    if (!productId || !size || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, size, and valid quantity are required'
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.size === size
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    // Recalculate totals
    let totalItems = 0;
    let totalPrice = 0;
    for (const item of cart.items) {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
    }
    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart
    });

  } catch (error) {
    console.error('❌ Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
};

// ============================================================
// Get Cart - FIXED
// ============================================================
export const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    let cart = await Cart.findOne({ userId }).populate('items.productId', 'name price image');
    
    if (!cart) {
      cart = {
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    }

    res.status(200).json({
      success: true,
      cart
    });

  } catch (error) {
    console.error('❌ Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: error.message
    });
  }
};

// ============================================================
// Remove From Cart
// ============================================================
export const removeFromCart = async (req, res) => {
  try {
    const { productId, size } = req.params;
    const userId = req.userId;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.size === size
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items.splice(itemIndex, 1);

    // Recalculate totals
    let totalItems = 0;
    let totalPrice = 0;
    for (const item of cart.items) {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
    }
    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart
    });

  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

// ============================================================
// Clear Cart
// ============================================================
export const clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });

  } catch (error) {
    console.error('❌ Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// ============================================================
// Sync Cart
// ============================================================
export const syncCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const userId = req.userId;

    if (!cartItems || typeof cartItems !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart data'
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0
      });
    }

    // Clear existing items
    cart.items = [];

    // Add items from local cart
    for (const [productId, sizes] of Object.entries(cartItems)) {
      for (const [size, quantity] of Object.entries(sizes)) {
        if (quantity > 0) {
          const product = await Product.findById(productId);
          if (product) {
            cart.items.push({
              productId,
              size,
              quantity,
              price: product.price,
              productName: product.name,
              productImage: product.image && product.image.length > 0 ? product.image[0] : null
            });
          }
        }
      }
    }

    // Recalculate totals
    let totalItems = 0;
    let totalPrice = 0;
    for (const item of cart.items) {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
    }
    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart synced successfully',
      cart
    });

  } catch (error) {
    console.error('❌ Sync cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync cart',
      error: error.message
    });
  }
};