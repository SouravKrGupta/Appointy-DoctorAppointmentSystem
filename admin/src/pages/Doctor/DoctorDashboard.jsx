import React from 'react'
import { useContext } from 'react'
import { useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {
  const {
    dToken,
    dashData,
    getDashData,
    cancelAppointment,
    completeAppointment,
    appointmentRefreshToken,
  } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [appointmentRefreshToken, dToken])

  return dashData && (
    <div className='page-wrap'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='page-kicker'>Doctor Dashboard</p>
          <h1 className='page-title'>Your performance and patient flow</h1>
          <p className='page-copy'>
            Track your earnings, upcoming workload, and recent appointment activity from a calmer workspace.
          </p>
        </div>
        <div className='mini-card max-w-sm'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Quick tip</p>
          <p className='mt-2 text-sm leading-6 text-slate-500'>
            Use the action buttons below to confirm completion or cancel appointments without leaving the dashboard.
          </p>
        </div>
      </div>

      <div className='mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        <div className='metric-card'>
          <div className='flex items-center gap-4'>
            <div className='metric-orb'>
              <img className='w-8' src={assets.earning_icon} alt="" />
            </div>
            <div>
              <p className='display-font text-3xl font-semibold text-ink'>{currency} {dashData.earnings}</p>
              <p className='mt-1 text-sm text-slate-500'>Total earnings</p>
            </div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='flex items-center gap-4'>
            <div className='metric-orb'>
              <img className='w-8' src={assets.appointments_icon} alt="" />
            </div>
            <div>
              <p className='display-font text-3xl font-semibold text-ink'>{dashData.appointments}</p>
              <p className='mt-1 text-sm text-slate-500'>Appointments handled</p>
            </div>
          </div>
        </div>

        <div className='metric-card'>
          <div className='flex items-center gap-4'>
            <div className='metric-orb'>
              <img className='w-8' src={assets.patients_icon} alt="" />
            </div>
            <div>
              <p className='display-font text-3xl font-semibold text-ink'>{dashData.patients}</p>
              <p className='mt-1 text-sm text-slate-500'>Patients treated</p>
            </div>
          </div>
        </div>
      </div>

      <section className='data-card mt-8'>
        <div className='flex flex-col gap-4 border-b border-primary/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
          <div className='flex items-center gap-3'>
            <div className='metric-orb h-12 w-12'>
              <img src={assets.list_icon} alt="" />
            </div>
            <div>
              <h2 className='section-title'>Latest bookings</h2>
              <p className='section-copy'>Your most recent patient appointment updates.</p>
            </div>
          </div>
          <p className='role-badge'>{dashData.latestAppointments.length} recent items</p>
        </div>

        <div className='divide-y divide-primary/10'>
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div className='flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6' key={index}>
              <img className='h-14 w-14 rounded-2xl border border-primary/10 bg-white object-cover' src={item.userData.image} alt="" />
              <div className='flex-1'>
                <p className='font-semibold text-ink'>{item.userData.name}</p>
                <p className='mt-1 text-sm text-slate-500'>Booking on {slotDateFormat(item.slotDate)} at {item.slotTime}</p>
              </div>
              {item.cancelled ? (
                <p className='status-chip status-cancelled'>Cancelled</p>
              ) : item.isCompleted ? (
                <p className='status-chip status-complete'>Completed</p>
              ) : (
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => cancelAppointment(item._id)}
                    className='action-icon-btn'
                    aria-label='Cancel appointment'
                  >
                    <img className='w-5' src={assets.cancel_icon} alt="" />
                  </button>
                  <button
                    type='button'
                    onClick={() => completeAppointment(item._id)}
                    className='action-icon-btn'
                    aria-label='Complete appointment'
                  >
                    <img className='w-5' src={assets.tick_icon} alt="" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DoctorDashboard
