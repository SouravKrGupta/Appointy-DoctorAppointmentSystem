import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const specialityOptions = [
  'General physician',
  'Gynecologist',
  'Dermatologist',
  'Pediatricians',
  'Neurologist',
  'Gastroenterologist',
]

const Doctors = () => {
  const { speciality } = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const navigate = useNavigate()

  const { doctors } = useContext(AppContext)

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter((doc) => doc.speciality === speciality))
    } else {
      setFilterDoc(doctors)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  return (
    <div className='section-shell pt-6'>
      <div className='surface-panel-strong px-6 py-8 sm:px-8'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-2xl space-y-3'>
            <p className='section-kicker'>Doctor directory</p>
            <h1 className='section-heading text-3xl sm:text-4xl'>
              {speciality ? `${speciality} specialists` : 'Browse doctors by expertise and availability.'}
            </h1>
            <p className='section-copy'>
              Explore specialist profiles, compare availability, and move from browsing to booking
              without losing momentum.
            </p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <span className='chip'>{filterDoc.length} doctors surfaced</span>
            <span className='chip bg-[rgba(215,141,95,0.14)] text-[var(--accent)]'>Updated visual refresh</span>
          </div>
        </div>
      </div>

      <div className='mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]'>
        <aside className='surface-panel h-fit rounded-[30px] p-5'>
          <div className='flex items-center justify-between gap-3 lg:block'>
            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary'>Filters</p>
              <p className='text-sm leading-6 text-slate-600'>
                Focus the list by specialty to shorten the path to the right appointment.
              </p>
            </div>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`secondary-btn px-4 py-2 text-xs lg:hidden ${showFilter ? 'bg-primary text-white' : ''}`}
            >
              {showFilter ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className={`${showFilter ? 'mt-5 flex' : 'hidden'} flex-col gap-3 lg:mt-5 lg:flex`}>
            {specialityOptions.map((option) => {
              const isActive = speciality === option
              return (
                <button
                  key={option}
                  onClick={() => (isActive ? navigate('/doctors') : navigate(`/doctors/${option}`))}
                  className={`rounded-[20px] border px-4 py-3 text-left text-sm font-semibold ${
                    isActive
                      ? 'border-primary bg-primary text-white shadow-soft'
                      : 'border-[rgba(24,53,51,0.12)] bg-white/80 text-slate-700 hover:border-primary/30 hover:bg-white'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </aside>

        <section className='grid grid-cols-auto gap-5'>
          {filterDoc.map((item) => (
            <article
              key={item._id}
              onClick={() => {
                navigate(`/appointment/${item._id}`)
                scrollTo(0, 0)
              }}
              className='doctor-card'
            >
              <img className='doctor-card-image' src={item.image} alt={item.name} />
              <div className='doctor-card-body'>
                <span className={`status-pill ${item.available ? '' : 'offline'}`}>
                  <span className={`h-2 w-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-slate-400'}`} />
                  {item.available ? 'Available now' : 'Offline'}
                </span>
                <h2 className='mt-4 text-2xl text-ink'>{item.name}</h2>
                <p className='mt-2 text-sm uppercase tracking-[0.18em] text-slate-500'>{item.speciality}</p>
                <p className='mt-4 text-sm leading-6 text-slate-600'>
                  Thoughtful profile details, visible pricing, and instant appointment windows.
                </p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default Doctors
