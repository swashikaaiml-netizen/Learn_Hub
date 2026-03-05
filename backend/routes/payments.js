const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');

// @route   POST api/payments
// @desc    Process a course payment
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { courseId, cardHolderName, amount } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        const user = await User.findById(req.user.id);

        // Check if already enrolled
        if (user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ msg: 'You are already enrolled in this course' });
        }

        // Create payment record
        const payment = new Payment({
            user: req.user.id,
            course: courseId,
            amount: amount || course.price,
            cardHolderName,
            status: 'Completed'
        });
        await payment.save();

        // Unlock course for user
        user.enrolledCourses.push(courseId);
        user.paymentHistory.push({
            courseId: course._id,
            courseTitle: course.title,
            amount: amount || course.price,
            date: new Date()
        });

        await user.save();

        // Increment enrolled students count
        course.studentsEnrolled += 1;
        await course.save();

        res.json({ msg: 'Payment successful and course unlocked', payment });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
