import { useState, useRef, useEffect } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

const SUGGESTIONS = [
  'What is your return policy?',
  'How do I reset my password?',
  'Where is my order?',
  'How can I contact support?',
]

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q, time: now() }])
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(m => [...m, {
          role: 'bot',
          text: data.reply,
          time: now(),
          escalated: data.escalated || false,
        }])
      } else {
        setMessages(m => [...m, {
          role: 'bot',
          text: `⚠ Error: ${data.detail || 'Something went wrong.'}`,
          time: now(),
          error: true,
        }])
      }
    } catch (err) {
      setMessages(m => [...m, {
        role: 'bot',
        text: '⚠ Could not reach the backend. Is FastAPI running?',
        time: now(),
        error: true,
      }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="chat-wrap">
      <div className="messages">
        {messages.length === 0 && !loading && (
          <div className="empty-chat">
            <div className="empty-icon">💬</div>
            <div className="empty-title">Ask me anything</div>
            <div className="empty-sub">I'll answer from your uploaded documents, or escalate if I can't help.</div>
            <div className="suggestion-chips">
              {SUGGESTIONS.map(s => (
                <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className={`avatar ${msg.role}`}>
              {msg.role === 'bot' ? '🤖' : '👤'}
            </div>
            <div>
              <div className="bubble">{msg.text}</div>
              <div className="bubble-meta">
                <span>{msg.time}</span>
                {msg.escalated && <span className="escalated-tag">🔺 Escalated</span>}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message bot">
            <div className="avatar bot">🤖</div>
            <div className="bubble">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="input-bar">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Type your question…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          rows={1}
        />
        <button className="send-btn" onClick={() => send()} disabled={!input.trim() || loading}>
          ➤
        </button>
      </div>
    </div>
  )
}

export default ChatPage