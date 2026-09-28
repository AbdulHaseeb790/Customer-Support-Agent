import { useState, useRef, useEffect } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

function formatBytes(b) {
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / (1024 * 1024)).toFixed(1) + ' MB'
}

function AdminPage() {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([{ text: 'System ready. Select files to upload.', type: 'muted' }])
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 })
  const inputRef = useRef()
  const logRef = useRef()

  const addLog = (text, type = 'info') => setLogs(l => [...l, { text, type }])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  const onFiles = (incoming) => {
    const newFiles = Array.from(incoming).filter(f =>
      f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.name.endsWith('.txt') || f.name.endsWith('.md')
    )
    if (newFiles.length === 0) { addLog('Only PDF, TXT, and MD files are supported.', 'error'); return }
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      const unique = newFiles.filter(f => !names.has(f.name))
      addLog(`Added ${unique.length} file(s).`, 'info')
      return [...prev, ...unique]
    })
  }

  const removeFile = (name) => setFiles(f => f.filter(x => x.name !== name))

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    onFiles(e.dataTransfer.files)
  }

  const handleUpload = async () => {
    if (!files.length) return
    setLoading(true)
    let success = 0, failed = 0

    for (const file of files) {
      addLog(`Uploading ${file.name}…`, 'info')
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch(`${API_BASE}/upload/docs`, { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) {
          addLog(`✓ ${file.name} — ${data.message}`, 'success')
          success++
        } else {
          addLog(`✗ ${file.name} — ${data.detail || 'upload failed'}`, 'error')
          failed++
        }
      } catch (err) {
        addLog(`✗ ${file.name} — ${err.message}`, 'error')
        failed++
      }
    }

    setStats(s => ({ total: s.total + files.length, success: s.success + success, failed: s.failed + failed }))
    addLog(`Done. ${success} indexed, ${failed} failed.`, success > 0 ? 'success' : 'error')
    setLoading(false)
    if (success > 0) setFiles([])
  }

  return (
    <div>
      <div className="stats-row" style={{ maxWidth: 900, marginBottom: 24 }}>
        <div className="stat-box">
          <div className="stat-value violet">{stats.total}</div>
          <div className="stat-label">Total Uploaded</div>
        </div>
        <div className="stat-box">
          <div className="stat-value green">{stats.success}</div>
          <div className="stat-label">Indexed in Pinecone</div>
        </div>
        <div className="stat-box">
          <div className="stat-value cyan">{stats.failed}</div>
          <div className="stat-label">Failed</div>
        </div>
      </div>

      <div className="upload-grid">
        <div className="card">
          <div className="card-title">Upload Documents</div>
          <div
            className={`drop-zone${dragging ? ' drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
          >
            <input ref={inputRef} type="file" multiple accept=".pdf,.txt,.md" onChange={e => onFiles(e.target.files)} />
            <div className="drop-icon">📂</div>
            <div className="drop-label">{dragging ? 'Drop files here' : 'Click or drag files here'}</div>
            <div className="drop-sub">PDF, TXT, MD — multiple files supported</div>
          </div>

          {files.length > 0 && (
            <div className="file-list">
              {files.map(f => (
                <div className="file-item" key={f.name}>
                  <span className="file-icon">📄</span>
                  <span className="file-name">{f.name}</span>
                  <span className="file-size">{formatBytes(f.size)}</span>
                  <button className="file-remove" onClick={() => removeFile(f.name)}>×</button>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="progress-bar-wrap" style={{ marginTop: 14 }}>
              <div className="progress-bar" style={{ width: '60%' }} />
            </div>
          )}

          <button className="upload-btn" onClick={handleUpload} disabled={!files.length || loading}>
            {loading ? '⏳ Uploading…' : `⬆ Upload ${files.length > 0 ? files.length + ' file(s)' : 'Files'}`}
          </button>
        </div>

        <div className="card">
          <div className="card-title">Upload Log</div>
          <div className="upload-log" ref={logRef}>
            {logs.map((l, i) => (
              <span key={i} className={`log-line ${l.type}`}>
                {l.type === 'success' ? '✓' : l.type === 'error' ? '✗' : '›'} {l.text}{'\n'}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
            Files are chunked, embedded with HuggingFace <code style={{ fontFamily: 'var(--mono)', color: 'var(--cyan)' }}>all-MiniLM-L6-v2</code>, and stored in Pinecone.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminPage