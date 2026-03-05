const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    loginHistory: [{ type: Date, default: Date.now }],
    paymentHistory: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        courseTitle: String,
        amount: Number,
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
