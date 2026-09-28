import { useState } from 'react'
import axios from 'axios'

function ChatBox() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', text: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post('http://127.0.0.1:8000/chat/message', {
        message: input
      })

      const botMessage = {
        role: 'bot',
        text: response.data.reply,
        escalated: response.data.escalated
      }

      setMessages(prev => [...prev, botMessage])

    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Something went wrong. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Customer Support</h2>

      <div style={{ border: '1px solid #ccc', height: '400px', overflowY: 'auto', padding: '10px', marginBottom: '10px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '8px 0' }}>
            <span style={{
              background: msg.escalated ? '#ff4444' : msg.role === 'user' ? '#007bff' : '#f0f0f0',
              color: msg.role === 'user' || msg.escalated ? 'white' : 'black',
              padding: '8px 12px',
              borderRadius: '12px',
              display: 'inline-block'
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <p>Typing...</p>}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          style={{ flex: 1, padding: '8px' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} disabled={loading}>Send</button>
      </div>
    </div>
  )
}

export default ChatBox