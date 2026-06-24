import { useState, useEffect } from 'react';
import { getSecrets, postSecret, reactSecret, deleteSecret } from '../api';
import { useAuth } from '../context/AuthContext';

const EMOJIS = ['🔥', '💀', '👀', '🌙', '✨', '🫣'];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Feed() {
  const { user } = useAuth();
  const [secrets, setSecrets]   = useState([]);
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [posting, setPosting]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    fetchSecrets();
  }, []);

  const fetchSecrets = async () => {
    try {
      const res = await getSecrets();
      setSecrets(res.data.secrets);
    } catch {
      setError('Failed to load secrets.');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const res = await postSecret(text);
      setSecrets(prev => [res.data.secret, ...prev]);
      setText('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post.');
    } finally {
      setPosting(false);
    }
  };

  const handleReact = async (id, emoji) => {
    try {
      const res = await reactSecret(id, emoji);
      setSecrets(prev =>
        prev.map(s => s.id === id
          ? { ...s, reactions: res.data.reactions, myReaction: res.data.myReaction }
          : s
        )
      );
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this secret?')) return;
    try {
      await deleteSecret(id);
      setSecrets(prev => prev.filter(s => s.id !== id));
    } catch {}
  };

  return (
    <div className="page-content">
      {/* Post box */}
      <div className="post-box">
        <form onSubmit={handlePost}>
          <textarea
            placeholder="Share a secret anonymously..."
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={280}
            rows={3}
          />
          <div className="post-box-footer">
            <span className="anon-badge">👻 Anonymous</span>
            <span className="char-count">{text.length}/280</span>
            <button className="btn-primary btn-sm" type="submit" disabled={posting || !text.trim()}>
              {posting ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="loading">Loading secrets...</div>
      ) : secrets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👻</div>
          <p>No secrets yet. Be the first!</p>
        </div>
      ) : (
        <div className="feed">
          {secrets.map(secret => (
            <div key={secret.id} className="secret-card">
              <p className="secret-text">{secret.text}</p>
              <div className="secret-footer">
                <span className="secret-time">{timeAgo(secret.createdAt)}</span>
                <div className="reactions">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      className={`react-btn ${secret.myReaction === emoji ? 'reacted' : ''}`}
                      onClick={() => handleReact(secret.id, emoji)}
                    >
                      {emoji}
                      {secret.reactions?.[emoji] > 0 && (
                        <span className="react-count">{secret.reactions[emoji]}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
