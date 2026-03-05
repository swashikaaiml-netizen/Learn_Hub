const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Question = require('../models/Question');
const AssignmentResult = require('../models/AssignmentResult');
const User = require('../models/User');

// @route   GET api/assignments/:courseId
// @desc    Get MCQ questions for a course
// @access  Private
router.get('/:courseId', auth, async (req, res) => {
    try {
        const questions = await Question.find({ courseId: req.params.courseId }).select('-correctAnswer');
        res.json(questions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/assignments/submit
// @desc    Submit assignment answers and calculate score
// @access  Private
router.post('/submit', auth, async (req, res) => {
    try {
        const { courseId, answers } = req.body; // answers is an object { questionId: 'a', ... }

        const questions = await Question.find({ courseId });
        if (!questions.length) return res.status(404).json({ msg: 'No questions found for this course' });

        let score = 0;
        questions.forEach(q => {
            if (answers[q._id] === q.correctAnswer) {
                score++;
            }
        });

        const percentage = (score / questions.length) * 100;
        const passed = percentage >= 60;

        const result = new AssignmentResult({
            user: req.user.id,
            course: courseId,
            score,
            totalQuestions: questions.length,
            percentage,
            passed
        });

        await result.save();

        // If passed, we could optionally update user's completed status record here
        // For this project, we'll keep it in the AssignmentResult table which the frontend can check

        res.json({
            score,
            totalQuestions: questions.length,
            percentage,
            passed,
            resultId: result._id
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/assignments/add (Admin only)
// @desc    Add a question to a course
// @access  Private/Admin
router.post('/add', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

        const { courseId, questionText, options, correctAnswer } = req.body;
        const question = new Question({ courseId, questionText, options, correctAnswer });
        await question.save();
        res.json(question);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
