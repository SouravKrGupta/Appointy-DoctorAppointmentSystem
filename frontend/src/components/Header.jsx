import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Header = () => {
  return (
    <section className='section-shell pt-6'>
      <div className='surface-panel-strong overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10'>
        <div className='grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]'>
          <div className='space-y-6'>
            <span className='section-kicker'>Smart healthcare booking</span>
            <div className='space-y-4'>
              <h1 className='section-heading max-w-2xl'>
                Book the right doctor with a calmer, faster care journey.
              </h1>
              <p className='section-copy max-w-xl'>
                Browse verified specialists, compare availability, and lock in your visit without the
                usual back-and-forth. Appointy turns healthcare scheduling into something that feels
                guided, clear, and immediate.
              </p>
            </div>

            <div className='flex flex-wrap gap-3'>
              <a href='#speciality' className='primary-btn pulse-halo'>
                Explore specialties
                <img className='w-3' src={assets.arrow_icon} alt='' />
              </a>
              <Link to='/doctors' className='secondary-btn'>
                Meet top doctors
              </Link>
            </div>

            <div className='flex flex-wrap items-center gap-4 rounded-[26px] border border-white/60 bg-white/70 px-5 py-4 shadow-soft'>
              <img className='w-24 sm:w-28' src={assets.group_profiles} alt='Patients on Appointy' />
              <div className='space-y-1'>
                <p className='text-sm font-semibold text-ink'>Chosen by patients who want less friction.</p>
                <p className='text-sm text-slate-600'>
                  Fast discovery, dependable doctors, and a booking flow that keeps momentum.
                </p>
              </div>
            </div>

            <div className='grid gap-3 sm:grid-cols-3'>
              <div className='surface-panel rounded-[24px] px-4 py-4'>
                <p className='text-3xl font-semibold text-ink'>100+</p>
                <p className='mt-1 text-sm text-slate-600'>trusted doctors ready to book</p>
              </div>
              <div className='surface-panel rounded-[24px] px-4 py-4'>
                <p className='text-3xl font-semibold text-ink'>7 days</p>
                <p className='mt-1 text-sm text-slate-600'>of scheduling windows surfaced instantly</p>
              </div>
              <div className='surface-panel rounded-[24px] px-4 py-4'>
                <p className='text-3xl font-semibold text-ink'>Demo paid</p>
                <p className='mt-1 text-sm text-slate-600'>appointments confirmed without checkout friction</p>
              </div>
            </div>
          </div>

          <div className='relative'>
            <div className='absolute left-0 top-8 hidden h-28 w-28 rounded-full bg-[rgba(215,141,95,0.22)] blur-3xl lg:block' />
            <div className='surface-panel relative overflow-hidden rounded-[34px] p-4 sm:p-5'>
              <div className='absolute right-5 top-5 floating-accent rounded-[22px] border border-white/60 bg-white/90 px-4 py-3 shadow-soft'>
                <p className='text-xs font-semibold uppercase tracking-[0.22em] text-primary'>Live queue</p>
                <p className='mt-1 text-sm text-slate-600'>Open slots adapt across the next 7 days.</p>
              </div>
              <img
                className='h-full w-full rounded-[28px] object-cover object-top'
                src={assets.header_img}
                alt='Doctor with tablet'
              />
            </div>
            <div className='surface-panel-strong floating-accent absolute -bottom-6 left-4 max-w-xs rounded-[26px] px-5 py-4 lg:left-[-2rem]'>
              <p className='text-xs font-semibold uppercase tracking-[0.22em] text-primary'>Concierge feel</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                See specialties, profiles, timings, and fees in one place instead of jumping between
                calls and chats.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Header
