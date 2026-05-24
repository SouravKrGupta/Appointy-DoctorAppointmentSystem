import React from 'react'
import { Link } from 'react-router-dom'
import { specialityData } from '../assets/assets'

const SpecialityMenu = () => {
  return (
    <section id='speciality' className='section-shell'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='max-w-2xl space-y-3'>
          <p className='section-kicker'>Care by specialty</p>
          <h2 className='section-heading text-3xl sm:text-4xl'>Choose the care lane that fits your need.</h2>
        </div>
        <p className='section-copy max-w-xl'>
          Browse specialities the way you would browse a well-organized studio: clear categories,
          quiet confidence, and zero clutter.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6'>
        {specialityData.map((item, index) => (
          <Link
            key={item.speciality}
            to={`/doctors/${item.speciality}`}
            onClick={() => scrollTo(0, 0)}
            className='surface-panel group flex min-h-[220px] flex-col justify-between rounded-[28px] p-5 hover:-translate-y-1 hover:border-primary/30 hover:bg-white/85'
          >
            <div className='flex items-center justify-between'>
              <span className='chip'>0{index + 1}</span>
              <span className='rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500'>
                Specialty
              </span>
            </div>
            <div className='space-y-4'>
              <div className='flex h-20 w-20 items-center justify-center rounded-[24px] bg-white shadow-soft'>
                <img className='w-14 transition-transform duration-300 group-hover:scale-110' src={item.image} alt={item.speciality} />
              </div>
              <div>
                <h3 className='text-xl text-ink'>{item.speciality}</h3>
                <p className='mt-2 text-sm leading-6 text-slate-600'>
                  Explore specialists with approachable profiles, upfront booking, and immediate
                  availability context.
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default SpecialityMenu
