import React from 'react'
import { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
    appointmentRefreshToken,
  } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedAppointmentId = searchParams.get('appointment') || ''
  const completedCount = appointments.filter((item) => item.isCompleted).length
  const cancelledCount = appointments.filter((item) => item.cancelled).length
  const paidCount = appointments.filter((item) => item.payment).length

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [appointmentRefreshToken, dToken])

  useEffect(() => {
    if (!selectedAppointmentId || !appointments.length) {
      return
    }

    const selectedCard = document.getElementById(`doctor-appointment-${selectedAppointmentId}`)

    if (selectedCard) {
      selectedCard.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [appointments, selectedAppointmentId])

  return (
    <div className='page-wrap'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='page-kicker'>Doctor Schedule</p>
          <h1 className='page-title'>Your appointments</h1>
          <p className='page-copy'>
            Keep track of payments, patient details, and visit status from one responsive appointment board.
          </p>
        </div>
        <p className='role-badge'>{appointments.length} appointments</p>
      </div>

      <div className='mt-8 grid gap-4 md:grid-cols-3'>
        <div className='mini-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Paid</p>
          <p className='mt-3 display-font text-2xl font-semibold text-ink'>{paidCount}</p>
          <p className='mt-2 text-sm text-slate-500'>Appointments that already carry payment confirmation.</p>
        </div>
        <div className='mini-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Completed</p>
          <p className='mt-3 display-font text-2xl font-semibold text-ink'>{completedCount}</p>
          <p className='mt-2 text-sm text-slate-500'>Visits you have already closed out successfully.</p>
        </div>
        <div className='mini-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Cancelled</p>
          <p className='mt-3 display-font text-2xl font-semibold text-ink'>{cancelledCount}</p>
          <p className='mt-2 text-sm text-slate-500'>Appointments no longer active in your queue.</p>
        </div>
      </div>

      <section className='appointment-board mt-8'>
        <div className='appointment-board-head'>
          <div>
            <p className='appointment-board-kicker'>Doctor Appointment Board</p>
            <h2 className='appointment-board-title'>Daily bookings without the clutter</h2>
            <p className='appointment-board-copy'>
              See who is booked, how they are paying, when they are coming in, and close out each visit from one focused layout.
            </p>
          </div>
          <p className='appointment-board-badge'>{paidCount} paid and ready</p>
        </div>

        <div className='appointment-list'>
          {appointments.length === 0 ? (
            <div className='appointment-empty'>
              <p className='appointment-empty-title'>No appointments assigned</p>
              <p className='appointment-empty-copy'>
                As soon as patients book with this doctor profile, the full appointment list will appear here.
              </p>
            </div>
          ) : appointments.map((item, index) => {
            const isSelected = item._id === selectedAppointmentId

            return (
            <article
              id={`doctor-appointment-${item._id}`}
              className={`appointment-entry transition-all duration-300 ${
                isSelected
                  ? 'ring-2 ring-primary/20 shadow-[0_24px_50px_rgba(15,118,110,0.14)]'
                  : ''
              }`}
              key={item._id}
            >
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
                  <p className='appointment-panel-label'>Payment</p>
                  <p className='appointment-strong'>{item.payment ? 'Paid' : 'Cash'}</p>
                  <p className='appointment-detail'>Payment mode saved with the booking.</p>
                  <div className='appointment-meta'>
                    <span className={item.payment ? 'status-chip status-paid' : 'status-chip status-pending'}>
                      {item.payment ? 'Confirmed' : 'Collect at visit'}
                    </span>
                  </div>
                </div>

                <div className='appointment-panel'>
                  <p className='appointment-panel-label'>Schedule</p>
                  <p className='appointment-strong'>{slotDateFormat(item.slotDate)}</p>
                  <p className='appointment-detail'>{item.slotTime}</p>
                  <div className='appointment-meta'>
                    <span className='appointment-tag'>Consultation</span>
                    <span className='appointment-tag'>{currency}{item.amount}</span>
                  </div>
                </div>

                <div className='appointment-panel'>
                  <p className='appointment-panel-label'>Action</p>
                  <p className='appointment-detail'>Update the final state for this visit.</p>
                  <div className='appointment-actions'>
                    {item.cancelled ? (
                      <p className='status-chip status-cancelled'>Cancelled</p>
                    ) : item.isCompleted ? (
                      <>
                        <p className='status-chip status-complete'>Completed</p>
                        <button
                          type='button'
                          onClick={() => navigate(`/doctor-chats?appointment=${item._id}`)}
                          className='secondary-btn px-4 py-2 text-xs'
                        >
                          Open chat
                        </button>
                      </>
                    ) : (
                      <>
                        <p className='status-chip status-pending'>Awaiting update</p>
                        <button
                          type='button'
                          onClick={() => navigate(`/doctor-chats?appointment=${item._id}`)}
                          className='secondary-btn px-4 py-2 text-xs'
                        >
                          Open chat
                        </button>
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            </article>
          )})}
        </div>
      </section>
    </div>
  )
}

export default DoctorAppointments
