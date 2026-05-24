import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from './context/AppContext'
import { assets } from './assets/assets'
import RelatedDoctors from './components/RelatedDoctors'

const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const Appointment = () => {
  const { docId } = useParams()
  const navigate = useNavigate()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  const fetchDocInfo = async () => {
    const doc = doctors.find((doctor) => doctor._id === docId)
    if (doc) {
      setDocInfo({ ...doc, slots_booked: doc.slots_booked || {} })
    }
  }

  const getAvailableSlots = () => {
    if (!docInfo) return
    setDocSlots([])

    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      const endTime = new Date(currentDate)
      endTime.setHours(21, 0, 0, 0)

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      const timeSlots = []

      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })

        const day = currentDate.getDate()
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const slotDate = `${day}_${month}_${year}`

        const isSlotAvailable =
          !docInfo?.slots_booked?.[slotDate] ||
          !docInfo.slots_booked[slotDate].includes(formattedTime)

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          })
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      setDocSlots((prev) => [...prev, timeSlots])
    }
  }

  const bookAppointment = async () => {
    if (!token) {
      toast.warning('Login to book appointment')
      return navigate('/login')
    }

    const selectedDay = docSlots[slotIndex]?.[0]
    if (!selectedDay || !slotTime) {
      return toast.error('Please choose an available slot')
    }

    const date = selectedDay.datetime
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const slotDate = `${day}_${month}_${year}`

    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { docId, slotDate, slotTime },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (doctors.length > 0) {
      fetchDocInfo()
    }
  }, [doctors, docId])

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots()
    }
  }, [docInfo])

  useEffect(() => {
    const firstSlot = docSlots[slotIndex]?.[0]?.time
    if (firstSlot) {
      setSlotTime(firstSlot)
    }
  }, [docSlots, slotIndex])

  if (!docInfo) {
    return null
  }

  return (
    <div className='section-shell pt-6'>
      <div className='surface-panel-strong overflow-hidden px-6 py-8 sm:px-8'>
        <div className='grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]'>
          <div className='relative'>
            <div className='surface-panel overflow-hidden rounded-[30px] p-4'>
              <img className='w-full rounded-[24px] object-cover' src={docInfo.image} alt={docInfo.name} />
            </div>
            <div className='surface-panel-strong floating-accent absolute -bottom-5 left-4 rounded-[24px] px-4 py-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary'>Booking note</p>
              <p className='mt-1 text-sm text-slate-600'>Appointments are confirmed in demo-paid mode.</p>
            </div>
          </div>

          <div className='space-y-5'>
            <div className='flex flex-wrap items-center gap-3'>
              <span className={`status-pill ${docInfo.available ? '' : 'offline'}`}>
                <span className={`h-2 w-2 rounded-full ${docInfo.available ? 'bg-green-500' : 'bg-slate-400'}`} />
                {docInfo.available ? 'Open for booking' : 'Currently unavailable'}
              </span>
              <span className='chip bg-[rgba(215,141,95,0.14)] text-[var(--accent)]'>Instant profile view</span>
            </div>

            <div>
              <h1 className='section-heading text-3xl sm:text-4xl'>{docInfo.name}</h1>
              <div className='mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600'>
                <span>{docInfo.degree}</span>
                <span className='h-1 w-1 rounded-full bg-slate-300' />
                <span>{docInfo.speciality}</span>
                <span className='rounded-full border border-[rgba(24,53,51,0.12)] px-3 py-1 font-semibold text-ink'>
                  {docInfo.experience}
                </span>
              </div>
            </div>

            <div className='surface-panel rounded-[26px] p-5'>
              <p className='mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary'>
                About
                <img className='w-4' src={assets.info_icon} alt='' />
              </p>
              <p className='text-sm leading-7 text-slate-600'>{docInfo.about}</p>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='surface-panel rounded-[24px] p-5'>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>Appointment fee</p>
                <p className='mt-3 text-3xl font-semibold text-ink'>
                  {currencySymbol} {docInfo.fees}
                </p>
              </div>
              <div className='surface-panel rounded-[24px] p-5'>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>Clinic address</p>
                <p className='mt-3 text-sm leading-7 text-slate-600'>
                  {docInfo.address?.line1 || 'Address available after booking'}
                  <br />
                  {docInfo.address?.line2 || 'Details provided in profile'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='surface-panel mt-8 rounded-[30px] p-6 sm:p-8'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='section-kicker'>Choose a slot</p>
            <h2 className='section-heading text-3xl sm:text-4xl'>Booking windows for the next 7 days.</h2>
          </div>
          <p className='section-copy max-w-xl'>
            Select the day that works, then refine the time. The first available slot is selected for
            you to keep the flow moving.
          </p>
        </div>

        <div className='mt-8 flex gap-4 overflow-x-auto pb-2'>
          {docSlots.length > 0 &&
            docSlots.map((item, index) => {
              const isActive = slotIndex === index
              return (
                <button
                  key={index}
                  onClick={() => setSlotIndex(index)}
                  className={`min-w-[96px] rounded-[24px] border px-4 py-5 text-center ${
                    isActive
                      ? 'border-primary bg-primary text-white shadow-soft'
                      : 'border-[rgba(24,53,51,0.12)] bg-white/80 text-slate-700 hover:border-primary/30'
                  }`}
                >
                  <p className='text-xs font-semibold uppercase tracking-[0.18em]'>
                    {item[0] && daysOfWeek[item[0].datetime.getDay()]}
                  </p>
                  <p className='mt-2 text-3xl font-semibold'>{item[0] && item[0].datetime.getDate()}</p>
                </button>
              )
            })}
        </div>

        <div className='mt-6 flex flex-wrap gap-3'>
          {docSlots.length > 0 &&
            docSlots[slotIndex] &&
            docSlots[slotIndex].map((item, index) => (
              <button
                key={index}
                onClick={() => setSlotTime(item.time)}
                className={`rounded-full px-5 py-3 text-sm font-semibold ${
                  item.time === slotTime
                    ? 'bg-primary text-white shadow-soft'
                    : 'border border-[rgba(24,53,51,0.12)] bg-white/80 text-slate-600 hover:border-primary/30'
                }`}
              >
                {item.time.toLowerCase()}
              </button>
            ))}
        </div>

        <div className='mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-slate-600'>
            {slotTime ? `Selected time: ${slotTime.toLowerCase()}` : 'Select a time to continue.'}
          </p>
          <button onClick={bookAppointment} className='primary-btn'>
            Book appointment
          </button>
        </div>
      </div>

      <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
    </div>
  )
}

export default Appointment
