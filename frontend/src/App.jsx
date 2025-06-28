import React from 'react'
import { Route,Routes } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Contact from './pages/Contact'
import Login from './pages/Login'
import About from './pages/About'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFail from './pages/PaymentFail'
import PaymentCancel from './pages/PaymentCancel'



const App = () => {
  return (
   <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer/>
      <NavBar/> 
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/doctors/:speciality' element={<Doctors />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='my-profile' element={<MyProfile/>}/>
        <Route path='/my-appointments' element={<MyAppointments/>}/>  
        <Route path='appointment/:docId' element={<Appointment/>}/>
        <Route path='/payment/success/:appointmentId' element={<PaymentSuccess />} />
        <Route path='/payment/fail/:appointmentId' element={<PaymentFail />} />
        <Route path='/payment/cancel/:appointmentId' element={<PaymentCancel />} />

      </Routes>
      <Footer/>
   </div>
  )
}

export default App
