import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useSearchParams } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

const DoctorChats = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    backendUrl,
    dToken,
    chatThreads,
    fetchChatThreads,
    fetchNotifications,
    chatRefreshToken,
    socketConnected,
  } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const selectedQueryAppointment = searchParams.get('appointment') || ''

  const authHeader = {
    headers: {
      Authorization: `Bearer ${dToken}`,
    },
  }

  const selectedAppointmentId =
    selectedQueryAppointment || chatThreads[0]?.appointmentId || ''
  const selectedThread =
    chatThreads.find((thread) => thread.appointmentId === selectedAppointmentId) || null

  const formatMessageTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })

  const loadMessages = async () => {
    if (!selectedAppointmentId || !dToken) {
      setMessages([])
      return
    }

    setLoadingMessages(true)

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/chat/${selectedAppointmentId}/messages`,
        authHeader
      )

      if (data.success) {
        setMessages(data.messages)
        const hasUnreadIncomingMessages = data.messages.some(
          (message) => !message.isMine && !message.seenByRecipient
        )

        if (hasUnreadIncomingMessages) {
          axios.post(
            `${backendUrl}/api/doctor/chat/${selectedAppointmentId}/read`,
            {},
            authHeader
          ).catch((error) => {
            console.log('Doctor chat read error', error)
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
        `${backendUrl}/api/doctor/chat/${selectedAppointmentId}/messages`,
        { text: messageText },
        authHeader
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
    if (dToken) {
      fetchChatThreads()
    }
  }, [dToken])

  useEffect(() => {
    loadMessages()
  }, [selectedAppointmentId, dToken, chatRefreshToken])

  return (
    <div className='page-wrap'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='page-kicker'>Realtime Doctor Chat</p>
          <h1 className='page-title'>Coordinate with patients after booking</h1>
          <p className='page-copy'>
            Every appointment unlocks a private thread so you can answer questions, confirm timing, and follow up in real time.
          </p>
        </div>
        <p className='role-badge'>{socketConnected ? 'Realtime connected' : 'Connecting'}</p>
      </div>

      <div className='mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]'>
        <aside className='data-card p-4'>
          <div className='flex items-center justify-between gap-3 px-2 pb-3'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary'>Patient threads</p>
              <p className='mt-1 text-sm text-slate-500'>{chatThreads.length} appointment chats</p>
            </div>
          </div>

          <div className='space-y-3'>
            {chatThreads.map((thread) => (
              <button
                key={thread.appointmentId}
                onClick={() => setSearchParams({ appointment: thread.appointmentId })}
                className={`w-full rounded-[24px] border px-4 py-4 text-left ${
                  thread.appointmentId === selectedAppointmentId
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-primary/10 bg-white/80'
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
                        <span className='inline-flex min-w-7 items-center justify-center rounded-full bg-primary px-2 py-1 text-[11px] text-white'>
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className='mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
                      {slotDateFormat(thread.appointment.slotDate)} - {thread.appointment.slotTime}
                    </p>
                    <p className='mt-2 truncate text-sm text-slate-500'>
                      {thread.lastMessage?.text || 'No messages yet. Start the conversation.'}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            {!chatThreads.length && (
              <div className='rounded-[24px] border border-dashed border-primary/15 px-5 py-8 text-center text-sm text-slate-500'>
                Appointment chats will appear here as soon as patients start booking.
              </div>
            )}
          </div>
        </aside>

        <section className='data-card p-4 sm:p-5'>
          {selectedThread ? (
            <>
              <div className='rounded-[26px] border border-primary/10 bg-white/85 px-4 py-4 sm:px-5'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                  <div className='flex items-center gap-4'>
                    <img
                      src={selectedThread.counterpart.image}
                      alt={selectedThread.counterpart.name}
                      className='h-16 w-16 rounded-[20px] object-cover'
                    />
                    <div>
                      <p className='display-font text-2xl font-semibold text-ink'>{selectedThread.counterpart.name}</p>
                      <p className='mt-1 text-sm text-slate-500'>Patient conversation</p>
                      <p className='mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
                        Appointment on {slotDateFormat(selectedThread.appointment.slotDate)} at {selectedThread.appointment.slotTime}
                      </p>
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    <span className='status-chip status-paid'>{currency}{selectedThread.appointment.amount}</span>
                    <span
                      className={`status-chip ${
                        selectedThread.canChat ? 'status-complete' : 'status-cancelled'
                      }`}
                    >
                      {selectedThread.canChat ? 'Chat enabled' : 'Chat paused'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='mt-5 rounded-[26px] border border-primary/10 bg-[rgba(255,255,255,0.72)] p-4'>
                <div className='max-h-[480px] space-y-4 overflow-y-auto pr-1'>
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
                      No messages yet. Send the first note to this patient.
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
                        ? 'Type your message for the patient'
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
            <div className='flex min-h-[420px] items-center justify-center rounded-[26px] border border-dashed border-primary/15 bg-white/70 px-6 text-center'>
              <div>
                <p className='text-sm font-semibold uppercase tracking-[0.22em] text-primary'>No thread selected</p>
                <p className='mt-3 text-lg text-slate-600'>
                  Choose a patient thread from the left to open the realtime conversation.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default DoctorChats
