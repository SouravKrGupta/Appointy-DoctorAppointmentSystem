import axios from 'axios'
import React, { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'

const Login = () => {

  const [state, setState] = useState('Admin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)

  const onSubmitHandler = async (event) => { 
    event.preventDefault();

    if (state === 'Admin') {

      const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
      if (data.success) {
        setAToken(data.token)
        localStorage.setItem('aToken', data.token)
      } else {
        toast.error(data.message)
      }

    } else {

      const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
      if (data.success) {
        setDToken(data.token)
        localStorage.setItem('dToken', data.token)
      } else {
        toast.error(data.message)
      }

    }

  }

  return (
    <div className='mx-auto flex min-h-screen max-w-[1400px] items-center px-4 py-8 sm:px-6 lg:px-8'>
      <div className='grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]'>
        <section className='shell-panel-strong relative overflow-hidden p-8 sm:p-10 lg:p-12'>
          <div className='absolute -left-16 top-12 h-40 w-40 rounded-full bg-accent/20 blur-3xl' />
          <div className='absolute bottom-8 right-0 h-52 w-52 rounded-full bg-primary/15 blur-3xl' />
          <div className='relative'>
            <p className='page-kicker'>Operations Hub</p>
            <h1 className='page-title max-w-xl'>
              A cleaner control room for managing appointments, doctors, and daily clinic flow.
            </h1>
            <p className='page-copy'>
              Switch between administrator and doctor access without changing apps. The workspace is designed to keep schedules, staffing, and patient activity easy to scan at a glance.
            </p>

            <div className='mt-8 grid gap-4 sm:grid-cols-3'>
              <div className='mini-card'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Fast overview</p>
                <p className='mt-3 display-font text-lg font-semibold text-ink'>Dashboards that surface the day&apos;s activity instantly.</p>
              </div>
              <div className='mini-card'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Role switching</p>
                <p className='mt-3 display-font text-lg font-semibold text-ink'>Separate admin and doctor views with familiar navigation.</p>
              </div>
              <div className='mini-card'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Focused workflow</p>
                <p className='mt-3 display-font text-lg font-semibold text-ink'>Styled forms, cards, and tables for day-to-day use.</p>
              </div>
            </div>
          </div>
        </section>

        <form onSubmit={onSubmitHandler} className='shell-panel p-6 sm:p-8 lg:p-10'>
          <div className='flex flex-wrap gap-3'>
            <button
              type='button'
              onClick={() => setState('Admin')}
              className={state === 'Admin' ? 'primary-btn px-5 py-2.5' : 'secondary-btn'}
            >
              Admin
            </button>
            <button
              type='button'
              onClick={() => setState('Doctor')}
              className={state === 'Doctor' ? 'primary-btn px-5 py-2.5' : 'secondary-btn'}
            >
              Doctor
            </button>
          </div>

          <div className='mt-8'>
            <p className='page-kicker'>{state} Access</p>
            <h2 className='page-title'>{state} login</h2>
            <p className='page-copy'>
              Enter your account email and password to open the workspace.
            </p>
          </div>

          <div className='mt-8 space-y-5'>
            <div>
              <label className='field-label' htmlFor='email'>Email address</label>
              <input
                id='email'
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className='field-input'
                type='email'
                placeholder='name@clinic.com'
                required
              />
            </div>

            <div>
              <label className='field-label' htmlFor='password'>Password</label>
              <input
                id='password'
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className='field-input'
                type='password'
                placeholder='Enter your password'
                required
              />
            </div>

            <button className='primary-btn w-full'>Open workspace</button>
          </div>

          <p className='mt-6 text-sm text-slate-500'>
            {state === 'Admin' ? 'Need doctor access instead?' : 'Need admin access instead?'}{' '}
            <button
              type='button'
              onClick={() => setState(state === 'Admin' ? 'Doctor' : 'Admin')}
              className='font-semibold text-primary underline-offset-4 transition hover:underline'
            >
              Switch here
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
