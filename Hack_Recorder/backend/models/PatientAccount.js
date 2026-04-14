import mongoose from 'mongoose';

const patientAccountSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    age: {
        type: Number
    },
    gender: {
        type: String
    },
    history: [{
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const PatientAccount = mongoose.model('PatientAccount', patientAccountSchema);
