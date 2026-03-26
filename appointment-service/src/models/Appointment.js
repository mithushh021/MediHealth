const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
    },
    doctorId: {
        type: String,
        required: true,
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'Rejected'],
        default: 'Scheduled'
    },
    notes: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
