import React, { useState } from 'react'
import about from "../assets/about.png"
import tick from "../assets/tick.png"
import Li from "../assets/Linkedin.png"
import { useNavigate } from 'react-router-dom'


const Nav = () => {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  // function handleabout(params) {
  //   navigate("/about");
  // }

  return (

    <>
      <div className='fixed top-0 left-0 h-16 inset-0 bg-white/10 backdrop-blur-lg   z-50 border-b border-purple-400  shadow-sm  shadow-blue-700 flex justify-between items-center '>
        <div className='flex items-center justify-between w-[24%]'>
          <div onClick={() => navigate('/')} className='text-blue-700 flex items-center hover:cursor-pointer font-protest text-3xl ml-4 lg:ml-12 '>  <img className='h-7 px-3 border-r mr-3' src={tick} alt="" />  <span className='text-blue-100 '>qure</span>.ai </div>
          <button onClick={() => navigate('/')} className='hidden lg:flex px-2 border rounded-md hover:bg-blue-300 text-white hover:text-black border-gray-500'>Back</button>
        </div>
        <div className='flex justify-center mr-5'>
          <button className=''><img onClick={() => setShowAbout(!showAbout)} className='h-8 ' src={about} alt="" /></button>
          <div className='h-2 w-2 bg-yellow-500 rounded-full animate-ping border-2 border-yellow-400'>.</div>
        </div>
      </div>

      {
        showAbout && (
          <div className='flex flex-col fixed lg:top-14 top-20 h-[80%] lg:h-[90%] text-white w-[80%] mx-auto bg-black/20 border-2 border-green-400 rounded-lg z-20 inset-0 backdrop-blur-lg'>
            <div className='text-green-400 font-bold flex justify-center'>
              <h1>About US</h1>
            </div>

            <div className='text-sm text-gray-500 h-12 ml-[calc(50%-40%)]  px-5 flex items-center justify-center w-[80%] border border-gray-500 rounded-md '>
              <p> <span className='text-blue-400 font-bold'>qure.ai</span> is a AI-powered voice notes and queue optimiser for hospitals.</p>
            </div>

            <div className='sm:h-[20%] lg:h-[30%] w-[80%] mt-10 mx-[calc(50%-40%)] flex flex-col items-start gap-4 justify-start text-sm lg:text-xl'>
              <p> 🎤 Voice to Text Conversion</p>
              <p> 🤖 AI-Powered Medical Summary Cards</p>
              <p> 📊 Smart Patient Prioritization</p>
              <p> ⏱️ Real-Time Queue Management</p>
            </div>


            <div className='flex-1  flex-col w-[90%] border border-gray-600 mx-auto my-6 lg:pl-10 lg:pr-10 '>
              <div className='h-10 text-yellow-400 font-bold  flex items-center justify-center w-[100%] mb-6'>
                Team Members <span className='text-red-400 px-2 '> !!</span>
              </div>

              <div className='flex items-center justify-between px-2 my-2'>
                <div className='flex flex-col'>
                  <span className='text-md'>1. Yash Yachwad</span>
                  <span className='text-xs pl-4'>  - Fullstack Developer</span>
                </div>
                <a href="https://linkedin.com/in/yashyachwad"> <img className='size-6' src={Li} alt="" /></a>
              </div>

              <div className='flex items-center justify-between px-2 my-2'>
                <div className='flex flex-col'>
                  <span className='text-md'>2. Gopal Tyagi</span>
                  <span className='text-xs pl-4'>  - Frontend Developer </span>
                </div>
                <a href="https://www.linkedin.com/in/gopal-tyagi-a07618321/"> <img className='size-6' src={Li} alt="" /></a>
              </div>

              <div className='flex items-center justify-between px-2 my-2'>
                <div className='flex flex-col'>
                  <span className='text-md'>3. Pritam Kr</span>
                  <span className='text-xs pl-4'>  - AI/ML Engineer</span>
                </div>
                <a href="https://www.linkedin.com/in/pritam-kumar-b7a3283b2/"> <img className='size-6' src={Li} alt="" /></a>
              </div>

              <div className='flex items-center justify-between px-2 my-2'>
                <div className='flex flex-col'>
                  <span className='text-md'>4. Siya Nishal</span>
                  <span className='text-xs pl-4'>  - Testing & Quality Assurance</span>
                </div>
                <a href="https://www.linkedin.com/in/siya-nishal-87ab5b343/"> <img className='size-6' src={Li} alt="" /></a>
              </div>


            </div>
          </div>
        )
      }
    </>
  )
}

export default Nav
