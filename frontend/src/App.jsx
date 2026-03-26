import { useState, useRef, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || '';

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function Loader() {
  return (
    <div className="professional-loader">
      <div className="loader-bar"></div>
      <div className="loader-bar"></div>
      <div className="loader-bar"></div>
    </div>
  );
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
        setErrorMsg(data.error || 'System Error');
      }
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setStatus('error');
      setErrorMsg(
        err.message === 'Failed to fetch'
          ? 'Connection to analytics engine failed. Ensure services are running.'
          : err.message
      );
    }
  };

  const canSubmit = file && email && status !== 'uploading';

  return (
    <div className="app fade-in">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div>
            <div className="navbar-title">Sales Intelligence Platform</div>
          </div>
        </div>
        <span className="navbar-badge pulse">System Operational</span>
      </nav>

      {/* Main */}
      <main className="main-content">
        <div className="hero slide-up">
          <div className="hero-icon-wrapper">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          </div>
          <h1>Sales Intelligence Platform</h1>
          <p>
            Upload datasets for automated, professional-grade executive analysis and distribution.
          </p>
        </div>

        <form className="upload-card slide-up-delay" onSubmit={handleSubmit}>
          {/* Dropzone */}
          <div
            className={`dropzone${dragOver ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            id="file-dropzone"
          >
            <div className="dropzone-icon">
              {file ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              )}
            </div>
            <div className="dropzone-text">
              {file ? 'Dataset ready — click to replace' : 'Drop dataset here or click to browse'}
            </div>
            <div className="dropzone-hint">Supported formats: .csv, .xlsx (Max 10MB)</div>
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
            <div className="file-info fade-in">
              <span className="file-info-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              </span>
              <span className="file-info-name">{file.name}</span>
              <span className="file-info-size">{formatFileSize(file.size)}</span>
              <button type="button" className="file-remove" onClick={removeFile} id="remove-file-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          )}

          {/* Email Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Recipient Email Address
            </label>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <input
                type="email"
                className="form-input with-icon"
                id="email-input"
                placeholder="executive@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`submit-btn ${status === 'uploading' ? 'processing' : ''}`}
            disabled={!canSubmit}
            id="submit-btn"
          >
            {status === 'uploading' ? (
              <span className="btn-content"><Loader /> Processing Analysis</span>
            ) : (
              'Run Analysis & Distribute'
            )}
          </button>

          {/* Status Feedback */}
          {status === 'uploading' && (
            <div className="status-container fade-in">
              <div className="status-card loading">
                <div className="status-content">
                  <div className="status-title">Executing Analysis Protocol</div>
                  <div className="status-message">
                    Processing may take up to 30 seconds depending on dataset complexity.
                  </div>
                  <div className="processing-steps">
                    <div className={`step ${processingStep >= 0 ? 'active' : ''} ${processingStep > 0 ? 'done' : ''}`}>
                      <div className="step-indicator"></div>
                      Parsing tabular data
                    </div>
                    <div className={`step ${processingStep >= 1 ? 'active' : ''} ${processingStep > 1 ? 'done' : ''}`}>
                      <div className="step-indicator"></div>
                      Synthesizing intelligence
                    </div>
                    <div className={`step ${processingStep >= 2 ? 'active' : ''} ${processingStep > 2 ? 'done' : ''}`}>
                      <div className="step-indicator"></div>
                      Dispatching report
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'success' && result && (
            <div className="status-container fade-in">
              <div className="status-card success">
                <div className="status-icon success-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div className="status-content">
                  <div className="status-title">Distribution Complete</div>
                  <div className="status-message">
                    Intelligence brief for <strong>{result.filename}</strong> dispatched. Analyzed <strong>{result.rows_analyzed}</strong> records
                    across <strong>{result.columns?.length}</strong> dimensions.
                  </div>
                  {result.summary_preview && (
                    <div className="summary-preview">
                      <div className="summary-preview-label">Executive Preview</div>
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
            <div className="status-container fade-in">
              <div className="status-card error">
                <div className="status-icon error-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                </div>
                <div className="status-content">
                  <div className="status-title">System Exception</div>
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
          Engineered by <a href="#" id="footer-link">Rabbitt AI Architecture</a> ·
          Powered by Advanced Analytics ·{' '}
          <span className="footer-version">v1.2.0</span> ·{' '}
          <a href={`${API_BASE}/docs`} target="_blank" rel="noreferrer" id="swagger-link">
            System Docs
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App
