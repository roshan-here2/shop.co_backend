const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingInfo, paymentMethod } = req.body;

    if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.email || !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode) {
      return res.status(400).json({ success: false, message: 'Complete shipping information is required' });
    }

    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    let sourceItems = cart && cart.items.length ? cart.items : [];

    // Fallback: accept items from request body (e.g. localStorage cart with product names)
    if (sourceItems.length === 0 && req.body.items && Array.isArray(req.body.items)) {
      sourceItems = req.body.items;
    }

    if (sourceItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of sourceItems) {
      let product = null;
      if (item.product) {
        product = await Product.findById(item.product._id || item.product);
      }
      if (!product && item.name) {
        product = await Product.findOne({ name: item.name });
      }
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${item.name || 'unknown'} is no longer available` });
      }
      const qty = item.quantity || 1;
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const price = product.price;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || item.image,
        price,
        quantity: qty,
        size: item.size,
        color: item.color,
      });
      subtotal += price * qty;
    }

    const discount = Math.round(subtotal * 0.2); // 20% discount as in frontend
    const shippingFee = 15;
    const total = subtotal - discount + shippingFee;

    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingInfo,
      subtotal,
      discount,
      shippingFee,
      total,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      status: 'Pending',
    });

    // Reduce stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart if it exists
    if (cart) {
      cart.items = [];
      await cart.save();
    } else {
      await Cart.findOneAndUpdate(
        { user: req.user.id },
        { items: [] },
        { upsert: true }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('orderItems.product', 'name images');
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // Only owner or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
