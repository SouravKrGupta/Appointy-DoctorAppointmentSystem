import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext)
  const navigate = useNavigate()

  const [relDoc, setRelDoc] = useState([])

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const doctorsData = doctors.filter(
        (doc) => doc.speciality === speciality && doc._id !== docId
      )
      setRelDoc(doctorsData)
    }
  }, [doctors, speciality, docId])

  if (!relDoc.length) {
    return null
  }

  return (
    <section className='section-shell'>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div className='space-y-3'>
          <p className='section-kicker'>Keep exploring</p>
          <h2 className='section-heading text-3xl sm:text-4xl'>More doctors in this specialty.</h2>
        </div>
        <p className='section-copy max-w-xl'>
          A few additional profiles, surfaced without making you restart the search.
        </p>
      </div>

      <div className='grid grid-cols-auto gap-5'>
        {relDoc.map((item) => (
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
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default RelatedDoctors
