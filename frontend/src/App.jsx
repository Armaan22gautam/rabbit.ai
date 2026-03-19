import { useState, useRef, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || '';

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function App() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const validateAndSetFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx'].includes(ext)) {
      setErrorMsg('Please upload a .csv or .xlsx file');
      setStatus('error');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrorMsg('File size must be under 10 MB');
      setStatus('error');
      return;
    }
    setFile(f);
    setStatus('idle');
    setErrorMsg('');
    setResult(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) validateAndSetFile(e.target.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !email) return;

    setStatus('uploading');
    setResult(null);
    setErrorMsg('');
    setProcessingStep(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);

    // Simulate processing steps
    const stepTimer1 = setTimeout(() => setProcessingStep(1), 1200);
    const stepTimer2 = setTimeout(() => setProcessingStep(2), 3500);

    try {
      const response = await fetch(`${API_BASE}/api/v1/analyze`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (data.success) {
        setProcessingStep(3);
        setStatus('success');
        setResult(data);
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong');
      }
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setStatus('error');
      setErrorMsg(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to server. Make sure the backend is running on port 8000.'
          : err.message
      );
    }
  };

  const canSubmit = file && email && status !== 'uploading';

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">R</div>
          <div>
            <div className="navbar-title">Rabbitt AI</div>
            <div className="navbar-subtitle">Sales Insight Automator Pro</div>
          </div>
        </div>
        <span className="navbar-badge">● Online</span>
      </nav>

      {/* Main */}
      <main className="main-content">
        <div className="hero">
          <span className="hero-icon">📊</span>
          <h1>Sales Insight Automator Pro</h1>
          <p>
            Upload your sales data and receive an AI-powered executive brief
            delivered directly to your inbox within seconds.
          </p>
        </div>

        <form className="upload-card" onSubmit={handleSubmit}>
          {/* Dropzone */}
          <div
            className={`dropzone${dragOver ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            id="file-dropzone"
          >
            <span className="dropzone-icon">{file ? '✅' : '📁'}</span>
            <div className="dropzone-text">
              {file ? 'File ready — click to change' : 'Drop your file here or click to browse'}
            </div>
            <div className="dropzone-hint">Supports .csv and .xlsx · Max 10 MB</div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.xlsx"
              id="file-input"
            />
          </div>

          {/* File Info */}
          {file && (
            <div className="file-info">
              <span className="file-info-icon">📄</span>
              <span className="file-info-name">{file.name}</span>
              <span className="file-info-size">{formatFileSize(file.size)}</span>
              <button type="button" className="file-remove" onClick={removeFile} id="remove-file-btn">
                ✕
              </button>
            </div>
          )}

          {/* Email Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              📧 Recipient Email
            </label>
            <input
              type="email"
              className="form-input"
              id="email-input"
              placeholder="executive@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="submit-btn"
            disabled={!canSubmit}
            id="submit-btn"
          >
            {status === 'uploading' ? '⏳ Generating Report...' : '🚀 Generate & Send Report'}
          </button>

          {/* Status Feedback */}
          {status === 'uploading' && (
            <div className="status-container">
              <div className="status-card loading">
                <div className="spinner" />
                <div className="status-content">
                  <div className="status-title">Analyzing your data...</div>
                  <div className="status-message">
                    This may take 15–30 seconds depending on file size.
                  </div>
                  <div className="processing-steps">
                    <div className={`step ${processingStep >= 0 ? 'active' : ''} ${processingStep > 0 ? 'done' : ''}`}>
                      <span className="step-indicator" />
                      Parsing data file...
                    </div>
                    <div className={`step ${processingStep >= 1 ? 'active' : ''} ${processingStep > 1 ? 'done' : ''}`}>
                      <span className="step-indicator" />
                      Generating AI summary...
                    </div>
                    <div className={`step ${processingStep >= 2 ? 'active' : ''} ${processingStep > 2 ? 'done' : ''}`}>
                      <span className="step-indicator" />
                      Sending email report...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'success' && result && (
            <div className="status-container">
              <div className="status-card success">
                <span className="status-icon">✅</span>
                <div className="status-content">
                  <div className="status-title">Report Sent Successfully!</div>
                  <div className="status-message">
                    The executive brief for <strong>{result.filename}</strong> has been
                    sent. Analyzed <strong>{result.rows_analyzed}</strong> rows
                    across <strong>{result.columns?.length}</strong> columns.
                    Check your inbox!
                  </div>
                  {result.summary_preview && (
                    <div className="summary-preview">
                      <div className="summary-preview-label">Summary Preview</div>
                      <div
                        className="summary-preview-content"
                        dangerouslySetInnerHTML={{ __html: result.summary_preview }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="status-container">
              <div className="status-card error">
                <span className="status-icon">❌</span>
                <div className="status-content">
                  <div className="status-title">Something went wrong</div>
                  <div className="status-message">{errorMsg}</div>
                </div>
              </div>
            </div>
          )}
        </form>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          Built with ❤️ by <a href="#" id="footer-link">Rabbitt AI Engineering</a> ·
          Powered by Google Gemini ·{' '}
          <a href={`${API_BASE}/docs`} target="_blank" rel="noreferrer" id="swagger-link">
            API Docs ↗
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App
