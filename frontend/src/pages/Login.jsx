import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext)
  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/user/register', {
          name,
          email,
          password,
        })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token, navigate])

  return (
    <div className='section-shell pt-8'>
      <div className='grid gap-6 lg:grid-cols-[0.95fr_1.05fr]'>
        <div className='overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#0f766e_0%,#0b5953_100%)] px-6 py-8 text-white shadow-float sm:px-8'>
          <p className='text-xs font-semibold uppercase tracking-[0.32em] text-white/75'>Patient account</p>
          <h1 className='section-heading mt-4 max-w-md text-white'>
            Create a space where every future appointment feels simpler.
          </h1>
          <p className='mt-4 max-w-md text-sm leading-7 text-white/82 sm:text-base'>
            Save your profile once, return to your doctors quickly, and keep every booking in a calm,
            consistent flow.
          </p>

          <div className='mt-8 grid gap-4 sm:grid-cols-2'>
            <div className='rounded-[24px] border border-white/18 bg-white/10 p-5 backdrop-blur'>
              <p className='text-3xl font-semibold text-white'>Fast</p>
              <p className='mt-2 text-sm text-white/80'>Move from signup to booked slot in just a few screens.</p>
            </div>
            <div className='rounded-[24px] border border-white/18 bg-white/10 p-5 backdrop-blur'>
              <p className='text-3xl font-semibold text-white'>Clear</p>
              <p className='mt-2 text-sm text-white/80'>Profiles, fees, and timing stay visible when decisions matter.</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmitHandler} className='surface-panel-strong p-6 sm:p-8'>
          <div className='mb-8 space-y-3'>
            <p className='section-kicker'>{state === 'Sign Up' ? 'Create account' : 'Welcome back'}</p>
            <h2 className='section-heading text-3xl'>
              {state === 'Sign Up' ? 'Join Appointy' : 'Log into your account'}
            </h2>
            <p className='section-copy'>
              {state === 'Sign Up'
                ? 'Set up your patient profile to start booking appointments.'
                : 'Pick up where you left off and manage your appointments.'}
            </p>
          </div>

          <div className='space-y-5'>
            {state === 'Sign Up' && (
              <div>
                <label className='field-label'>Full name</label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className='field-input'
                  type='text'
                  required
                />
              </div>
            )}

            <div>
              <label className='field-label'>Email</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className='field-input'
                type='email'
                required
              />
            </div>

            <div>
              <label className='field-label'>Password</label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className='field-input'
                type='password'
                required
              />
            </div>

            <button type='submit' className='primary-btn w-full'>
              {state === 'Sign Up' ? 'Create account' : 'Login'}
            </button>
          </div>

          <div className='mt-6 text-sm text-slate-600'>
            {state === 'Sign Up' ? (
              <p>
                Already have an account?{' '}
                <button
                  type='button'
                  onClick={() => setState('Login')}
                  className='font-semibold text-primary underline-offset-4 hover:underline'
                >
                  Login here
                </button>
              </p>
            ) : (
              <p>
                Need a new account?{' '}
                <button
                  type='button'
                  onClick={() => setState('Sign Up')}
                  className='font-semibold text-primary underline-offset-4 hover:underline'
                >
                  Create one
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
