import mongoose from 'mongoose';

const patientRecordSchema = new mongoose.Schema({
  originalText: { type: String, required: true },
  symptoms: { type: [String], default: [] },
  diagnosis: { type: String, default: [] },
  recoveryAdvice: { type: String, default: [] },
  notes: { type: String, default: [] },
  createdAt: { type: Date, default: Date.now }
});

export const PatientRecord = mongoose.model('PatientRecord', patientRecordSchema);
