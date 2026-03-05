const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// @route   GET api/courses
// @desc    Get all courses with optional search/filter
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }

        const courses = await Course.find(query);
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/courses
// @desc    Create a course (Admin only conceptually, simplified for now)
// @access  Public
router.post('/', async (req, res) => {
    try {
        const newCourse = new Course(req.body);
        const course = await newCourse.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
