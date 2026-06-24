import { useState, useEffect } from 'react';
import { getInbox, markRead, deleteTell } from '../api';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function TellCard({ tell, onDelete, onRead }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [note, setNote] = useState(
    JSON.parse(localStorage.getItem(`reply_${tell.id}`) || 'null')
  );

  const handleRead = () => { if (!tell.isRead) onRead(tell.id); };

  const saveNote = () => {
    if (!replyText.trim()) return;
    localStorage.setItem(`reply_${tell.id}`, JSON.stringify(replyText));
    setNote(replyText);
    setReplyText('');
    setShowReply(false);
  };

  return (
    <div className={`tell-card ${!tell.isRead ? 'unread' : ''}`} onClick={handleRead}>
      {!tell.isRead && <span className="new-dot" />}
      <p className="tell-text">{tell.text}</p>
      {note && (
        <div className="reply-shown">
          <strong>📝 Your note:</strong> {note}
        </div>
      )}
      <div className="tell-footer">
        <span className="anon-label">👻 Anonymous · {timeAgo(tell.createdAt)}</span>
        <div className="tell-actions" onClick={e => e.stopPropagation()}>
          <button className="btn-outline btn-sm" onClick={() => setShowReply(r => !r)}>
            {showReply ? 'Cancel' : '📝 Note'}
          </button>
          <button className="delete-btn" onClick={() => onDelete(tell.id)}>🗑</button>
        </div>
      </div>
      {showReply && (
        <div className="reply-box" onClick={e => e.stopPropagation()}>
          <textarea
            placeholder="Write a private note about this tell..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            rows={2}
            maxLength={300}
          />
          <div className="reply-box-footer">
            <button className="btn-primary btn-sm" onClick={saveNote}>Save note</button>
          </div>
          <p className="reply-note">🔒 Only you can see this — saved on your device</p>
        </div>
      )}
    </div>
  );
}

export default function Inbox() {
  const [tells, setTells]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => { fetchInbox(); }, []);

  const fetchInbox = async () => {
    try {
      const res = await getInbox();
      setTells(res.data.tells);
    } catch {
      setError('Failed to load inbox.');
    } finally {
      setLoading(false);
    }
  };

  const handleRead  = async (id) => {
    try {
      await markRead(id);
      setTells(prev => prev.map(t => t.id === id ? { ...t, isRead: 1 } : t));
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tell?')) return;
    try {
      await deleteTell(id);
      setTells(prev => prev.filter(t => t.id !== id));
    } catch {}
  };

  const unreadCount = tells.filter(t => !t.isRead).length;

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Inbox {unreadCount > 0 && <span className="badge">{unreadCount} new</span>}</h2>
        <p className="page-sub">Anonymous messages sent to you</p>
      </div>
      {error && <div className="error-box">{error}</div>}
      {loading ? (
        <div className="loading">Loading inbox...</div>
      ) : tells.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No tells yet.</p>
          <p className="empty-sub">Share your link to receive anonymous messages!</p>
        </div>
      ) : (
        <div className="feed">
          {tells.map(tell => (
            <TellCard key={tell.id} tell={tell} onDelete={handleDelete} onRead={handleRead} />
          ))}
        </div>
      )}
    </div>
  );
}