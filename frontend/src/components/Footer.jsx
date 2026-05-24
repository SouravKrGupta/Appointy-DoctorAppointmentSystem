import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className='section-shell mb-0 pb-10'>
      <div className='surface-panel-strong px-6 py-8 sm:px-8'>
        <div className='grid gap-10 lg:grid-cols-[2.2fr_1fr_1fr]'>
          <div className='space-y-5'>
            <div className='flex items-center gap-4'>
              <div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-soft'>
                <img className='h-full w-full object-cover' src={assets.logo} alt='Appointy logo' />
              </div>
              <div>
                <p className='section-kicker'>Appointy</p>
                <h3 className='display-font text-2xl text-ink'>Effortless healthcare scheduling.</h3>
              </div>
            </div>
            <p className='section-copy max-w-2xl'>
              Patients can discover trusted specialists, compare schedules, and confirm appointments
              without a noisy experience. The product is designed to feel reassuring from the first
              visit to the final confirmation.
            </p>
          </div>

          <div>
            <p className='mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-primary'>Company</p>
            <div className='flex flex-col gap-3 text-sm text-slate-600'>
              <Link to='/' className='hover:text-ink'>Home</Link>
              <Link to='/about' className='hover:text-ink'>About Us</Link>
              <Link to='/doctors' className='hover:text-ink'>Doctors</Link>
              <Link to='/contact' className='hover:text-ink'>Contact</Link>
            </div>
          </div>

          <div>
            <p className='mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-primary'>Get in touch</p>
            <div className='space-y-3 text-sm text-slate-600'>
              <p>+91-90000-90000</p>
              <p>customersupport@appointy.in</p>
              <p>Open for bookings every day, with quick patient follow-up built in.</p>
            </div>
          </div>
        </div>

        <div className='mt-8 flex flex-col gap-3 border-t border-[rgba(24,53,51,0.12)] pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between'>
          <p>Copyright 2025 Appointy. All rights reserved.</p>
          <p>Designed for calm booking and clear decisions.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
