import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Mic, Square, Loader2, CheckCircle2, Clock, AlertCircle, Save, FileText, UserCircle2, AlertTriangle } from 'lucide-react';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';
const BACKEND_AUDIO_URL = `${BACKEND_BASE_URL}/api/records/voice`;
const BACKEND_QUEUE_URL = `${BACKEND_BASE_URL}/api/queue`;

const Doctor = () => {
  const [auth, setAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [pass, setPass] = useState(false);

  // Doctor Dashboard State
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [currentSummary, setCurrentSummary] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Fetch Patient Queue
  useEffect(() => {
    if (auth) {
      fetchPatients();
      const interval = setInterval(fetchPatients, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [auth]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(BACKEND_QUEUE_URL);
      setPatients(response.data);

      // Auto-select the highest priority patient if none is selected
      if (response.data.length > 0 && !selectedPatient) {
        setSelectedPatient(response.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch patients", err);
    }
  };

  // Recording Logic
  const startRecording = async () => {
    if (!selectedPatient) {
      setError("Please select a patient from the queue first.");
      return;
    }

    setError(null);
    setSuccessMsg("");
    setCurrentSummary(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = handleStopRecording;

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      setError("Microphone access denied. Please allow microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStopRecording = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' }); // wabm to wav

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');  //wabm to wav

    try {
      const response = await axios.post(BACKEND_AUDIO_URL, formData);
    
      setCurrentSummary(response.data.data);
    } catch (err) {
      console.error("Error processing recording:", err);
      setError("Failed to process recording. Make sure backend is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!selectedPatient || !currentSummary) return;

    setIsSaving(true);
    try {
      const finalSummary = {
        ...currentSummary,
        patientName: selectedPatient.name,
        patientAge: selectedPatient.age,
        patientGender: selectedPatient.gender,
        patientId: selectedPatient._id,
        mainProblem: selectedPatient.symptoms
      };
      await axios.put(`${BACKEND_QUEUE_URL}/${selectedPatient._id}/summary`, finalSummary);
      setSuccessMsg("Summary sent to patient!");

      // Remove patient from local view instantly
      const updatedQueue = patients.filter(p => p._id !== selectedPatient._id);
      setPatients(updatedQueue);

      // Clear doctor inputs and auto-select next
      setTimeout(() => {
        setSuccessMsg("");
        setCurrentSummary(null);
        setSelectedPatient(updatedQueue.length > 0 ? updatedQueue[0] : null);
      }, 2000);

    } catch (err) {
      console.error("Failed to save summary", err);
      setError("Failed to push summary to patient. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='bg-black min-h-screen text-gray-800'>
      {/* {!auth && (
        <div className='relative h-[calc(100vh-4rem)] flex justify-center items-center'>
          <div className='bg-white p-8 rounded-xl shadow-2xl h-auto w-80 text-center relative z-10'>
            <h1 className='text-xl font-semibold mb-4 text-black'>Only for Hospital</h1>
            <button
              onClick={() => setAuth(true)}
              className='bg-blue-600 text-white px-4 py-2 mt-3 rounded w-full hover:bg-blue-700'
            >
              Login
            </button>
          </div>
          <div className="absolute inset-0 bg-blue-100/50 backdrop-blur-sm z-0 pointer-events-none"></div>
        </div>
      )} */}

      {auth && (
        <div className=" pt-20 container mx-auto p-4 max-w-7xl min-h-[calc(100vh-5rem)] flex flex-col lg:flex-row gap-6">
          {/* Left Column: Patient Queue */}
          <div className="w-full lg:w-1/4 bg-gray-700 rounded-xl shadow-md border border-gray-500 flex flex-col overflow-hidden h-[40vh] lg:h-[calc(100vh-6rem)]">
            <div className="bg-blue-600 text-white p-4 shrink-0 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />AI Prioritized Queue
              </h2>
              <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                {patients.length} Waiting
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 ">
              {patients.length === 0 ? (
                <p className="text-gray-500 text-center mt-5 text-sm">No patients waiting.</p>
              ) : (
                patients.map((p) => {
                  const isHighPriority = p.priority === 1;
                  const isSelected = selectedPatient?._id === p._id;

                  return (
                    <div
                      key={p._id}
                      onClick={() => setSelectedPatient(p)}
                      className={`border p-3 rounded-lg shadow-sm cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' : 'bg-white border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-800">#{p.queueNumber} - {p.name}</span>
                        {isHighPriority && (
                          <span className="text-[10px] bg-red-600 text-yellow-300 px-2 py-0.5 rounded flex items-center gap-1 font-bold animate-pulse">
                            <AlertTriangle size={12} /> URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">Age: {p.age} | {p.gender}</p>
                      <p className={`text-xs mt-1 truncate ${isHighPriority ? 'text-red-600 font-medium' : 'text-gray-500'}`} title={p.symptoms}>
                        {p.symptoms}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Middle Column: Voice Recorder */}
          <div className="w-full lg:w-2/4 bg-gray-800 rounded-xl shadow-md border border-gray-500 flex flex-col items-center justify-center p-8 relative min-h-[400px]">
            <h1 className="text-2xl font-bold text-blue-600 mb-2 flex flex-col md:flex-row items-center gap-2 absolute top-6 mt-2 md:mt-0">
              <FileText className="w-6 h-6" /> Qure AI
            </h1>

            {/* Active Patient Target */}
            <div className="absolute top-24 border border-blue-200 bg-green-300 text-blue-800 px-4  py-2 rounded-full flex items-center gap-2 shadow-sm text-sm font-medium">
              <UserCircle2 size={20} />
              {selectedPatient ? `Consulting: ${selectedPatient.name}` : "No Patient Selected"}
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6 flex items-center gap-2 w-full absolute top-36">
                <AlertCircle className="shrink-0" size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex flex-col items-center justify-center flex-1 w-full mt-10">
              <button
                className={`w-32 h-32 mt-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-4 ${!selectedPatient ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' :
                  isRecording
                    ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100 animate-pulse'
                    : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                  }`}
                onClick={selectedPatient ? (isRecording ? stopRecording : startRecording) : undefined}
                disabled={isProcessing || !selectedPatient}
              >
                {isRecording ? <Square size={48} className="fill-current" /> : <Mic size={48} />}
              </button>

              <p className={`mt-6 font-medium text-lg ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5" /> Extracting insights...
                  </span>
                ) : !selectedPatient ? (
                  'Select a patient from the queue'
                ) : isRecording ? (
                  'Recording... click to stop'
                ) : (
                  'Click to start recording'
                )}
              </p>
            </div>
          </div>

          {/* Right Column: Summary Card */}
          <div className="w-full lg:w-1/4 bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-500/30 flex flex-col overflow-hidden h-[75vh] lg:h-[calc(100vh-6rem)] mb-10 lg:mb-0 relative py-2">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-purple-600/10 pointer-events-none"></div>

            <div className="p-4 shrink-0 border-b border-white/10 z-10 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-400" /> 🏥 Summary Card
              </h2>
              {currentSummary && (
                <div className="text-[10px] text-gray-400 font-mono text-right leading-tight">
                  <p>CREATED AT</p>
                  <p>{currentSummary.createdAt || new Date().toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 z-10 custom-scrollbar">
              {currentSummary ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/10 hover:border-blue-400/50 transition-all">
                    <p className="text-xs text-blue-300 font-bold tracking-wider uppercase mb-2 flex items-center gap-2"><span>1.</span> 🧑‍⚕️ Basic Info</p>
                    <p className="font-medium text-white text-lg">{selectedPatient.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-300">Age: {selectedPatient.age}</p>
                      <p className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-1 rounded">ID: {selectedPatient._id.slice(-6)}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/10 hover:border-red-400/50 transition-all">
                    <p className="text-xs text-red-300 font-bold tracking-wider uppercase mb-2 flex items-center gap-2"><span>2.</span> ⚠️ Main Problem</p>
                    <p className="font-medium text-gray-200">{selectedPatient.symptoms}</p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/10 hover:border-orange-400/50 transition-all">
                    <p className="text-xs text-orange-300 font-bold tracking-wider uppercase mb-2 flex items-center gap-2"><span>3.</span> 🤒 Symptoms</p>
                    <div className="flex flex-wrap gap-2">
                      {currentSummary.symptoms?.length > 0 ? currentSummary.symptoms.map((sym, idx) => (
                        <span key={idx} className="bg-orange-500/20 text-orange-200 text-xs px-2 py-1 rounded-full border border-orange-500/30">{sym}</span>
                      )) : <span className="text-gray-400 text-sm">None explicitly mentioned</span>}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm p-4 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] border border-blue-400/30 hover:border-blue-400/70 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/20 blur-xl rounded-full"></div>
                    <p className="text-xs text-blue-300 font-bold tracking-wider uppercase mb-2 flex items-center gap-2 z-10 relative"><span>4.</span> 🧠 Diagnosis</p>
                    <p className="text-blue-100 font-bold text-lg z-10 relative">{currentSummary.diagnosis || "Not specified"}</p>
                  </div>

                  {currentSummary.recoveryAdvice && (
                    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-green-500/20 hover:border-green-400/50 transition-all">
                      <p className="text-xs text-green-400 font-bold tracking-wider uppercase mb-2 flex items-center gap-2">Recovery Advice</p>
                      <p className="text-green-100 text-sm leading-relaxed">{currentSummary.recoveryAdvice}</p>
                    </div>
                  )}

                  {currentSummary.originalText && (
                    <div className="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 mt-2">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 tracking-widest">📝 Raw Transcription</p>
                      <p className="text-xs text-gray-400 font-mono leading-relaxed italic">"{currentSummary.originalText}"</p>
                    </div>
                  )}

                  <button
                    onClick={handleSaveSummary}
                    disabled={isSaving}
                    className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all border border-green-400/50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {isSaving ? "Publishing..." : "Send to Patient"}
                  </button>
                  {successMsg && <p className="text-green-400 text-center text-sm font-semibold mt-2 animate-pulse">{successMsg}</p>}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <div className="relative">
                    <FileText size={48} className="mb-4 opacity-30" />
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
                  </div>
                  <p className="text-sm border border-white/10 p-5 rounded-2xl bg-white/5 backdrop-blur-md shadow-lg leading-relaxed">
                    Record an audio summary for the active patient. The card will appear here for your approval before being sent to them.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Doctor;
