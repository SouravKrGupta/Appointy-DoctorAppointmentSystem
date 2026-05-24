import React, { useContext, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Doctors', to: '/doctors' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const Navbar = () => {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const {
    token,
    setToken,
    userData,
    notifications,
    unreadNotificationCount,
    unreadChatCount,
    markNotificationsRead,
  } = useContext(AppContext)

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    navigate('/login')
  }

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) {
      return 'Just now'
    }

    const diffMinutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000))

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    }

    const diffHours = Math.round(diffMinutes / 60)
    if (diffHours < 24) {
      return `${diffHours}h ago`
    }

    const diffDays = Math.round(diffHours / 24)
    return `${diffDays}d ago`
  }

  const openNotification = async (notification) => {
    if (!notification.isRead) {
      await markNotificationsRead([notification._id])
    }

    setShowNotifications(false)

    if (notification.actionLink) {
      navigate(notification.actionLink)
    }
  }

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
      isActive
        ? 'bg-primary text-white shadow-soft'
        : 'text-slate-600 hover:bg-white/80 hover:text-ink'
    }`

  return (
    <>
      <header className='sticky top-4 z-40 pt-4'>
        <div className='surface-panel-strong flex items-center justify-between gap-4 px-4 py-4 sm:px-6'>
          <button
            onClick={() => navigate('/')}
            className='flex items-center gap-3 text-left'
          >
            <span className='flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-white shadow-soft'>
              <img
                src={assets.logo || '/fallback-logo.png'}
                alt='Appointy logo'
                className='h-full w-full object-cover object-center'
              />
            </span>
            <span className='hidden sm:block'>
              <span className='block text-xs font-semibold uppercase tracking-[0.26em] text-primary'>
                Appointy
              </span>
              <span className='display-font block text-xl text-ink'>
                Doctor booking, softened.
              </span>
            </span>
          </button>

          <nav className='hidden items-center gap-2 md:flex'>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className='flex items-center gap-3'>
            {token && userData ? (
              <>
                <button
                  onClick={() => navigate('/my-chats')}
                  className='relative hidden items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-soft hover:bg-white sm:inline-flex'
                >
                  <img className='w-4' src={assets.chats_icon} alt='Chats' />
                  Chats
                  {unreadChatCount > 0 && (
                    <span className='absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white'>
                      {unreadChatCount}
                    </span>
                  )}
                </button>

                <div className='relative'>
                  <button
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className='relative inline-flex h-11 items-center justify-center rounded-2xl border border-white/70 bg-white/90 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-soft hover:bg-white'
                  >
                    Alerts
                    {unreadNotificationCount > 0 && (
                      <span className='absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] text-white'>
                        {unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className='absolute right-0 top-full z-30 mt-3 w-[320px]'>
                      <div className='surface-panel-strong p-4'>
                        <div className='flex items-center justify-between gap-3'>
                          <div>
                            <p className='text-xs font-semibold uppercase tracking-[0.22em] text-primary'>
                              Notifications
                            </p>
                            <p className='mt-1 text-sm text-slate-500'>
                              Live updates from appointments and chat.
                            </p>
                          </div>
                          {notifications.length > 0 && unreadNotificationCount > 0 && (
                            <button
                              onClick={() => markNotificationsRead()}
                              className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'
                            >
                              Mark all
                            </button>
                          )}
                        </div>

                        <div className='mt-4 space-y-3'>
                          {notifications.slice(0, 6).map((notification) => (
                            <button
                              key={notification._id}
                              onClick={() => openNotification(notification)}
                              className={`w-full rounded-[22px] border px-4 py-3 text-left ${
                                notification.isRead
                                  ? 'border-[var(--line)] bg-white/75'
                                  : 'border-[rgba(15,118,110,0.18)] bg-[rgba(15,118,110,0.08)]'
                              }`}
                            >
                              <div className='flex items-start justify-between gap-3'>
                                <p className='text-sm font-semibold text-ink'>{notification.title}</p>
                                <span className='text-[11px] uppercase tracking-[0.18em] text-slate-400'>
                                  {formatNotificationTime(notification.createdAt)}
                                </span>
                              </div>
                              <p className='mt-2 text-sm leading-6 text-slate-500'>
                                {notification.message}
                              </p>
                            </button>
                          ))}

                          {!notifications.length && (
                            <div className='rounded-[22px] border border-dashed border-[var(--line)] px-4 py-6 text-center text-sm text-slate-500'>
                              No notifications yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className='group relative'>
                  <button className='flex items-center gap-3 rounded-full border border-white/70 bg-white/90 px-2 py-2 shadow-soft'>
                    <img
                      className='h-10 w-10 rounded-full object-cover'
                      src={userData.image || '/fallback-user.png'}
                      alt='profile'
                    />
                    <span className='hidden text-left sm:block'>
                      <span className='block text-xs uppercase tracking-[0.2em] text-slate-500'>
                        Profile
                      </span>
                      <span className='block max-w-32 truncate text-sm font-semibold text-ink'>
                        {userData.name}
                      </span>
                    </span>
                    <img
                      className='w-2.5 opacity-70'
                      src={assets.dropdown_icon || '/fallback-icon.png'}
                      alt='dropdown'
                    />
                  </button>
                  <div className='invisible absolute right-0 top-full z-20 mt-3 w-56 translate-y-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100'>
                    <div className='surface-panel-strong flex flex-col gap-1 p-3 text-sm text-slate-600'>
                      <button
                        onClick={() => navigate('/my-profile')}
                        className='rounded-2xl px-4 py-3 text-left hover:bg-white'
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => navigate('/my-appointments')}
                        className='rounded-2xl px-4 py-3 text-left hover:bg-white'
                      >
                        My Appointments
                      </button>
                      <button
                        onClick={() => navigate('/my-chats')}
                        className='rounded-2xl px-4 py-3 text-left hover:bg-white'
                      >
                        My Chats
                      </button>
                      <button
                        onClick={logout}
                        className='rounded-2xl px-4 py-3 text-left text-red-500 hover:bg-red-50'
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <button onClick={() => navigate('/login')} className='primary-btn hidden md:inline-flex'>
                Create Account
              </button>
            )}

            <button
              onClick={() => setShowMenu(true)}
              className='inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/90 shadow-soft md:hidden'
              aria-label='Open menu'
            >
              <img className='w-5' src={assets.menu_icon} alt='' />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 bg-[#183533]/40 p-4 transition-all duration-300 md:hidden ${
          showMenu ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          className={`surface-panel-strong ml-auto flex h-full w-full max-w-sm flex-col px-5 py-6 transition-transform duration-300 ${
            showMenu ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className='mb-8 flex items-center justify-between'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary'>
                Menu
              </p>
              <p className='display-font text-2xl text-ink'>Navigate care</p>
            </div>
            <button
              onClick={() => setShowMenu(false)}
              className='inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white'
              aria-label='Close menu'
            >
              <img className='w-5' src={assets.cross_icon} alt='' />
            </button>
          </div>

          <div className='flex flex-1 flex-col gap-3'>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  `rounded-[22px] px-4 py-4 text-sm font-semibold uppercase tracking-[0.22em] ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className='mt-8'>
            {token && userData ? (
              <div className='space-y-3'>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    navigate('/my-profile')
                  }}
                  className='secondary-btn w-full'
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    navigate('/my-appointments')
                  }}
                  className='secondary-btn w-full'
                >
                  My Appointments
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    navigate('/my-chats')
                  }}
                  className='secondary-btn w-full'
                >
                  My Chats
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    logout()
                  }}
                  className='primary-btn w-full'
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowMenu(false)
                  navigate('/login')
                }}
                className='primary-btn w-full'
              >
                Create Account
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
