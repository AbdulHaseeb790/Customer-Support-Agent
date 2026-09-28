import { useState } from 'react'
import AdminPage from './pages/AdminPage'
import ChatPage from './pages/ChatPage'

function App() {
  const [page, setPage] = useState('chat')

  const nav = [
    { id: 'chat',   icon: '💬', label: 'Customer Chat' },
    { id: 'upload', icon: '⬆',  label: 'Admin Upload' },
  ]

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">✦</div>
          <div className="logo-text">Support<span>AI</span></div>
        </div>
        <nav className="nav">
          {nav.map(n => (
            <button
              key={n.id}
              className={`nav-item${page === n.id ? ' active' : ''}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" />
          <span className="status-text">Backend connected</span>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <span className="page-title">
            {page === 'chat' ? 'Customer Chat' : 'Admin — Upload Documents'}
          </span>
          <span className="badge">
            {page === 'chat' ? 'LangGraph + RAG' : 'Pinecone Index'}
          </span>
        </div>
        <div className="content">
          {page === 'chat' ? <ChatPage /> : <AdminPage />}
        </div>
      </div>
    </div>
  )
}

export default App