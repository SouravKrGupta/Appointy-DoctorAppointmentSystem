import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div className='section-shell pt-6'>
      <div className='surface-panel-strong px-6 py-8 sm:px-8'>
        <div className='grid gap-8 lg:grid-cols-[1fr_1fr]'>
          <div className='space-y-5'>
            <p className='section-kicker'>Contact us</p>
            <h1 className='section-heading text-3xl sm:text-4xl'>
              Reach the team behind your smoother booking experience.
            </h1>
            <p className='section-copy max-w-xl'>
              Whether you need support, partnership information, or product guidance, we keep the
              contact experience as straightforward as the booking flow itself.
            </p>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='surface-panel rounded-[24px] p-5'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary'>Office</p>
                <p className='mt-3 text-sm leading-7 text-slate-600'>
                  54709 Willms Station
                  <br />
                  Suite 350, Washington, USA
                </p>
              </div>
              <div className='surface-panel rounded-[24px] p-5'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary'>Direct</p>
                <p className='mt-3 text-sm leading-7 text-slate-600'>
                  Tel: (415) 555-0132
                  <br />
                  customersupport@appointy.in
                </p>
              </div>
            </div>

            <div className='surface-panel rounded-[28px] p-6'>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary'>Careers</p>
              <h2 className='mt-3 text-2xl text-ink'>Help shape warmer healthcare software.</h2>
              <p className='mt-3 text-sm leading-7 text-slate-600'>
                We are always interested in thoughtful builders, designers, and operators who care
                about clarity, trust, and patient experience.
              </p>
              <button className='secondary-btn mt-5'>Explore jobs</button>
            </div>
          </div>

          <div className='relative'>
            <div className='absolute right-2 top-6 hidden h-24 w-24 rounded-full bg-[rgba(15,118,110,0.16)] blur-3xl lg:block' />
            <img
              className='w-full rounded-[30px] object-cover shadow-soft'
              src={assets.contact_image}
              alt='Contact Appointy'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
