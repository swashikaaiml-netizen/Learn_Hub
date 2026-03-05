const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' },
    cardHolderName: { type: String },
    // We don't store actual card numbers for security, even in a mini project it's bad practice,
    // but the user asked for form fields. We can store a masked version or just ignore for the mock.
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
