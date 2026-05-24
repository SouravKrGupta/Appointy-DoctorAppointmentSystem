import React, { useEffect } from 'react'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)
  const completedCount = appointments.filter((item) => item.isCompleted).length
  const cancelledCount = appointments.filter((item) => item.cancelled).length
  const activeCount = appointments.length - completedCount - cancelledCount
  const paidCount = appointments.filter((item) => item.payment).length

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  return (
    <div className='page-wrap'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='page-kicker'>Appointment Ledger</p>
          <h1 className='page-title'>All appointments</h1>
          <p className='page-copy'>
            Review bookings across doctors, patient details, dates, fees, and current appointment status.
          </p>
        </div>
        <p className='role-badge'>{appointments.length} appointments</p>
      </div>

      <div className='mt-8 grid gap-4 md:grid-cols-3'>
        <div className='mini-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Active</p>
          <p className='mt-3 display-font text-2xl font-semibold text-ink'>{activeCount}</p>
          <p className='mt-2 text-sm text-slate-500'>Appointments still awaiting final action.</p>
        </div>
        <div className='mini-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Completed</p>
          <p className='mt-3 display-font text-2xl font-semibold text-ink'>{completedCount}</p>
          <p className='mt-2 text-sm text-slate-500'>Visits already marked as completed.</p>
        </div>
        <div className='mini-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Cancelled</p>
          <p className='mt-3 display-font text-2xl font-semibold text-ink'>{cancelledCount}</p>
          <p className='mt-2 text-sm text-slate-500'>Bookings cancelled from the admin side.</p>
        </div>
      </div>

      <section className='appointment-board mt-8'>
        <div className='appointment-board-head'>
          <div>
            <p className='appointment-board-kicker'>Admin Appointment Board</p>
            <h2 className='appointment-board-title'>Every booking in one cleaner workflow</h2>
            <p className='appointment-board-copy'>
              Scan patient details, schedule, assigned doctor, payment state, and take action without fighting a rigid table.
            </p>
          </div>
          <p className='appointment-board-badge'>{paidCount} paid appointments</p>
        </div>

        <div className='appointment-list'>
          {appointments.length === 0 ? (
            <div className='appointment-empty'>
              <p className='appointment-empty-title'>No appointments yet</p>
              <p className='appointment-empty-copy'>
                When bookings start coming in, they will appear here with patient, doctor, schedule, payment, and status details.
              </p>
            </div>
          ) : appointments.map((item, index) => (
            <article className='appointment-entry' key={index}>
              <div className='appointment-entry-grid'>
                <div className='appointment-panel'>
                  <p className='appointment-panel-label'>Patient</p>
                  <div className='appointment-person'>
                    <img src={item.userData.image} className='appointment-avatar' alt="" />
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='appointment-title'>{item.userData.name}</p>
                        <span className='appointment-tag'>#{index + 1}</span>
                      </div>
                      <p className='appointment-subtitle'>Age {calculateAge(item.userData.dob)} patient record</p>
                    </div>
                  </div>
                </div>

                <div className='appointment-panel'>
                  <p className='appointment-panel-label'>Schedule</p>
                  <p className='appointment-strong'>{slotDateFormat(item.slotDate)}</p>
                  <p className='appointment-detail'>{item.slotTime}</p>
                  <div className='appointment-meta'>
                    <span className='appointment-tag'>Booked visit</span>
                    <span className={item.payment ? 'status-chip status-paid' : 'status-chip status-pending'}>
                      {item.payment ? 'Paid online' : 'Cash'}
                    </span>
                  </div>
                </div>

                <div className='appointment-panel'>
                  <p className='appointment-panel-label'>Assigned doctor</p>
                  <div className='appointment-person'>
                    <img src={item.docData.image} className='appointment-avatar' alt="" />
                    <div className='min-w-0'>
                      <p className='appointment-title'>{item.docData.name}</p>
                      <p className='appointment-subtitle'>{item.docData.speciality}</p>
                    </div>
                  </div>
                </div>

                <div className='appointment-panel'>
                  <p className='appointment-panel-label'>Fees and action</p>
                  <p className='appointment-strong'>{currency}{item.amount}</p>
                  <p className='appointment-detail'>Consultation charge for this booking.</p>
                  <div className='appointment-actions'>
                    {item.cancelled ? (
                      <p className='status-chip status-cancelled'>Cancelled</p>
                    ) : item.isCompleted ? (
                      <p className='status-chip status-complete'>Completed</p>
                    ) : (
                      <>
                        <p className='status-chip status-pending'>Pending action</p>
                        <button
                          type='button'
                          onClick={() => cancelAppointment(item._id)}
                          className='action-icon-btn'
                          aria-label='Cancel appointment'
                        >
                          <img className='w-5' src={assets.cancel_icon} alt="" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AllAppointments
