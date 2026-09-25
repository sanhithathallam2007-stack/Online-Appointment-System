import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

const starterMessages = [
  {
    sender: 'assistant',
    text: 'Hello! I am the Appointment Assistant. Ask me how to book, cancel, reschedule, or browse categories.',
  },
]

const quickSuggestions = [
  'How to book?',
  'My appointments',
  'Cancel appointment',
  'Reschedule',
  'Categories',
  'Available slots',
  'Contact support',
]

const responseMap = [
  {
    keys: ['book', 'booking'],
    text: 'Login first, choose a category, select a professional, choose an available slot, and confirm your appointment.',
  },
  {
    keys: ['cancel'],
    text: 'Open My Appointments, find the appointment, and select Cancel if cancellation is available.',
  },
  {
    keys: ['reschedule'],
    text: 'Open My Appointments and select Reschedule for an eligible appointment.',
  },
  {
    keys: ['category', 'categories'],
    text: 'We currently support Hospitals, Schools, Government Offices, Business Services, Public Representatives, and Entertainment.',
  },
  {
    keys: ['appointment', 'appointments'],
    text: 'Open My Appointments from the navigation menu to see your upcoming and past bookings.',
  },
  {
    keys: ['slot', 'available'],
    text: 'Only available slots can be booked. Unavailable or expired slots are hidden from booking.',
  },
  {
    keys: ['pending'],
    text: 'A pending appointment has been booked and is waiting for provider action.',
  },
  {
    keys: ['who', 'use'],
    text: 'Users can book appointments through the supported categories and manage their appointments from My Appointments.',
  },
  {
    keys: ['support', 'help'],
    text: 'Please use the category flow, appointment management pages, or contact the system administrator for assistance.',
  },
]

function getAssistantReply(message) {
  const lowerText = String(message || '').toLowerCase()

  if (!lowerText.trim()) {
    return 'Please ask a question about booking, categories, appointments, or rescheduling.'
  }

  const matched = responseMap.find((entry) =>
    entry.keys.some((key) => lowerText.includes(key)),
  )

  if (matched) {
    return matched.text
  }

  return 'This is a demo AI assistant. You can ask about booking, categories, cancellation, rescheduling, or appointment status.'
}

function AiAssistant() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(starterMessages)
  const [input, setInput] = useState('')

  const hiddenRoutes = useMemo(
    () => ['/login', '/register', '/provider-login', '/provider-dashboard', '/admin-login', '/admin-dashboard', '/admin/users', '/admin/providers', '/admin/categories', '/admin/appointments', '/admin/schedules'],
    [],
  )

  if (hiddenRoutes.includes(location.pathname)) {
    return null
  }

  const handleSend = (text) => {
    const trimmed = String(text || '').trim()
    if (!trimmed) {
      return
    }

    const nextMessages = [
      ...messages,
      { sender: 'user', text: trimmed },
      { sender: 'assistant', text: getAssistantReply(trimmed) },
    ]

    setMessages(nextMessages)
    setInput('')
  }

  return (
    <div className="ai-assistant-shell">
      {open ? (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div>
              <strong>Appointment Assistant</strong>
              <small>Demo AI Assistant</small>
            </div>
            <button type="button" className="ai-close-btn" onClick={() => setOpen(false)} aria-label="Close assistant">
              ×
            </button>
          </div>

          <div className="ai-chat-body">
            {messages.map((message, index) => (
              <div key={`${message.sender}-${index}`} className={`ai-message ${message.sender}`}>
                {message.text}
              </div>
            ))}
          </div>

          <div className="ai-suggestions">
            {quickSuggestions.map((suggestion) => (
              <button key={suggestion} type="button" className="ai-suggest-btn" onClick={() => handleSend(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>

          <div className="ai-input-row">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSend(input)
                }
              }}
              placeholder="Ask the assistant..."
              aria-label="Chat message input"
            />
            <button type="button" className="primary-btn ai-send-btn" onClick={() => handleSend(input)}>
              Send
            </button>
          </div>
        </div>
      ) : null}

      <button type="button" className="ai-launch-btn" onClick={() => setOpen((previous) => !previous)}>
        AI Assistant
      </button>
    </div>
  )
}

export default AiAssistant
