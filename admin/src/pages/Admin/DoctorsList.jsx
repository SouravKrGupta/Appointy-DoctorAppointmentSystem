import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])

  const availableCount = doctors.filter((item) => item.available).length
  const unavailableCount = doctors.length - availableCount

  return (
    <div className='page-wrap'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='page-kicker'>Provider Directory</p>
          <h1 className='page-title'>All doctors</h1>
          <p className='page-copy'>
            Review the doctor roster, check specialties, and toggle availability without leaving the list.
          </p>
        </div>
        <p className='role-badge'>{doctors.length} providers</p>
      </div>

      <div className='mt-8 grid gap-4 md:grid-cols-3'>
        <div className='mini-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Total doctors</p>
          <p className='mt-3 display-font text-2xl font-semibold text-ink'>{doctors.length}</p>
          <p className='mt-2 text-sm text-slate-500'>Every doctor profile currently saved in the system.</p>
        </div>
        <div className='mini-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Available now</p>
          <p className='mt-3 display-font text-2xl font-semibold text-ink'>{availableCount}</p>
          <p className='mt-2 text-sm text-slate-500'>Providers currently open for new appointment bookings.</p>
        </div>
        <div className='mini-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Unavailable</p>
          <p className='mt-3 display-font text-2xl font-semibold text-ink'>{unavailableCount}</p>
          <p className='mt-2 text-sm text-slate-500'>Profiles temporarily hidden from patient booking flow.</p>
        </div>
      </div>

      <div className='mt-8 grid grid-cols-auto gap-5'>
        {doctors.map((item, index) => (
          <div className='shell-panel overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-float' key={index}>
            <div className='relative bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 px-4 pt-4'>
              <img className='mx-auto h-56 w-full rounded-[24px] object-cover' src={item.image} alt="" />
            </div>
            <div className='p-5'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='display-font text-lg font-semibold text-ink'>{item.name}</p>
                  <p className='mt-1 text-sm text-slate-500'>{item.speciality}</p>
                </div>
                <span className={item.available ? 'status-chip status-complete' : 'status-chip status-cancelled'}>
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div className='mt-5 toggle-wrap'>
                <input
                  onChange={() => changeAvailability(item._id)}
                  type="checkbox"
                  checked={item.available}
                  className='h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/20'
                />
                <p className='text-sm font-medium text-slate-600'>Allow bookings</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorsList
