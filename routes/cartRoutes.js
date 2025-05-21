const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get user's cart
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role === 'seller') {
            return res.status(403).json({ message: 'Sellers cannot have a cart' });
        }

        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product');

        if (!cart) {
            return res.json({ items: [], totalAmount: 0 });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add item to cart
router.post('/items', auth, async (req, res) => {
    try {
        if (req.user.role === 'seller') {
            return res.status(403).json({ message: 'Sellers cannot have a cart' });
        }

        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: [{ product: productId, quantity }],
                totalAmount: product.price * quantity
            });
        } else {
            const existingItem = cart.items.find(item => item.product.toString() === productId);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }

            cart.totalAmount = cart.items.reduce((total, item) => {
                return total + (product.price * item.quantity);
            }, 0);
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update cart item
router.patch('/items/:productId', auth, async (req, res) => {
    try {
        if (req.user.role === 'seller') {
            return res.status(403).json({ message: 'Sellers cannot have a cart' });
        }

        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.product.toString() === req.params.productId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        item.quantity = quantity;
        cart.totalAmount = cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Remove item from cart
router.delete('/items/:productId', auth, async (req, res) => {
    try {
        if (req.user.role === 'seller') {
            return res.status(403).json({ message: 'Sellers cannot have a cart' });
        }

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
        cart.totalAmount = cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 