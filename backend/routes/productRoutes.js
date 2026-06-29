// backend/routes/productRoutes.js
import express from 'express';
import { 
    addProduct,
    getProducts, 
    singleProduct,
    updateProduct,
    deleteProduct,
    addProductReview,
    getProductsByCategory,
    getFeaturedProducts
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload, { debugMulter, handleMulterError, uploadMultiple } from '../middleware/multer.js';

const router = express.Router();

// ============================================================
// PUBLIC ROUTES
// ============================================================
router.get('/', getProducts);
router.get('/list', getProducts);
router.get('/:id', singleProduct);
router.get('/category/:category', getProductsByCategory);
router.get('/featured', getFeaturedProducts);

// ============================================================
// ADMIN ROUTES
// ============================================================
router.post('/add', 
    protect, 
    admin, 
    debugMulter,
    uploadMultiple,
    handleMulterError,
    addProduct
);

router.put('/:id', 
    protect, 
    admin, 
    upload.array('images', 5),
    handleMulterError,
    updateProduct
);

router.delete('/:id', 
    protect, 
    admin, 
    deleteProduct
);

// ============================================================
// REVIEW ROUTE
// ============================================================
router.post('/review', protect, addProductReview);

export default router;