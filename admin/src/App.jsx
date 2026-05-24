import React, { useContext } from 'react'
import { DoctorContext } from './context/DoctorContext'
import { AdminContext } from './context/AdminContext'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Admin/Dashboard'
import AllAppointments from './pages/Admin/AllAppointments'
import AddDoctor from './pages/Admin/AddDoctor'
import DoctorsList from './pages/Admin/DoctorsList'
import Login from './pages/Login'
import DoctorAppointments from './pages/Doctor/DoctorAppointments'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorProfile from './pages/Doctor/DoctorProfile'
import DoctorChats from './pages/Doctor/DoctorChats'

const App = () => {
  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const location = useLocation()

  // Redirect "/" to the proper dashboard
  if (location.pathname === '/') {
    if (aToken) return <Navigate to="/admin-dashboard" replace />
    if (dToken) return <Navigate to="/doctor-dashboard" replace />
  }

  // Admin layout and routes
  if (aToken) {
    return (
      <div className='admin-shell'>
        <ToastContainer
          position='top-right'
          toastClassName='!rounded-2xl !border !border-white/70 !bg-white/95 !shadow-xl'
          bodyClassName='!text-sm !font-medium'
        />
        <div className='mx-auto min-h-screen max-w-[1600px] px-3 py-3 sm:px-5 sm:py-5 lg:px-6'>
          <Navbar />
          <div className='mt-4 flex gap-4 lg:gap-6'>
            <Sidebar />
            <main className='min-w-0 flex-1'>
              <div className='shell-panel-strong min-h-[calc(100vh-8.5rem)]'>
                <Routes>
                  <Route path="/admin-dashboard" element={<Dashboard />} />
                  <Route path="/all-appointments" element={<AllAppointments />} />
                  <Route path="/add-doctor" element={<AddDoctor />} />
                  <Route path="/doctor-list" element={<DoctorsList />} />
                  <Route path="*" element={<Navigate to="/admin-dashboard" />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  // Doctor layout and routes
  if (dToken) {
    return (
      <div className='admin-shell'>
        <ToastContainer
          position='top-right'
          toastClassName='!rounded-2xl !border !border-white/70 !bg-white/95 !shadow-xl'
          bodyClassName='!text-sm !font-medium'
        />
        <div className='mx-auto min-h-screen max-w-[1600px] px-3 py-3 sm:px-5 sm:py-5 lg:px-6'>
          <Navbar />
          <div className='mt-4 flex gap-4 lg:gap-6'>
            <Sidebar />
            <main className='min-w-0 flex-1'>
              <div className='shell-panel-strong min-h-[calc(100vh-8.5rem)]'>
                <Routes>
                  <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                  <Route path="/doctor-appointments" element={<DoctorAppointments />} />
                  <Route path="/doctor-chats" element={<DoctorChats />} />
                  <Route path="/doctor-profile" element={<DoctorProfile />} />
                  <Route path="*" element={<Navigate to="/doctor-dashboard" />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  // No one is logged in
  return (
    <div className='admin-shell'>
      <ToastContainer
        position='top-right'
        toastClassName='!rounded-2xl !border !border-white/70 !bg-white/95 !shadow-xl'
        bodyClassName='!text-sm !font-medium'
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App
