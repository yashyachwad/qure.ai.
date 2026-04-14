import mongoose from 'mongoose';

const patientQueueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    symptoms: {
        type: String,
        required: true
    },
    priority: {
        type: Number,
        default: 5
    },
    summaryCard: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ['waiting', 'consulting', 'completed'],
        default: 'waiting'
    },
    queueNumber: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-increment queue number (basic implementation for this hackathon)
patientQueueSchema.pre('save', async function(next) {
    if (!this.isNew) return next();
    
    try {
        const lastPatient = await this.constructor.findOne({}, {}, { sort: { 'queueNumber': -1 } });
        if (lastPatient && lastPatient.queueNumber) {
            this.queueNumber = lastPatient.queueNumber + 1;
        } else {
            this.queueNumber = 1; // Start with queue number 1
        }
        next();
    } catch (error) {
        next(error);
    }
});

export const PatientQueue = mongoose.model('PatientQueue', patientQueueSchema);
