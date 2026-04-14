import { Routes, Route } from "react-router-dom";

import './App.css'
import Land from './LandingPage/Land'
import Nav from './Navbar/Nav'
import Public from "./Public/Public";
import Doctor from "./doctor/Doctor";
import About from "./about/About";
import DoctorAuth from "./doctAuth/DoctorAuth";

function App() {

  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Land />} />
        <Route path="/public" element={<Public />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/doctorAuth" element={<DoctorAuth />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>


  )
}

export default App
