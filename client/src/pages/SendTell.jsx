import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { sendTell } from '../api';

export default function SendTell() {
  const { username }          = useParams();
  const [text, setText]       = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError('');
    try {
      await sendTell(username, text);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send. Try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">👻</div>
          <h2 className="auth-title">Sent!</h2>
          <p className="auth-sub">@{username} will never know it was you.</p>
          <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => { setText(''); setSent(false); }}>
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">👻</div>
        <h2 className="auth-title">Send to @{username}</h2>
        <p className="auth-sub">100% anonymous — they'll never know who sent it</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <textarea
              placeholder="Write something honest, kind, or curious..."
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={500}
              rows={4}
              required
              style={{ width: '100%', resize: 'none' }}
            />
            <span className="field-hint">{text.length}/500</span>
          </div>
          <button className="btn-primary" type="submit" disabled={sending || !text.trim()}>
            {sending ? 'Sending...' : '👻 Send anonymously'}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: '1rem' }}>
          <a href="/">Get your own Whispr link</a>
        </p>
      </div>
    </div>
  );
}
