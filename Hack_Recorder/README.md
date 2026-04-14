# MedVoice HMS - Live Patient Summary Recorder

A MERN stack + Python feature for Hospital Management Systems that allows doctors to record patient summaries via voice, process them locally (FREE, NO API KEYS), and extract structured medical records (Patient Cards).

## Features
- **Frontend**: Clean hospital dashboard built with React + Vite.
- **Node.js Backend**: Stores structured records in MongoDB and handles orchestration.
- **Python Microservice**: Uses locally running `faster-whisper` AI to transcribe audio.
- **Rule-based NLP**: Automatically parses the transcription to extract Symptoms, Diagnosis, and Recovery Advice.

---

## 🚀 Setup Instructions

Follow these steps to run the complete system locally.

### 1. Requirements
- Node.js (v16+)
- Python (v3.10+)
- MongoDB (Running locally on default port `27017`)

### 2. Python Service (Local Whisper AI)
1. Open a terminal and navigate to the `python-service` folder.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server (it will download the `base` whisper model on the first run, which takes a bit of time):
   ```bash
   uvicorn app:app --host 0.0.0.1 --port 8000 --reload
   ```

### 3. Node.js Backend
1. Open a new terminal and navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   ```

### 4. React Frontend
1. Open a new terminal and navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 5. Access the App
Open your browser and navigate to `http://localhost:5173`. Click the microphone button to start recording, speak a patient summary (e.g., "Patient presents with headache and fever. Diagnosis is mild flu. Recommend rest and hydration."), and click stop to process it!
