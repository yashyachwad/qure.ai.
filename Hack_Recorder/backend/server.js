import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { PatientRecord } from './models/PatientRecord.js';
import { PatientQueue } from './models/PatientQueue.js';
import { PatientAccount } from './models/PatientAccount.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'https://qure-ai-python.onrender.com/transcribe';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yashyechwad420_db_user:EXs5pKqEc51Ebeib@qureaicluster.wpwyquy.mongodb.net/hospital_management?appName=qureaicluster';

// Middleware
app.use(cors());
app.use(express.json());

// Audio Upload Config (Temporary storage)
const upload = multer({ dest: 'uploads/' });

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Simple Rule-Based NLP Parser logic
function parseMedicalText(text) {
    const lowerText = text.toLowerCase();
    const result = {
        symptoms: [],
        diagnosis: "",
        recoveryAdvice: "To be provided by physician",
        notes: text,
        originalText: text,
        createdAt: new Date().toLocaleString()
    };

    // Keyword extraction logic
    const commonSymptoms = ["fever", "cough", "headache", "nausea", "pain", "fatigue", "chills", "sore throat"];
    commonSymptoms.forEach(symptom => {
        if (lowerText.includes(symptom)) {
            result.symptoms.push(symptom.charAt(0).toUpperCase() + symptom.slice(1));
        }
    });

    // Detect Diagnosis (Simple keyword search, usually after "diagnosis")
    if (lowerText.includes("diagnosis")) {
        const parts = lowerText.split(/diagnosis/);
        if (parts.length > 1) {
            let possibleDiagnosis = parts[parts.length - 1].replace(/^[\s:]*(is)?[\s:]*/, "").split('.')[0].trim();
            // Capitalize first letter
            if (possibleDiagnosis.length > 1) {
                possibleDiagnosis = possibleDiagnosis.charAt(0).toUpperCase() + possibleDiagnosis.slice(1);
                result.diagnosis = possibleDiagnosis;
            }
        }
    }

    // Detect Recovery Advice (keywords like "rest", "drink", "prescribe", "medicine", "take")
    if (lowerText.includes("advise") || lowerText.includes("recommend") || lowerText.includes("should take") || lowerText.includes("recover")) {
        const parts = lowerText.split(/advise|recommend|should take|recover/);
        if (parts.length > 1) {
            let possibleAdvice = parts[1].split('.')[0].trim();
            if (possibleAdvice.length > 1) {
                possibleAdvice = "Recommended  " + possibleAdvice.charAt(0).toLowerCase() + possibleAdvice.slice(1);
                result.recoveryAdvice = possibleAdvice;
            }
        }
    }

    return result;
}

// to check backend alive 
app.get('/', (req, res) => {
  res.send("Backend running 🚀");
});


// Routes
app.post('/api/records/voice', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const filePath = req.file.path;
        console.log(`Audio received at ${filePath}, sending to Python Service...`);

        // Send to Python FastAPI service using text extraction
        const formData = new FormData();
        formData.append('audio', fs.createReadStream(filePath), {
            filename: req.file.originalname || 'audio.wav'
        });

        const pythonResponse = await axios.post(PYTHON_API_URL, formData, {
            headers: {
                ...formData.getHeaders(),
            }, timeout: 60000 // 60 seconds
        });

        const transcribedText = pythonResponse.data.text;
        console.log("Transcription received:", transcribedText);

        // Parse medical text
        const parsedData = parseMedicalText(transcribedText);

        // Save to Database
        const newRecord = new PatientRecord(parsedData);
        await newRecord.save();

        // Clean up tmp file
        fs.unlinkSync(filePath);

        // Return parsed data to frontend
        res.status(201).json({
            message: "Record processed successfully",
            data: newRecord
        });

    } catch (error) {
        // console.error("Error processing voice record:", error.message);
        console.error("Error processing voice record:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to process voice recording" });

        // Ensure cleanup even on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
});

app.get('/api/records', async (req, res) => {
    try {
        const records = await PatientRecord.find().sort({ createdAt: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch records" });
    }
});

// Patient Auth / Mock OTP Routes
app.post('/api/patient/otp/send', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: "Phone number required" });
        // Simulating SMS being sent...
        res.json({ success: true, message: "OTP sent! (Use 123456 for hackathon)" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send OTP" });
    }
});

app.post('/api/patient/otp/verify', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        // Mock OTP check
        if (otp !== '123456') {
            return res.status(400).json({ error: "Invalid OTP. Use 123456." });
        }
        
        // Find existing or create new
        let account = await PatientAccount.findOne({ phone });
        if (!account) {
            account = new PatientAccount({ phone });
            await account.save();
        }
        
        res.json({ success: true, account });
    } catch (err) {
        res.status(500).json({ error: "Failed to verify OTP" });
    }
});

// Update Profile
app.put('/api/patient/:id', async (req, res) => {
    try {
        const account = await PatientAccount.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, account });
    } catch (err) {
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// Patient Queue Routes
app.post('/api/queue', async (req, res) => {
    try {
        const patientData = req.body;

        // Simple NLP Keyword Risk Assessment
        let assignedPriority = 5; // Default priority
        const text = (patientData.symptoms || "").toLowerCase();
        const highRiskKeywords = ["chest pain", "heart", "bleeding", "stroke", "breathing", "unconscious", "collapse", "severe"];

        for (let word of highRiskKeywords) {
            if (text.includes(word)) {
                assignedPriority = 1;
                break;
            }
        }

        patientData.priority = assignedPriority;
        const newPatient = new PatientQueue(patientData);
        await newPatient.save();
        res.status(201).json({
            message: "Patient added to queue successfully",
            data: newPatient
        });
    } catch (error) {
        console.error("Error adding to queue:", error.message);
        res.status(500).json({ error: "Failed to add patient to queue" });
    }
});

app.get('/api/queue', async (req, res) => {
    try {
        // Return patients who are 'waiting', sorted by Priority (1 is high) then creation time
        const queue = await PatientQueue.find({ status: 'waiting' }).sort({ priority: 1, createdAt: 1 });
        res.json(queue);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch patient queue" });
    }
});

app.get('/api/queue/:id', async (req, res) => {
    try {
        const patient = await PatientQueue.findById(req.params.id);
        if (!patient) return res.status(404).json({ error: "Patient not found" });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch patient" });
    }
});

app.put('/api/queue/:id/summary', async (req, res) => {
    try {
        const patient = await PatientQueue.findByIdAndUpdate(req.params.id, {
            status: 'completed',
            summaryCard: req.body
        }, { new: true });

        if (!patient) return res.status(404).json({ error: "Patient not found" });

        // Add summary to Patient Account History based on phone linkage
        if (patient.phone) {
            const account = await PatientAccount.findOne({ phone: patient.phone });
            if (account) {
                // Keep the account info updated just in case it was blank
                account.name = patient.name;
                account.age = patient.age;
                account.gender = patient.gender;
                account.history.push(req.body);
                await account.save();
            }
        }

        res.json({ message: "Summary attached successfully", data: patient });
    } catch (error) {
        res.status(500).json({ error: "Failed to attach summary" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Node.js API Server running on port ${PORT}`);
});
