from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import shutil
import os
import uuid

app = FastAPI(title="Hospital Text-to-Speech API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the model (downloads the base model if not already present)
# "base" provides a good balance between speed and accuracy for free local usage.
print("Loading Whisper Model...")
model = WhisperModel("base", device="cpu", compute_type="int8")
print("Whisper Model loaded successfully.")

# Create temp directory for audio files
os.makedirs("temp_audio", exist_ok=True)

@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    if not audio.filename:
        raise HTTPException(status_code=400, detail="No audio file provided")
    
    # Save the uploaded file temporarily
    temp_filename = f"temp_audio/{uuid.uuid4()}_{audio.filename}"
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        print(f"File saved to {temp_filename}. Starting transcription...")
        
        # Transcribe
        segments, info = model.transcribe(temp_filename, beam_size=5)
        
        transcription_text = ""
        for segment in segments:
            transcription_text += segment.text + " "
            
        print(f"Transcription complete: {transcription_text.strip()}")
        
        return {"text": transcription_text.strip()}
        
    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up the file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def home():
    return {"message": "Whisper API running"}
