import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

const Public = () => {
  const [step, setStep] = useState('LOGIN'); // LOGIN, OTP, DASHBOARD, FORM, QUEUE, SUMMARY
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [account, setAccount] = useState(null);

  const [formData, setFormData] = useState({ name: '', age: '', gender: '', symptoms: '' });
  const [queueNumber, setQueueNumber] = useState(null);
  const [patientId, setPatientId] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryCard, setSummaryCard] = useState(null);

  const [fullQueue, setFullQueue] = useState([]);

  // Load account from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('qure_accountSession');
    if (saved) {
      setAccount(JSON.parse(saved));
      setStep('DASHBOARD');
    }
  }, []);

  const handlePhoneSubmit = async () => {
    if (!phone || phone.length < 5) return setError('Enter a valid phone number');
    setError(''); setLoading(true);
    try {
      await axios.post(`${BACKEND_BASE_URL}/api/patient/otp/send`, { phone });
      setStep('OTP');
    } catch (err) {
      setError('Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp) return setError('Enter OTP');
    setError(''); setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/api/patient/otp/verify`, { phone, otp });
      if (res.data.success) {
        setAccount(res.data.account);
        localStorage.setItem('qure_accountSession', JSON.stringify(res.data.account));
        setStep('DASHBOARD');
      }
    } catch (err) {
      setError('Invalid OTP. Use 123456.');
    } finally {
      setLoading(false);
    }
  };

  const startNewConsultation = () => {
    setFormData({
      name: account?.name || '',
      age: account?.age || '',
      gender: account?.gender || '',
      symptoms: ''
    });
    setStep('FORM');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleQueueSubmit = async () => {
    if (!formData.name || !formData.age || !formData.gender || !formData.symptoms) {
      return setError('Please fill all fields');
    }
    setError(''); setLoading(true);
    try {
      const submission = { ...formData, phone: account.phone };
      const response = await axios.post(`${BACKEND_BASE_URL}/api/queue`, submission);
      if (response.data && response.data.data) {
        setQueueNumber(response.data.data.queueNumber);
        setPatientId(response.data.data._id);

        if (!account.name) {
          const updatedAcc = { ...account, name: formData.name, age: formData.age, gender: formData.gender };
          setAccount(updatedAcc);
          localStorage.setItem('qure_accountSession', JSON.stringify(updatedAcc));
        }

        setStep('QUEUE');
        fetchQueue();
      }
    } catch (err) {
      setError('Failed to join queue.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/queue`);
      setFullQueue(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    let intervalId;
    if (step === 'QUEUE' && patientId) {
      intervalId = setInterval(async () => {
        try {
          fetchQueue();
          const res = await axios.get(`${BACKEND_BASE_URL}/api/queue/${patientId}`);
          if (res.data.status === 'completed' && res.data.summaryCard) {
            setSummaryCard(res.data.summaryCard);
            setStep('SUMMARY');
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 5000);
    }
    return () => clearInterval(intervalId);
  }, [step, patientId]);

  const handleDone = async () => {
    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/api/patient/otp/verify`, { phone: account.phone, otp: '123456' });
      if (res.data.success) {
        setAccount(res.data.account);
        localStorage.setItem('qure_accountSession', JSON.stringify(res.data.account));
      }
    } catch (e) { console.error('fetch err'); }

    setSummaryCard(null);
    setPatientId(null);
    setQueueNumber(null);
    setStep('DASHBOARD');
  };

  const logout = () => {
    localStorage.removeItem('qure_accountSession');
    setAccount(null);
    setPhone(''); setOtp('');
    setStep('LOGIN');
  }

  return (
    <div className='min-h-[calc(100vh-4rem)] w-full bg-black flex items-center justify-center p-4 md:p-8'>

      {step === 'LOGIN' && (
        <div className='w-full max-w-sm rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-blue-500/30 text-white p-8 shadow-2xl animate-fade-in'>
          <h1 className='text-2xl font-bold text-center mb-6 text-blue-400'>Patient Login</h1>
          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Phone Number</label>
              <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none" placeholder="Enter mobile number" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <button onClick={handlePhoneSubmit} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition">
              {loading ? 'Sending...' : 'Get OTP'}
            </button>
          </div>
        </div>
      )}

      {step === 'OTP' && (
        <div className='w-full max-w-sm rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-blue-500/30 text-white p-8 shadow-2xl animate-fade-in'>
          <h1 className='text-2xl font-bold text-center mb-2 text-blue-400'>Verify OTP</h1>
          <p className="text-gray-400 text-sm text-center mb-6">Code sent to {phone}</p>
          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Verification Code</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none text-center tracking-[1em] font-mono text-xl" placeholder="••••••" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} />
            </div>
            <button onClick={handleOtpSubmit} disabled={loading} className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold transition mt-2">
              {loading ? 'Verifying...' : 'Login'}
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">Hackathon Note: Use 123456</p>
            <button onClick={() => setStep('LOGIN')} className="text-xs text-blue-400 hover:underline mt-2">Change Phone Number</button>
          </div>
        </div>
      )}

      {step === 'DASHBOARD' && account && (
        <div className='w-full max-w-2xl h-[calc(100vh-4rem)] mt-10 text-white animate-fade-in'>
          <div className="flex justify-between items-center mt-10 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Hello, <span className="text-blue-400">{account.name || 'Patient'}</span></h1>
              <p className="text-gray-400">{account.phone}</p>
            </div>
            <button onClick={logout} className="text-sm font-bold bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-800 transition">Logout</button>
          </div>

          <button onClick={startNewConsultation} className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-indigo-500 py-2 rounded-lg font-bold text-lg mb-8 shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-600/50 flex justify-center items-center gap-2 transition-transform transform hover:scale-[1.01]">
            ➕ Request New Consultation
          </button>

          <h2 className="text-xl font-bold mb-4 text-gray-300 border-b border-white/10 pb-2">Medical History</h2>
          <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
            {account.history && account.history.length > 0 ? account.history.slice().reverse().map((hist, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 flex flex-col gap-3 hover:border-blue-500/30 transition">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="bg-blue-500/20 text-blue-300 font-bold px-3 py-1 rounded text-xs">{hist.createdAt || 'Past Record'}</span>
                  <span className="text-xs text-gray-400 bg-black/40 border border-gray-600 px-2 py-1 rounded-md font-mono">Dr. Qure</span>
                </div>
                <div>
                  <p className="text-red-300 text-xs uppercase tracking-wider font-bold mb-1">Main Problem:</p>
                  <p className="text-gray-200 font-medium">{hist.mainProblem || 'N/A'}</p>
                </div>
                <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-500/20 shadow-inner">
                  <p className="text-blue-300 text-xs uppercase tracking-wider font-bold mb-1">Diagnosis:</p>
                  <p className="text-white text-lg font-bold">{hist.diagnosis || 'None specified'}</p>
                </div>
                {hist.recoveryAdvice && (
                  <div>
                    <p className="text-green-400 text-xs uppercase tracking-wider font-bold mb-1">Advice & Prescription:</p>
                    <p className="text-gray-300 text-sm">{hist.recoveryAdvice}</p>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5 border-dashed">
                <span className="text-4xl block mb-2 opacity-30">📂</span>
                <p className="text-gray-500">No past medical histories found.</p>
                <p className="text-gray-600 text-xs mt-2">Start a new consultation to build your history!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'FORM' && (
        <div className={`w-full max-w-xl rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-blue-500/30 text-white shadow-[0_0_40px_rgba(37,99,235,0.15)] p-6 md:p-8 flex flex-col gap-6 relative animate-fade-in`}>
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h1 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400'>Information</h1>
            <button onClick={() => setStep('DASHBOARD')} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg transition-all text-sm border border-white/10">✕ Cancel</button>
          </div>

          {error && <p className="text-red-500 text-center bg-red-100/10 p-2 rounded">{error}</p>}

          {!account?.name && (
            <div className="flex flex-col gap-5 bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-sm text-blue-300 font-bold uppercase tracking-wider">Profile Setup</p>
              <label className='flex flex-col w-full gap-2'>
                <span className="text-gray-400 text-xs font-bold uppercase">Full Name</span>
                <input className='w-full pl-3 py-2.5 bg-black/40 border border-gray-700 text-white rounded-lg focus:border-blue-500 outline-none transition' type="text" name="name" value={formData.name} onChange={handleChange} placeholder='Eg: Yash Yachwad' />
              </label>
              <div className="flex flex-col md:flex-row gap-5">
                <label className='flex flex-col w-full md:w-1/2 gap-2'>
                  <span className="text-gray-400 text-xs font-bold uppercase">Age</span>
                  <input className='w-full pl-3 py-2.5 bg-black/40 border border-gray-700 text-white rounded-lg focus:border-blue-500 outline-none transition' type="number" name="age" value={formData.age} onChange={handleChange} placeholder='Age' min={1} max={100} />
                </label>
                <div className='flex flex-col w-full md:w-1/2 gap-2'>
                  <span className="text-gray-400 text-xs font-bold uppercase">Gender</span>
                  <div className="flex gap-4 h-full items-center">
                    <label className='cursor-pointer flex items-center gap-2 bg-black/40 border border-gray-700 px-3 py-2.5 rounded-lg flex-1 justify-center hover:border-blue-500 transition'>
                      <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleChange} className="accent-blue-500" /> Male
                    </label>
                    <label className='cursor-pointer flex items-center gap-2 bg-black/40 border border-gray-700 px-3 py-2.5 rounded-lg flex-1 justify-center hover:border-blue-500 transition'>
                      <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleChange} className="accent-blue-500" /> Female
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className='flex flex-col gap-2 mt-2'>
            <h1 className='text-blue-300 font-bold uppercase tracking-wider text-sm'>Describe your Problem</h1>
            <textarea
              className='p-4 w-full bg-black/40 text-white rounded-xl border border-gray-700 focus:border-blue-500 outline-none min-h-[140px] resize-none transition shadow-inner leading-relaxed'
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder='Be highly descriptive (e.g. "I have severe chest pain and trouble breathing") so our AI can prioritize emergencies efficiently...'
            />
          </div>

          <button onClick={handleQueueSubmit} disabled={loading} className='mt-4 py-4 w-full text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]'>
            {loading ? 'Submitting...' : 'Submit to Queue'}
          </button>
        </div>
      )}

      {step === 'QUEUE' && (
        <div className='w-full max-w-2xl rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-blue-500/30 text-white p-6 md:p-8 shadow-2xl animate-fade-in flex flex-col h-[85vh]'>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Live Waiting Room</h1>
              <p className="text-xs text-gray-400 mt-1">Keep this screen open until the doctor assigns a summary.</p>
            </div>
            <div className="w-10 h-10 rounded-full border-4 border-blue-500/30 border-t-blue-400 animate-spin shrink-0"></div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 p-5 rounded-2xl mb-6 flex justify-between items-center shadow-[0_0_20px_rgba(37,99,235,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full"></div>
            <span className="text-blue-200 font-medium z-10">Your Token Number</span>
            <span className="text-5xl font-black text-white drop-shadow-md z-10">#{queueNumber}</span>
          </div>

          <h3 className="text-blue-300 mb-3 text-xs font-bold uppercase tracking-widest pl-1">Current Queue Order</h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
            {fullQueue.map((q, idx) => {
              const isMe = q._id === patientId;
              return (
                <div key={q._id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${isMe ? 'bg-blue-600/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}>
                  <div className="flex items-center gap-5">
                    <span className={`text-2xl font-black w-8 text-center ${isMe ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]' : 'text-gray-600'}`}>{idx + 1}</span>
                    <div>
                      <p className={`font-bold tracking-wide ${isMe ? 'text-white' : 'text-gray-400/50 filter blur-[2px] select-none hover:blur-none hover:text-gray-300 transition-all duration-300'}`}>{isMe ? formData.name : 'Masked Patient'}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">Token #{q.queueNumber}</p>
                    </div>
                  </div>
                  {isMe ? <span className="bg-blue-500/20 border border-blue-400 text-blue-300 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">It's You</span> : <span className="text-gray-600 text-[10px] font-mono border border-gray-700 bg-gray-800/50 px-2 py-1 rounded">Waiting</span>}
                </div>
              )
            })}
            {fullQueue.length === 0 && (
              <div className="flex flex-col items-center justify-center flex-1 opacity-50">
                <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-white rounded-full mb-4"></div>
                <p className="text-sm">Loading visual queue...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'SUMMARY' && summaryCard && (
        <div className='w-full max-w-lg rounded-3xl bg-gray-900/80 backdrop-blur-2xl border border-blue-500/30 text-white p-8 shadow-[0_0_50px_rgba(59,130,246,0.2)] animate-fade-in relative overflow-hidden my-4'>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full"></div>

          <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/10 relative z-10 w-full overflow-hidden">
            <div className="flex items-center gap-4 shrink-0">
              <div className="h-14 w-14 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-2xl border border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.3)]">✔</div>
              <div className="flex flex-col flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-white tracking-wide truncate">🏥 Summary</h1>
                <p className="text-blue-300 text-[10px] md:text-xs truncate  mt-0.5">Token #{queueNumber} Complete</p>
              </div>
            </div>

            {summaryCard.createdAt && (
              <div className="ml-2 flex flex-col gap-1 items-end justify-center bg-black/40 px-3 py-2 rounded-xl border border-white/10 shrink-0">
                <p className='text-green-400 text-[9px] font-bold tracking-widest uppercase'>Created Time</p>
                <p className="text-[10px] md:text-[11px] font-mono text-gray-300">{summaryCard.createdAt.split(',')[1] || summaryCard.createdAt}</p>
                <p className="text-[9px] font-mono text-gray-500">{summaryCard.createdAt.split(',')[0]}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 relative z-10">
            <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:border-blue-400/50 transition-all shadow-lg group">
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-3">1. 🧑‍⚕️ Patient Bio</p>
              <p className="font-bold text-white text-xl tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{summaryCard.patientName || formData.name}</p>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                <div className="flex gap-4">
                  <p className="text-sm text-gray-400"><span className="text-gray-500 text-xs uppercase mr-1">Age</span> {summaryCard.patientAge || formData.age}</p>
                  <p className="text-sm text-gray-400"><span className="text-gray-500 text-xs uppercase mr-1">Sex</span> {summaryCard.patientGender || formData.gender || account?.gender}</p>
                </div>
                <p className="text-[10px] text-gray-500 font-mono bg-black/50 px-2.5 py-1 rounded-md border border-gray-800">ID: {(summaryCard.patientId || patientId || '').slice(-6).toUpperCase()}</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:border-red-400/50 transition-all shadow-lg">
              <p className="text-xs text-red-400 font-bold uppercase tracking-widest mb-3">2. ⚠️ Complaint</p>
              <p className="text-gray-200 font-medium leading-relaxed">{summaryCard.mainProblem || formData.symptoms}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:border-orange-400/50 transition-all shadow-lg">
              <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-3">3. 🤒 Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {summaryCard.symptoms?.length > 0 ? summaryCard.symptoms.map((sym, idx) => (
                  <span key={idx} className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-200 text-xs px-3 py-1.5 rounded-lg border border-orange-500/30 font-medium shadow-sm">{sym}</span>
                )) : <span className="text-gray-400 text-sm italic">None explicitly mentioned</span>}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 backdrop-blur-xl p-6 rounded-2xl border border-blue-400/40 hover:border-blue-400/80 transition-all shadow-[0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/20 blur-xl rounded-full mix-blend-screen"></div>
              <p className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-3 relative z-10">4. 🧠 AI Diagnosis</p>
              <p className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white relative z-10 leading-tight">{summaryCard.diagnosis || "Not specified"}</p>
            </div>

            {summaryCard.recoveryAdvice && (
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-md p-5 rounded-2xl border border-green-500/30 hover:border-green-400/50 transition-all shadow-lg">
                <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-3">Recovery & Prescription</p>
                <p className="text-green-100 leading-relaxed font-medium">{summaryCard.recoveryAdvice}</p>
              </div>
            )}

            {summaryCard.originalText && (
              <div className="bg-black/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800 mt-2">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>📝 Raw Audio Transcription</span>
                  <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded text-[8px] font-mono">Whisper AI</span>
                </p>
                <p className="text-xs text-gray-400 font-mono leading-relaxed italic opacity-80 decoration-gray-700 decoration-1 underline-offset-4">"{summaryCard.originalText}"</p>
              </div>
            )}
          </div>

          <button
            className='mt-8 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all border border-blue-400/50 flex items-center justify-center gap-2 text-lg'
            onClick={handleDone}
          >
            <span>Close & Save to History</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default Public;
