import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Banner = () => {
  const navigate = useNavigate()

  return (
    <section className='section-shell'>
      <div className='overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#0f766e_0%,#0b5953_100%)] px-6 py-8 text-white shadow-float sm:px-8 lg:px-10'>
        <div className='grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]'>
          <div className='space-y-5'>
            <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(255,255,255,0.78)]'>
              Ready when you are
            </p>
            <h2 className='section-heading max-w-xl text-white'>
              Turn uncertainty into a confirmed appointment in a few clear steps.
            </h2>
            <p className='max-w-xl text-sm leading-7 text-[rgba(255,255,255,0.82)] sm:text-base'>
              Create an account, save your details once, and keep every future booking smoother. The
              interface stays friendly, while the care experience feels intentionally premium.
            </p>
            <div className='flex flex-wrap gap-3'>
              <button
                onClick={() => {
                  navigate('/login')
                  scrollTo(0, 0)
                }}
                className='rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-soft hover:-translate-y-1'
              >
                Create account
              </button>
              <button
                onClick={() => {
                  navigate('/doctors')
                  scrollTo(0, 0)
                }}
                className='rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10'
              >
                Browse doctors
              </button>
            </div>
          </div>

          <div className='relative hidden min-h-[320px] md:block'>
            <div className='absolute left-10 top-6 rounded-[26px] border border-white/20 bg-white/12 px-5 py-4 backdrop-blur'>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/70'>Booking style</p>
              <p className='mt-2 text-lg text-white'>Warm visuals, quick decisions, less friction.</p>
            </div>
            <img
              className='absolute bottom-[-2rem] right-0 max-w-[360px] rounded-t-[34px] object-cover'
              src={assets.appointment_img}
              alt='Appointment illustration'
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner
