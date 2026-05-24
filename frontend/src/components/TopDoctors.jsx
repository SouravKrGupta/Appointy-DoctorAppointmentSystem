import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const TopDoctors = () => {
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)

  return (
    <section className='section-shell'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='max-w-2xl space-y-3'>
          <p className='section-kicker'>Curated picks</p>
          <h2 className='section-heading text-3xl sm:text-4xl'>Top doctors for quick, confident booking.</h2>
        </div>
        <button
          onClick={() => {
            navigate('/doctors')
            scrollTo(0, 0)
          }}
          className='secondary-btn self-start sm:self-auto'
        >
          View all doctors
        </button>
      </div>

      <div className='grid grid-cols-auto gap-5'>
        {doctors.slice(0, 10).map((item) => (
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
              <h3 className='mt-4 text-2xl text-ink'>{item.name}</h3>
              <p className='mt-2 text-sm uppercase tracking-[0.18em] text-slate-500'>{item.speciality}</p>
              <p className='mt-4 text-sm leading-6 text-slate-600'>
                Clear profile, easy slot selection, and a lightweight booking flow from discovery to
                confirmation.
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TopDoctors
