import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, appointmentRefreshToken } = useContext(AppContext)
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])

  const months = [' ', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month)]} ${year}`
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      setAppointments(data.appointments.reverse())
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [appointmentRefreshToken, token])

  return (
    <div className='section-shell pt-6'>
      <div className='surface-panel-strong px-6 py-8 sm:px-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-3'>
            <p className='section-kicker'>My appointments</p>
            <h1 className='section-heading text-3xl sm:text-4xl'>Every booking, kept in one polished timeline.</h1>
          </div>
          <span className='chip'>{appointments.length} appointments</span>
        </div>

        <div className='mt-8 space-y-5'>
          {appointments.map((item) => (
            <article
              key={item._id}
              className='grid gap-5 rounded-[28px] border border-[rgba(24,53,51,0.12)] bg-white/88 p-5 shadow-soft lg:grid-cols-[180px_minmax(0,1fr)_220px]'
            >
              <img className='h-52 w-full rounded-[22px] object-cover lg:h-full' src={item.docData.image} alt={item.docData.name} />

              <div className='space-y-3'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>{item.docData.speciality}</p>
                  <h2 className='mt-2 text-2xl text-ink'>{item.docData.name}</h2>
                </div>
                <div className='space-y-1 text-sm leading-7 text-slate-600'>
                  <p>
                    <span className='font-semibold text-ink'>Address:</span> {item.docData.address.line1}
                  </p>
                  <p>{item.docData.address.line2}</p>
                  <p>
                    <span className='font-semibold text-ink'>Date and time:</span> {slotDateFormat(item.slotDate)} |{' '}
                    {item.slotTime}
                  </p>
                </div>
              </div>

              <div className='flex flex-col justify-between gap-3'>
                <div className='space-y-2'>
                  {!item.cancelled && item.payment && !item.isCompleted && (
                    <span className='status-pill w-fit'>Paid</span>
                  )}
                  {item.isCompleted && (
                    <span className='status-pill w-fit bg-[rgba(47,143,105,0.16)]'>Completed</span>
                  )}
                  {item.cancelled && (
                    <span className='status-pill offline w-fit bg-[rgba(184,91,84,0.14)] text-[var(--danger)]'>
                      Cancelled
                    </span>
                  )}
                </div>

                <div className='flex flex-wrap gap-3'>
                  {!item.cancelled && (
                    <button
                      onClick={() => navigate(`/my-chats?appointment=${item._id}`)}
                      className='secondary-btn px-5 py-3 text-sm'
                    >
                      Open chat
                    </button>
                  )}
                  {!item.cancelled && !item.isCompleted && (
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className='rounded-full border border-[rgba(184,91,84,0.26)] px-5 py-3 text-sm font-semibold text-[var(--danger)] hover:bg-[rgba(184,91,84,0.08)]'
                    >
                      Cancel appointment
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}

          {!appointments.length && (
            <div className='surface-panel rounded-[28px] p-10 text-center'>
              <p className='text-sm font-semibold uppercase tracking-[0.24em] text-primary'>No appointments yet</p>
              <p className='mt-3 text-lg text-slate-600'>
                Once you book a doctor, the appointment summary will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyAppointments
