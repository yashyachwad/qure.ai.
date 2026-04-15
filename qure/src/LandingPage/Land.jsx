import React from 'react'
import { useNavigate } from 'react-router-dom'

import patient from "../assets/patient.png"
import doctor from "../assets/doctor.png"
import crowed from "../assets/crowed.png"
import wrong from "../assets/wrong.png"
import correct from "../assets/correct.png"
// import BG from "../assets/LandingBG.png"

const Land = () => {
  const navigate = useNavigate();


  // style={{ backgroundImage: `url(${BG})` }} 
  return (
    <>
      <div 
      className='h-screen w-screen bg-gradient-to-b from-slate-900 to-black  font-outfit text-white flex flex-col   items-center gap-6'>
     <h1 className='lg:text-5xl text-2xl flex flex-col items-center justify-center  font-strike animate-pulse mx-auto mt-32'>
          <span >AI-POWERED </span>
          <span >VOICE NOTES & QUEUE OPTIMISER</span>
        </h1>
        <p className='lg:text-xl text-sm text-slate-600 ml-12' >Prioritize patients based on medical severity & auto-generate structured doctor notes using speech AI.</p>
        <p className=' text-sm text-gray-600 mt-32'>Trusted AI assistance. Final decision always by medical staff.</p>
        <div className='lg:h-32 h-48  w-96 rounded-lg bg-gradient-to-b from-indigo-950 to-black  flex items-center justify-center  gap-16 mt-10 lg:mt-2 border border-purple-700'>
          <button onClick={() => navigate("/public")} className='px-4 py-2 flex flex-col items-center border bg-[linear-gradient(45deg,transparent_90%,purple_10%)] border-purple-700 rounded-md h-14 text-gray-500 w-32 transition-all  ease-in-out hover:border-orange-500  hover:text-white  hover:bg-[linear-gradient(45deg,transparent_90%,orange_10%)] '>
            <img className='h-6' src={patient} alt="" />
            <h1>Patient</h1>
          </button>
          <button onClick={() => navigate('/doctorAuth')} className='px-4 py-2 flex flex-col items-center border border-purple-700 bg-[linear-gradient(45deg,transparent_90%,purple_10%)] rounded-md h-14 text-gray-500 w-32  transition-all  ease-in-out hover:border-orange-500  hover:text-white  hover:bg-[linear-gradient(45deg,transparent_90%,orange_10%)]  '>
            <img className='h-6' src={doctor} alt="" />
            <h1>Doctor</h1>
          </button>

        </div> 
      </div>


      <div className='bg-gradient-to-b from-black to-slate-900 flex flex-col justify-start items-center py-10 min-h-screen'>
        <h1 className='text-3xl my-5 text-white'>WHY <span className='text-blue-400'>qure.ai</span> ?</h1>
        <div className='flex flex-col md:flex-row w-[75%] justify-center items-stretch px-4'>
          <img className='w-full md:w-[50%] object-cover border-blue-200 border rounded-t-xl md:rounded-bl-xl md:rounded-tl-xl md:rounded-tr-none shadow-inner shadow-blue-500' src={crowed} alt="" />
          <div className='w-full md:w-[50%] bg-stone-900 text-gray-200 flex flex-col gap-4 border border-white md:border-l-0 rounded-b-xl md:rounded-tr-xl md:rounded-br-xl md:rounded-bl-none shadow-blue-500 p-6 text-lg md:text-xl justify-center'>
            <span className="font-bold text-xl text-blue-300">9:30 AM. OPD is full.</span>
            <span className='flex gap-2 items-start leading-tight'> <img className='h-6 mt-1 flex-shrink-0' src={wrong} alt="" /> <div>First come first serve <br />  <span className="text-sm text-gray-400">[ No emergency detection ]</span></div></span>
            <span className='flex gap-2 items-start leading-tight'> <img className='h-6 mt-1 flex-shrink-0' src={wrong} alt="" /> <div>Manual details card typing <br /> <span className="text-sm text-gray-400">[ Not much faster ]</span></div></span>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:w-[75%] w-2xl px-4 mt-10">
          <span className='flex gap-4 p-4 border border-slate-600 rounded-md w-full text-lg md:text-xl text-white justify-start items-center bg-[linear-gradient(90deg,transparent_97%,gray)] transform ease-in-out duration-300 hover:scale-[1.01] hover:cursor-pointer shadow-lg'>
            <img className='h-6 flex-shrink-0' src={correct} alt="" />Intelligent OPD Queue Management
          </span>
          <span className='flex gap-4 p-4 border border-slate-600 rounded-md w-full text-lg md:text-xl text-white justify-start items-center bg-[linear-gradient(90deg,transparent_97%,gray)] transform ease-in-out duration-300 hover:scale-[1.01] hover:cursor-pointer shadow-lg'>
            <img className='h-6 flex-shrink-0' src={correct} alt="" />Voice-to-Structured Medical Summary card
          </span>
          <span className='flex gap-4 p-4 border border-slate-600 rounded-md w-full text-lg md:text-xl text-white justify-start items-center bg-[linear-gradient(90deg,transparent_97%,gray)] transform ease-in-out duration-300 hover:scale-[1.01] hover:cursor-pointer shadow-lg'>
            <img className='h-6 flex-shrink-0' src={correct} alt="" />AI-Based Smart Patient Prioritization
          </span>
        </div>
      </div>



      <footer className="bg-gray-900 text-gray-300 px-6 md:px-16 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* About */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              QURE AI
            </h2>
            <p className="text-sm leading-6">
              Smart AI-powered hospital system that converts voice to medical
              records, provides diagnosis suggestions, and prioritizes patients
              efficiently.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">
              Quick Links
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer">Home</li>
              <li className="hover:text-white cursor-pointer">Doctor Panel</li>
              <li className="hover:text-white cursor-pointer">Patient Records</li>
              <li className="hover:text-white cursor-pointer">About</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">
              Contact
            </h2>

            {/* Mail */}
            <div className="flex items-center gap-2 text-sm mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M2 4h20v16H2V4zm10 7l10-7H2l10 7zm0 2L2 6v14h20V6l-10 7z" />
              </svg>
              <span>yashyechwad420@gmail.com</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 text-sm mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.1 22 2 13.9 2 3c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1l-2.2 2.2z" />
              </svg>
              <span>+91 8010057938</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z" />
              </svg>
              <span>India</span>
            </div>

            {/* Social (SVG inline) */}
            <div className="flex gap-4 mt-4">
              {/* GitHub */}
              <svg
                className="w-5 h-5 cursor-pointer hover:text-white fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 .5C5.7.5.8 5.4.8 11.7c0 5 3.2 9.3 7.6 10.8.6.1.8-.3.8-.6v-2.2c-3.1.7-3.7-1.3-3.7-1.3-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.6 2.1 2.8 2.1.9 0 1.7-.3 2.1-.6.1-.7.3-1.2.6-1.5-2.5-.3-5.2-1.2-5.2-5.5 0-1.2.4-2.1 1.1-2.9-.1-.3-.5-1.5.1-3.1 0 0 .9-.3 3 .1.9-.2 1.9-.3 2.9-.3s2 .1 2.9.3c2.1-.4 3-.1 3-.1.6 1.6.2 2.8.1 3.1.7.8 1.1 1.7 1.1 2.9 0 4.3-2.7 5.2-5.2 5.5.4.3.7 1 .7 2v3c0 .3.2.7.8.6 4.4-1.5 7.6-5.8 7.6-10.8C23.2 5.4 18.3.5 12 .5z" />
              </svg>

              {/* LinkedIn */}
              <svg
                className="w-5 h-5 cursor-pointer hover:text-white fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.48 1s2.5 1.12 2.5 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.1c.5-.9 1.7-2.2 3.6-2.2 3.9 0 4.6 2.5 4.6 5.8V24h-4v-8.2c0-2-.1-4.5-2.7-4.5-2.7 0-3.1 2.1-3.1 4.3V24h-4V8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
          © {new Date().getFullYear()} qure.ai , All rights reserved.
        </div>
      </footer>







    </>
  )
}

export default Land
