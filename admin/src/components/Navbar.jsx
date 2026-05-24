import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const {
    dToken,
    setDToken,
    unreadChatCount,
  } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)
  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
  }

  return (
    <header className='shell-panel relative overflow-hidden px-4 py-4 sm:px-6'>
      <div className='absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-primary/10 via-accent/10 to-transparent' />
      <div className='relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <img
            onClick={() => navigate('/')}
            className='w-36 cursor-pointer rounded-2xl sm:w-40'
            src={assets.admin_logo}
            alt="Logo"
          />
          <div className='space-y-2'>
            <p className='role-badge'>{aToken ? 'Admin Console' : 'Doctor Workspace'}</p>
            <div>
              <p className='display-font text-lg font-semibold text-ink sm:text-xl'>
                {aToken ? 'Practice operations at a glance' : 'Your day, schedule, and patients'}
              </p>
              <p className='text-sm text-slate-500'>
                Keep appointments, staff information, and patient workflows organized in one place.
              </p>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-between gap-3 sm:justify-end'>
          <p className='hidden rounded-full border border-primary/10 bg-white/75 px-4 py-2 text-sm font-medium text-slate-500 md:block'>
            Signed in as <span className='font-semibold text-ink'>{aToken ? 'Administrator' : 'Doctor'}</span>
          </p>
          {dToken && !aToken && (
            <button
              onClick={() => navigate('/doctor-chats')}
              className='relative secondary-btn px-4 py-2.5 text-xs uppercase tracking-[0.2em]'
            >
              Chats
              {unreadChatCount > 0 && (
                <span className='absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white'>
                  {unreadChatCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={logout}
            className='primary-btn px-5 py-2.5'
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
