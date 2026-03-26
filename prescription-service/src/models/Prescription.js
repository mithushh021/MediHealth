const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
    },
    doctorId: {
        type: String,
        required: true,
    },
    medications: [{
        name: String,
        dosage: String,
        frequency: String,
        duration: String
    }],
    dateIssued: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
    },
    status: {
        type: String,
        enum: ['New', 'Seen'],
        default: 'New'
    }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
