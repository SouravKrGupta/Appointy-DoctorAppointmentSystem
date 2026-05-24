import React from 'react'
import { assets } from '../assets/assets'

const values = [
  {
    title: 'Efficiency',
    body: 'A calmer booking workflow that keeps people moving from search to confirmation without friction.',
  },
  {
    title: 'Convenience',
    body: 'Trusted specialists, schedules, and appointment details gathered into one approachable interface.',
  },
  {
    title: 'Personalization',
    body: 'Patient details, profile editing, and appointment memory that make return visits feel easier.',
  },
]

const About = () => {
  return (
    <div className='section-shell pt-6'>
      <div className='surface-panel-strong px-6 py-8 sm:px-8'>
        <div className='grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]'>
          <img
            className='w-full rounded-[30px] object-cover shadow-soft'
            src={assets.about_image}
            alt='About Appointy'
          />
          <div className='space-y-5'>
            <p className='section-kicker'>About Appointy</p>
            <h1 className='section-heading text-3xl sm:text-4xl'>
              We make doctor scheduling feel composed, direct, and trustworthy.
            </h1>
            <p className='section-copy'>
              Appointy is built for people who want healthcare access without the usual noise. The
              platform keeps discovery, slot selection, and profile management in one refined flow so
              patients can act quickly and confidently.
            </p>
            <p className='section-copy'>
              Our focus is not only speed, but clarity. We aim to make every page answer the next
              patient question before it needs to be asked.
            </p>
            <div className='grid gap-3 sm:grid-cols-3'>
              <div className='surface-panel rounded-[24px] px-4 py-4 text-center'>
                <p className='text-3xl font-semibold text-ink'>100+</p>
                <p className='mt-1 text-sm text-slate-600'>trusted doctors</p>
              </div>
              <div className='surface-panel rounded-[24px] px-4 py-4 text-center'>
                <p className='text-3xl font-semibold text-ink'>7-day</p>
                <p className='mt-1 text-sm text-slate-600'>availability horizon</p>
              </div>
              <div className='surface-panel rounded-[24px] px-4 py-4 text-center'>
                <p className='text-3xl font-semibold text-ink'>1 flow</p>
                <p className='mt-1 text-sm text-slate-600'>from discovery to booking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-8 space-y-4'>
        <p className='section-kicker'>Why patients choose us</p>
        <h2 className='section-heading text-3xl sm:text-4xl'>The product is shaped around calm confidence.</h2>
      </div>

      <div className='mt-6 grid gap-5 md:grid-cols-3'>
        {values.map((value) => (
          <div key={value.title} className='surface-panel rounded-[28px] p-6 hover:-translate-y-1'>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary'>{value.title}</p>
            <h3 className='mt-4 text-2xl text-ink'>{value.title} with intention.</h3>
            <p className='mt-4 text-sm leading-7 text-slate-600'>{value.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default About
