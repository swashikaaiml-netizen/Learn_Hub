const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');

// Middleware to check if user is admin
const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }
        next();
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route   GET api/admin/users
// @desc    Get all users with details
// @access  Private/Admin
router.get('/users', [auth, adminOnly], async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('enrolledCourses');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', [auth, adminOnly], async (req, res) => {
    try {
        const users = await User.find();

        let totalEarnings = 0;
        users.forEach(user => {
            if (user.paymentHistory) {
                user.paymentHistory.forEach(payment => {
                    totalEarnings += payment.amount;
                });
            }
        });

        const stats = {
            totalUsers: users.length,
            totalEarnings: totalEarnings,
            totalCourses: await Course.countDocuments(),
            recentLogins: users.flatMap(u => u.loginHistory.map(lh => ({ name: u.name, date: lh }))).sort((a, b) => b.date - a.date).slice(0, 10)
        };

        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/payments
// @desc    Get all payment records
// @access  Private/Admin
router.get('/payments', [auth, adminOnly], async (req, res) => {
    try {
        const payments = await Payment.find().populate('user', 'name email').populate('course', 'title');
        res.json(payments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
