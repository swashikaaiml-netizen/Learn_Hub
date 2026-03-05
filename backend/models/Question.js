const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    questionText: { type: String, required: true },
    options: {
        a: { type: String, required: true },
        b: { type: String, required: true },
        c: { type: String, required: true },
        d: { type: String, required: true }
    },
    correctAnswer: { type: String, enum: ['a', 'b', 'c', 'd'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
