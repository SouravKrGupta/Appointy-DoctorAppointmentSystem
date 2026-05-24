import React, { useContext, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken])

  return dashData && (
    <div className='page-wrap'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='page-kicker'>Admin Overview</p>
          <h1 className='page-title'>Clinic activity at a glance</h1>
          <p className='page-copy'>
            Monitor provider count, booking volume, and patient activity from one dashboard.
          </p>
        </div>
        <div className='mini-card max-w-sm'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Today&apos;s focus</p>
          <p className='mt-2 text-sm leading-6 text-slate-500'>
            Review the latest bookings below and intervene quickly when an appointment needs to be cancelled.
          </p>
        </div>
      </div>

      <div className='mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        <div className='metric-card'>
          <div className='flex items-center gap-4'>
            <div className='metric-orb'>
              <img className='w-8' src={assets.doctor_icon} alt="" />
            </div>
            <div>
              <p className='display-font text-3xl font-semibold text-ink'>{dashData.doctors}</p>
              <p className='mt-1 text-sm text-slate-500'>Registered doctors</p>
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
              <p className='mt-1 text-sm text-slate-500'>Total appointments</p>
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
              <p className='mt-1 text-sm text-slate-500'>Active patients</p>
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
              <p className='section-copy'>Most recent appointment activity across the clinic.</p>
            </div>
          </div>
          <p className='role-badge'>{dashData.latestAppointments.length} recent items</p>
        </div>

        <div className='divide-y divide-primary/10'>
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div className='flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6' key={index}>
              <img className='h-14 w-14 rounded-2xl border border-primary/10 bg-white object-cover' src={item.docData.image} alt="" />
              <div className='flex-1'>
                <p className='font-semibold text-ink'>{item.docData.name}</p>
                <p className='mt-1 text-sm text-slate-500'>Booking on {slotDateFormat(item.slotDate)} at {item.slotTime}</p>
              </div>
              <div className='flex items-center gap-3'>
                {item.cancelled ? (
                  <p className='status-chip status-cancelled'>Cancelled</p>
                ) : item.isCompleted ? (
                  <p className='status-chip status-complete'>Completed</p>
                ) : (
                  <button
                    type='button'
                    onClick={() => cancelAppointment(item._id)}
                    className='action-icon-btn'
                    aria-label='Cancel appointment'
                  >
                    <img className='w-5' src={assets.cancel_icon} alt="" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Dashboard
