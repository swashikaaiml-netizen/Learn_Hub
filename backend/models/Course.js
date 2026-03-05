const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: String, required: true },
    videoUrl: { type: String }
});

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, default: false },
    videoUrl: { type: String }, // Main course video or preview
    image: { type: String },
    lessons: [LessonSchema],
    category: { type: String },
    studentsEnrolled: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
