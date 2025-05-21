const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

// Get user's orders
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role === 'seller') {
            return res.status(403).json({ message: 'Sellers cannot view orders' });
        }

        const orders = await Order.find({ user: req.user._id })
            .populate('products.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create order
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role === 'seller') {
            return res.status(403).json({ message: 'Sellers cannot create orders' });
        }

        const { products, paymentMethod } = req.body;

        // Calculate total amount
        const totalAmount = products.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        const order = new Order({
            user: req.user._id,
            products,
            totalAmount,
            paymentMethod
        });

        await order.save();

        // Clear user's cart after successful order
        await Cart.findOneAndDelete({ user: req.user._id });

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update order status
router.patch('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = ['status'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        updates.forEach(update => order[update] = req.body[update]);
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete order
router.delete('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this order' });
        }

        await order.remove();
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 