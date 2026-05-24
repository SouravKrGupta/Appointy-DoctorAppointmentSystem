import React, { useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const HELP_BOT_SEEN_KEY = 'appointy-help-bot-seen'

let messageSequence = 0

const createMessage = (role, text, actions = []) => ({
  id: `help-bot-${messageSequence++}`,
  role,
  text,
  actions,
})

const getQuickActions = (token) =>
  token
    ? [
        { label: 'How to book', topic: 'booking' },
        { label: 'Open my appointments', to: '/my-appointments' },
        { label: 'How chats work', topic: 'chat' },
        { label: 'Open my chats', to: '/my-chats' },
      ]
    : [
        { label: 'How to book', topic: 'booking' },
        { label: 'Browse doctors', to: '/doctors' },
        { label: 'Why login first?', topic: 'login' },
        { label: 'How chats work', topic: 'chat' },
      ]

const buildWelcomeMessages = ({ token, userData, doctorsCount }) => {
  const firstName = userData?.name?.split(' ')[0]

  return [
    createMessage(
      'bot',
      firstName
        ? `Hi ${firstName}, I am Appointy Guide. I can help with booking appointments, finding doctors, and understanding patient chat.`
        : 'Hi, I am Appointy Guide. I can help with booking appointments, finding doctors, and understanding patient chat.',
      getQuickActions(token)
    ),
    createMessage(
      'bot',
      token
        ? 'You are signed in, so you can book an appointment right away. Once a booking is confirmed, a private chat thread becomes available in My Chats.'
        : `You can explore ${doctorsCount || 'our'} doctors without logging in. To confirm a slot, see My Appointments, or use doctor chat, sign in first.`
    ),
  ]
}

const detectTopic = (input) => {
  const value = input.toLowerCase()

  if (/chat|message|talk|conversation/.test(value)) {
    return 'chat'
  }

  if (/login|sign in|signup|sign up|register|account/.test(value)) {
    return 'login'
  }

  if (/appointment|book|booking|slot|schedule|reserve/.test(value)) {
    return 'booking'
  }

  if (/doctor|speciality|specialty|find/.test(value)) {
    return 'doctors'
  }

  if (/my appointment|status|cancel|paid|payment|history/.test(value)) {
    return 'appointments'
  }

  return 'overview'
}

const buildReply = ({
  topic,
  token,
  doctorsCount,
  unreadChatCount,
  pathname,
}) => {
  switch (topic) {
    case 'booking':
      if (token) {
        if (pathname.startsWith('/appointment/')) {
          return {
            text:
              'You are already on a doctor booking page.\n\n1. Review the doctor details.\n2. Choose an available day and time slot.\n3. Confirm the booking.\n4. The appointment will appear in My Appointments.\n5. After booking, the private doctor chat becomes available in My Chats.',
            actions: [
              { label: 'My appointments', to: '/my-appointments' },
              { label: 'How chats work', topic: 'chat' },
            ],
          }
        }

        return {
          text:
            'Here is the fastest way to book:\n\n1. Open the Doctors page.\n2. Choose a doctor card.\n3. Pick an available slot on the appointment page.\n4. Confirm the booking.\n5. Check My Appointments for the saved booking.\n\nAfter the booking is created, doctor chat unlocks automatically for that appointment.',
          actions: [
            { label: 'Browse doctors', to: '/doctors' },
            { label: 'My appointments', to: '/my-appointments' },
            { label: 'How chats work', topic: 'chat' },
          ],
        }
      }

      return {
        text:
          'Guests can browse doctors first, but booking needs a patient account.\n\n1. Open Doctors and choose a doctor.\n2. Create an account or log in.\n3. Return to the doctor page.\n4. Choose a slot and confirm the appointment.\n5. The booking will appear in My Appointments after login.',
        actions: [
          { label: 'Browse doctors', to: '/doctors' },
          { label: 'Create account', to: '/login' },
          { label: 'Why login first?', topic: 'login' },
        ],
      }

    case 'chat':
      if (token) {
        return {
          text:
            unreadChatCount > 0
              ? `Doctor chat opens only after an appointment is booked, and you already have ${unreadChatCount} unread chat message${unreadChatCount > 1 ? 's' : ''} waiting.\n\nOpen My Chats to reply in real time. Each booked appointment gets its own private thread, and if an appointment is cancelled, new chat messages are disabled for that thread.`
              : 'Doctor chat opens only after an appointment is booked.\n\n1. Book the doctor successfully.\n2. Open My Chats or open chat from My Appointments.\n3. Send messages in real time with the doctor.\n4. The doctor sees the same thread instantly.\n\nIf an appointment is cancelled, that chat thread becomes read-only for new messages.',
          actions: unreadChatCount > 0
            ? [
                { label: 'Open my chats', to: '/my-chats' },
                { label: 'My appointments', to: '/my-appointments' },
              ]
            : [
                { label: 'Book an appointment', topic: 'booking' },
                { label: 'Open my chats', to: '/my-chats' },
              ],
        }
      }

      return {
        text:
          'Guest users cannot chat with doctors yet.\n\nDoctor chat unlocks only after you:\n1. Create an account or log in.\n2. Book an appointment successfully.\n3. Open My Chats after the booking is saved.\n\nThat keeps each conversation private and linked to a real appointment.',
        actions: [
          { label: 'Create account', to: '/login' },
          { label: 'How to book', topic: 'booking' },
        ],
      }

    case 'login':
      return token
        ? {
            text:
              'You are already signed in. From here you can book appointments, open My Appointments, update your profile, and chat with doctors after booking.',
            actions: [
              { label: 'Browse doctors', to: '/doctors' },
              { label: 'My appointments', to: '/my-appointments' },
            ],
          }
        : {
            text:
              'Logging in unlocks the patient tools.\n\nAfter login you can:\n1. Confirm appointment bookings.\n2. See My Appointments.\n3. Edit your profile.\n4. Use doctor chat after a booking is created.\n\nYou can still browse doctors and specialties before logging in.',
            actions: [
              { label: 'Create account', to: '/login' },
              { label: 'Browse doctors', to: '/doctors' },
            ],
          }

    case 'appointments':
      return token
        ? {
            text:
              'My Appointments is your main status page. It shows booked visits, cancelled visits, payment state, and quick chat access for eligible appointments.',
            actions: [
              { label: 'Open my appointments', to: '/my-appointments' },
              { label: 'Open my chats', to: '/my-chats' },
            ],
          }
        : {
            text:
              'My Appointments becomes available after you log in and complete a booking. Until then, you can explore doctors and specialties from the public site.',
            actions: [
              { label: 'Create account', to: '/login' },
              { label: 'Browse doctors', to: '/doctors' },
            ],
          }

    case 'doctors':
      return {
        text:
          `You can browse ${doctorsCount || 'our'} listed doctors from the Doctors page. Use specialty pages to narrow the list, then open a doctor card to review experience, fees, and available booking slots.`,
        actions: [
          { label: 'Browse doctors', to: '/doctors' },
          { label: 'How to book', topic: 'booking' },
        ],
      }

    default:
      return {
        text:
          'I can help with three main things: booking appointments, explaining login requirements, and showing how doctor chat works after booking. Try one of the quick buttons below.',
        actions: getQuickActions(token),
      }
  }
}

const HelpBot = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, userData, unreadChatCount, doctors } = useContext(AppContext)
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState(() =>
    buildWelcomeMessages({
      token,
      userData,
      doctorsCount: doctors.length,
    })
  )
  const messagesEndRef = useRef(null)
  const authStateRef = useRef(token ? `signed-in-${userData?.name || ''}` : 'guest')

  useEffect(() => {
    if (localStorage.getItem(HELP_BOT_SEEN_KEY) === '1') {
      return undefined
    }

    const openTimer = window.setTimeout(() => {
      setIsOpen(true)
      localStorage.setItem(HELP_BOT_SEEN_KEY, '1')
    }, 900)

    return () => window.clearTimeout(openTimer)
  }, [])

  useEffect(() => {
    const nextAuthState = token ? `signed-in-${userData?.name || ''}` : 'guest'

    if (authStateRef.current !== nextAuthState) {
      setMessages(
        buildWelcomeMessages({
          token,
          userData,
          doctorsCount: doctors.length,
        })
      )
      authStateRef.current = nextAuthState
    }
  }, [token, userData, doctors.length])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages, isTyping, isOpen])

  const pushReply = (input, forcedTopic = '') => {
    const trimmedInput = input.trim()

    if (!trimmedInput) {
      return
    }

    const topic = forcedTopic || detectTopic(trimmedInput)

    setMessages((prev) => [...prev, createMessage('user', trimmedInput)])
    setDraft('')
    setIsTyping(true)

    window.setTimeout(() => {
      const reply = buildReply({
        topic,
        token,
        doctorsCount: doctors.length,
        unreadChatCount,
        pathname: location.pathname,
      })

      setMessages((prev) => [...prev, createMessage('bot', reply.text, reply.actions)])
      setIsTyping(false)
    }, 280)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    pushReply(draft)
  }

  const handleActionClick = (action) => {
    if (action.topic) {
      pushReply(action.label, action.topic)
      return
    }

    if (action.to) {
      setIsOpen(false)
      navigate(action.to)
    }
  }

  return (
    <div className='help-bot-shell'>
      {isOpen && (
        <section className='help-bot-card'>
          <div className='help-bot-head'>
            <div>
              <p className='help-bot-kicker'>Instant help</p>
              <h2 className='help-bot-title'>Appointy Guide</h2>
              <p className='help-bot-copy'>
                Booking steps, login help, and doctor chat guidance.
              </p>
            </div>
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='help-bot-close'
              aria-label='Close help bot'
            >
              x
            </button>
          </div>

          <div className='help-bot-messages'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`help-bot-row ${message.role === 'user' ? 'user' : 'bot'}`}
              >
                <div className={`help-bot-bubble ${message.role === 'user' ? 'user' : 'bot'}`}>
                  <p className='whitespace-pre-line text-sm leading-6'>{message.text}</p>
                  {!!message.actions?.length && (
                    <div className='help-bot-actions'>
                      {message.actions.map((action) => (
                        <button
                          key={`${message.id}-${action.label}`}
                          type='button'
                          onClick={() => handleActionClick(action)}
                          className='help-bot-action'
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className='help-bot-row bot'>
                <div className='help-bot-bubble bot help-bot-typing'>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className='help-bot-quick-actions'>
            {getQuickActions(token).map((action) => (
              <button
                key={`quick-${action.label}`}
                type='button'
                onClick={() => handleActionClick(action)}
                className='help-bot-chip'
              >
                {action.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className='help-bot-form'>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className='help-bot-input'
              placeholder='Ask how to book, log in, or chat with a doctor'
            />
            <button type='submit' className='help-bot-send'>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type='button'
        onClick={() => setIsOpen((prev) => !prev)}
        className='help-bot-launcher pulse-halo'
        aria-label='Open Appointy guide'
      >
        <span className='help-bot-launcher-mark'>AI</span>
        <span className='help-bot-launcher-copy'>
          Need help with appointments or chat?
        </span>
      </button>
    </div>
  )
}

export default HelpBot
