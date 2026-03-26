const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    specialization: {
        type: String,
        required: true,
    },
    experienceYears: {
        type: Number,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        default: 'password123' // Fallback for existing data
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    needsPasswordReset: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    busySlots: [{
        start: Date,
        end: Date,
        note: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
