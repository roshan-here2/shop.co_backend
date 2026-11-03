const express = require('express');
const router = express.Router();
const {
  verifySecret,
  getDashboard,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getUser,
  toggleUserStatus,
  deleteUser,
  getAllProducts,
} = require('../controllers/adminController');
const {
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

// Public admin secret check (no JWT needed for dashboard unlock)
router.post('/login', verifySecret);

// Protected admin routes - for production use JWT admin role
// For demo we also allow secret-based session from frontend
router.get('/dashboard', protect, admin, getDashboard);
router.get('/orders', protect, admin, getAllOrders);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);
router.get('/users', protect, admin, getAllUsers);
router.get('/users/:id', protect, admin, getUser);
router.put('/users/:id/toggle', protect, admin, toggleUserStatus);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/products', protect, admin, getAllProducts);
router.post('/products', protect, admin, createProduct);
router.put('/products/:id', protect, admin, updateProduct);
router.delete('/products/:id', protect, admin, deleteProduct);

module.exports = router;
