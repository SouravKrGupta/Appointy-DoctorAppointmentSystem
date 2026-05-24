import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointment from './pages/MyAppointment'
import MyChats from './pages/MyChats'
import Appointment from './Appointment'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HelpBot from './components/HelpBot'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div className='site-shell'>
      <div className='page-shell'>
        <ToastContainer position='top-right' />
        <Navbar />
        <main className='pb-16 sm:pb-20'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/doctors' element={<Doctors />} />
            <Route path='/doctors/:speciality' element={<Doctors />} />
            <Route path='/login' element={<Login />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/my-profile' element={<MyProfile />} />
            <Route path='/my-appointments' element={<MyAppointment />} />
            <Route path='/my-chats' element={<MyChats />} />
            <Route path='/appointment/:docId' element={<Appointment />} />
          </Routes>
        </main>
        <Footer />
        <HelpBot />
      </div>
    </div>
  )
}

export default App
