// useState manages component state (selected file, status message)
import { useState } from 'react'

// axios sends HTTP requests to our FastAPI backend
import axios from 'axios'

function FileUpload() {

  // file — stores the selected file object
  const [file, setFile] = useState(null)

  // message — shows success or error after upload
  const [message, setMessage] = useState('')

  // loading — true while upload is in progress
  const [loading, setLoading] = useState(false)

  // called when user selects a file — stores it in state
  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  // called when user clicks Upload button
  const handleUpload = async () => {

    // if no file selected, show error
    if (!file) {
      setMessage('Please select a file first')
      return
    }

    // FormData is required to send files via HTTP
    const formData = new FormData()

    // append file to formData with key 'file' — must match FastAPI parameter name
    formData.append('file', file)

    // set loading to true while request is in progress
    setLoading(true)

    try {
      // POST request to our FastAPI upload endpoint
      const response = await axios.post('http://127.0.0.1:8000/upload/docs', formData)

      // show success message from backend
      setMessage(response.data.message)

    } catch (error) {
      // show error if upload fails
      setMessage('Upload failed. Please try again.')

    } finally {
      // always set loading back to false when done
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload Business Documents</h2>

      {/* File input — only accepts txt and pdf */}
      <input type="file" accept=".txt,.pdf" onChange={handleFileChange} />

      {/* Upload button — disabled while loading */}
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      {/* Show success or error message */}
      {message && <p>{message}</p>}
    </div>
  )
}

export default FileUpload