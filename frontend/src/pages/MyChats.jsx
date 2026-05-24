import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useSearchParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const MyChats = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    backendUrl,
    token,
    chatThreads,
    fetchChatThreads,
    fetchNotifications,
    chatRefreshToken,
    socketConnected,
  } = useContext(AppContext)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const selectedQueryAppointment = searchParams.get('appointment') || ''

  const selectedAppointmentId =
    selectedQueryAppointment || chatThreads[0]?.appointmentId || ''
  const selectedThread =
    chatThreads.find((thread) => thread.appointmentId === selectedAppointmentId) || null

  const formatSlotDate = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${day} ${months[Number(month) - 1]} ${year}`
  }

  const formatMessageTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })

  const loadMessages = async () => {
    if (!selectedAppointmentId || !token) {
      setMessages([])
      return
    }

    setLoadingMessages(true)

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/chat/${selectedAppointmentId}/messages`,
        { headers: { token } }
      )

      if (data.success) {
        setMessages(data.messages)
        const hasUnreadIncomingMessages = data.messages.some(
          (message) => !message.isMine && !message.seenByRecipient
        )

        if (hasUnreadIncomingMessages) {
          axios.post(
            `${backendUrl}/api/user/chat/${selectedAppointmentId}/read`,
            {},
            { headers: { token } }
          ).catch((error) => {
            console.log('Chat read error', error)
          })
        }
        fetchChatThreads()
        fetchNotifications()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setLoadingMessages(false)
    }
  }

  const sendMessage = async (event) => {
    event.preventDefault()

    if (!messageText.trim() || !selectedAppointmentId) {
      return
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/chat/${selectedAppointmentId}/messages`,
        { text: messageText },
        { headers: { token } }
      )

      if (data.success) {
        setMessageText('')
        setMessages((prev) => [...prev, data.message])
        fetchChatThreads()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    if (!chatThreads.length || selectedQueryAppointment) {
      return
    }

    setSearchParams({ appointment: chatThreads[0].appointmentId }, { replace: true })
  }, [chatThreads, selectedQueryAppointment, setSearchParams])

  useEffect(() => {
    if (token) {
      fetchChatThreads()
    }
  }, [token])

  useEffect(() => {
    loadMessages()
  }, [selectedAppointmentId, token, chatRefreshToken])

  return (
    <div className='section-shell pt-6'>
      <div className='surface-panel-strong px-6 py-8 sm:px-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-3'>
            <p className='section-kicker'>Live chat</p>
            <h1 className='section-heading text-3xl sm:text-4xl'>Talk with your doctor after booking.</h1>
            <p className='section-copy max-w-2xl'>
              Every confirmed appointment opens a private chat thread so you and your doctor can coordinate in real time.
            </p>
          </div>
          <span className='chip'>
            {socketConnected ? 'Realtime connected' : 'Connecting'}
          </span>
        </div>

        <div className='mt-8 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]'>
          <aside className='surface-panel p-4'>
            <div className='flex items-center justify-between gap-3 px-2 pb-3'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.22em] text-primary'>Threads</p>
                <p className='mt-1 text-sm text-slate-500'>{chatThreads.length} active appointment chats</p>
              </div>
            </div>

            <div className='space-y-3'>
              {chatThreads.map((thread) => (
                <button
                  key={thread.appointmentId}
                  onClick={() => setSearchParams({ appointment: thread.appointmentId })}
                  className={`w-full rounded-[24px] border px-4 py-4 text-left ${
                    thread.appointmentId === selectedAppointmentId
                      ? 'border-[rgba(15,118,110,0.24)] bg-[rgba(15,118,110,0.08)]'
                      : 'border-[var(--line)] bg-white/80'
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <img
                      src={thread.counterpart.image}
                      alt={thread.counterpart.name}
                      className='h-14 w-14 rounded-[18px] object-cover'
                    />
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <p className='font-semibold text-ink'>{thread.counterpart.name}</p>
                          <p className='mt-1 text-sm text-slate-500'>{thread.counterpart.subtitle}</p>
                        </div>
                        {thread.unreadCount > 0 && (
                          <span className='flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-[11px] font-semibold text-white'>
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className='mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
                        {formatSlotDate(thread.appointment.slotDate)} - {thread.appointment.slotTime}
                      </p>
                      <p className='mt-2 truncate text-sm text-slate-500'>
                        {thread.lastMessage?.text || 'No messages yet. Start the conversation.'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {!chatThreads.length && (
                <div className='rounded-[24px] border border-dashed border-[var(--line)] px-5 py-8 text-center text-sm text-slate-500'>
                  Book an appointment to unlock chat with your doctor.
                </div>
              )}
            </div>
          </aside>

          <section className='surface-panel p-4 sm:p-5'>
            {selectedThread ? (
              <>
                <div className='flex flex-col gap-4 rounded-[24px] border border-[var(--line)] bg-white/88 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-center gap-4'>
                    <img
                      src={selectedThread.counterpart.image}
                      alt={selectedThread.counterpart.name}
                      className='h-16 w-16 rounded-[20px] object-cover'
                    />
                    <div>
                      <p className='text-xl text-ink'>{selectedThread.counterpart.name}</p>
                      <p className='mt-1 text-sm text-slate-500'>{selectedThread.counterpart.subtitle}</p>
                      <p className='mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
                        Appointment on {formatSlotDate(selectedThread.appointment.slotDate)} at {selectedThread.appointment.slotTime}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`status-pill w-fit ${
                      selectedThread.canChat
                        ? ''
                        : 'offline bg-[rgba(184,91,84,0.12)] text-[var(--danger)]'
                    }`}
                  >
                    {selectedThread.canChat ? 'Chat enabled' : 'Chat paused'}
                  </span>
                </div>

                <div className='mt-5 rounded-[26px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-4'>
                  <div className='max-h-[460px] space-y-4 overflow-y-auto pr-1'>
                    {loadingMessages ? (
                      <div className='py-10 text-center text-sm text-slate-500'>Loading conversation...</div>
                    ) : messages.length ? (
                      messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[78%] rounded-[24px] px-4 py-3 ${
                              message.isMine
                                ? 'bg-primary text-white'
                                : 'bg-white text-slate-700 shadow-soft'
                            }`}
                          >
                            <p className='text-sm leading-6'>{message.text}</p>
                            <div
                              className={`mt-2 flex items-center justify-end gap-2 text-[11px] ${
                                message.isMine ? 'text-white/80' : 'text-slate-400'
                              }`}
                            >
                              <span>{formatMessageTime(message.createdAt)}</span>
                              {message.isMine && (
                                <span>{message.seenByRecipient ? 'Seen' : 'Sent'}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='py-10 text-center text-sm text-slate-500'>
                        No messages yet. Send the first note to your doctor.
                      </div>
                    )}
                  </div>

                  <form onSubmit={sendMessage} className='mt-4 flex flex-col gap-3 sm:flex-row'>
                    <input
                      value={messageText}
                      onChange={(event) => setMessageText(event.target.value)}
                      className='field-input flex-1'
                      placeholder={
                        selectedThread.canChat
                          ? 'Type your message for the doctor'
                          : 'This appointment was cancelled, so chat is disabled'
                      }
                      disabled={!selectedThread.canChat}
                    />
                    <button
                      type='submit'
                      className='primary-btn justify-center'
                      disabled={!selectedThread.canChat}
                    >
                      Send message
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className='flex min-h-[420px] items-center justify-center rounded-[26px] border border-dashed border-[var(--line)] bg-white/70 px-6 text-center'>
                <div>
                  <p className='text-sm font-semibold uppercase tracking-[0.22em] text-primary'>No thread selected</p>
                  <p className='mt-3 text-lg text-slate-600'>
                    Choose an appointment chat from the left to start talking with your doctor.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default MyChats
