import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'

const Sidebar = () => {
  const {
    dToken,
    unreadChatCount,
    notifications,
    unreadNotificationCount,
    markNotificationsRead,
  } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const navigate = useNavigate()
  const adminLinks = [
    { to: '/admin-dashboard', label: 'Dashboard', icon: assets.home_icon },
    { to: '/all-appointments', label: 'Appointments', icon: assets.appointment_icon },
    { to: '/add-doctor', label: 'Add Doctor', icon: assets.add_icon },
    { to: '/doctor-list', label: 'Doctors List', icon: assets.people_icon },
  ]
  const doctorLinks = [
    { to: '/doctor-dashboard', label: 'Dashboard', icon: assets.home_icon },
    { to: '/doctor-appointments', label: 'Appointments', icon: assets.appointment_icon },
    { to: '/doctor-chats', label: 'Chats', icon: assets.chat_icon, badge: unreadChatCount },
    { to: '/doctor-profile', label: 'Profile', icon: assets.people_icon },
  ]
  const activeLinks = aToken ? adminLinks : doctorLinks

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

    return `${Math.round(diffHours / 24)}d ago`
  }

  const openNotification = async (notification) => {
    if (!notification.isRead) {
      await markNotificationsRead([notification._id])
    }

    if (notification.actionLink) {
      navigate(notification.actionLink)
    }
  }

  return (
    <aside className='sticky top-3 self-start'>
      <div className='shell-panel w-[92px] overflow-hidden p-3 md:w-[320px]'>
        <div className='mb-4 rounded-[22px] bg-gradient-to-br from-ink to-primary px-4 py-4 text-white'>
          <p className='text-xs font-semibold uppercase tracking-[0.28em] text-white/75'>Navigation</p>
          <p className='display-font mt-2 text-lg font-semibold'>
            {aToken ? 'Admin tools' : dToken ? 'Doctor menu' : 'Workspace'}
          </p>
        </div>

        <nav className='space-y-2'>
          {activeLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition duration-300 md:px-4 ${
                  isActive
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-slate-500 hover:bg-primary/5 hover:text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition duration-300 ${
                    isActive
                      ? 'border-white/30 bg-white/15'
                      : 'border-primary/10 bg-white group-hover:border-primary/20'
                  }`}>
                    <img className='min-w-5' src={item.icon} alt='' />
                  </span>
                  <span className='hidden md:flex md:items-center md:gap-2'>
                    <span>{item.label}</span>
                    {!!item.badge && (
                      <span className={`inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[11px] ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {dToken && !aToken && (
          <section className='mt-4 hidden rounded-[24px] border border-primary/10 bg-white/72 p-4 md:block'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.22em] text-primary'>
                  Alerts
                </p>
                <p className='mt-1 text-sm text-slate-500'>
                  Appointment and chat updates live here.
                </p>
              </div>
              <div className='flex items-center gap-2'>
                {unreadNotificationCount > 0 && (
                  <span className='inline-flex min-w-7 items-center justify-center rounded-full bg-rose-500 px-2 py-1 text-[11px] font-semibold text-white'>
                    {unreadNotificationCount}
                  </span>
                )}
                {notifications.length > 0 && unreadNotificationCount > 0 && (
                  <button
                    onClick={() => markNotificationsRead()}
                    className='text-[11px] font-semibold uppercase tracking-[0.18em] text-primary'
                  >
                    Mark all
                  </button>
                )}
              </div>
            </div>

            <div className='mt-4 space-y-3'>
              {notifications.slice(0, 5).map((notification) => (
                <button
                  key={notification._id}
                  onClick={() => openNotification(notification)}
                  className={`w-full rounded-[22px] border px-4 py-3 text-left transition duration-300 ${
                    notification.isRead
                      ? 'border-primary/10 bg-white/80 hover:border-primary/20 hover:bg-primary/5'
                      : 'border-primary/15 bg-primary/5 hover:border-primary/25 hover:bg-primary/10'
                  }`}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <p className='text-sm font-semibold leading-5 text-ink'>
                      {notification.title}
                    </p>
                    <span className='shrink-0 text-[11px] uppercase tracking-[0.18em] text-slate-400'>
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className='mt-2 text-sm leading-6 text-slate-500'>
                    {notification.message}
                  </p>
                </button>
              ))}

              {!notifications.length && (
                <div className='rounded-[22px] border border-dashed border-primary/15 px-4 py-6 text-center text-sm text-slate-500'>
                  No notifications yet.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
