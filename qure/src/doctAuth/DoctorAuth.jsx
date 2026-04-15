import React from 'react'
import skeleton from "../assets/docSkeleton.png"
import moSkeleton from "../assets/mobileSkeleton.jpeg"

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DoctorAuth = () => {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const Doct_pass = "Pass";

    function handleLogin(params) {
        if (password == Doct_pass) {
            setAuth(true);
            navigate("/doctor");
        } else {
            setError("Wrong Password ");
        }
    }


    return (


        <div className='relative h-screen'>

            {/* blur  */}
            <div className={`${!auth ? "blur-sm" : ""}`}>
                <img className=' hidden lg:flex h-screen w-screen' src={skeleton} alt="" />
                <img className=' lg:hidden flex h-screen w-screen' src={moSkeleton} alt="" />
            </div>

            {/* floating card : pass input ;  */}
            {!auth && (
                <div className='absolute inset-0 flex justify-center items-center bg-black/30'>
                    <div className='bg-white p-8 rounded-xl  shadow-2xl h-auto w-80 text-center'>
                        <h1 className='text-xl font-semibold mb-4'>Only for Hospital</h1>
                        <input className='border border-blue-800 w-full rounded-sm px-3 bg-transparent' type="password"
                            placeholder='Enter password'
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && (
                            <p className='text-red-500 w-full bg-red-100 border border-red-500 my-4 rounded-sm  text-sm mb-2'> {error} </p>
                        )}

                        <button
                            onClick={handleLogin}
                            className='bg-blue-400 text-white px-4 py-2 my-5 rounded w-full hover:bg-blue-500'
                        > Login </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DoctorAuth