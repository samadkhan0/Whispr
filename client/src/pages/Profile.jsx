import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendTell } from '../api';

export default function Profile() {
  const { user, logout }        = useAuth();
  const [copied, setCopied]     = useState(false);
  const [tellText, setTellText] = useState('');
  const [toUser, setToUser]     = useState('');
  const [sending, setSending]   = useState(false);
  const [tellMsg, setTellMsg]   = useState('');
  const [avatar, setAvatar]     = useState(localStorage.getItem('avatar_' + user.id) || null);
  const [bio, setBio]           = useState(localStorage.getItem('bio_' + user.id) || '');
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(bio);
  const fileRef                 = useRef();

  const myLink = `whispr.app/tell/${user.username}`;

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/tell/${user.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target.result);
      localStorage.setItem('avatar_' + user.id, ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const saveBio = () => {
    setBio(bioInput);
    localStorage.setItem('bio_' + user.id, bioInput);
    setEditingBio(false);
  };

  const handleSendTell = async (e) => {
    e.preventDefault();
    if (!toUser.trim() || !tellText.trim()) return;
    setSending(true);
    setTellMsg('');
    try {
      const username = toUser.replace('@', '').trim().toLowerCase();
      await sendTell(username, tellText);
      setTellMsg('✅ Tell sent anonymously!');
      setTellText('');
      setToUser('');
    } catch (err) {
      setTellMsg('❌ ' + (err.response?.data?.error || 'Failed to send.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-content">
      <div className="profile-card">
        <div className="avatar-wrap" onClick={() => fileRef.current.click()}>
          {avatar
            ? <img src={avatar} alt="avatar" className="profile-avatar-img" />
            : <div className="profile-avatar">{(user.displayName || user.username)[0].toUpperCase()}</div>
          }
          <div className="avatar-overlay">📷</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarChange} />
        </div>
        <div className="profile-info">
          <h2>{user.displayName || user.username}</h2>
          <p className="profile-handle">@{user.username}</p>
          {!editingBio
            ? <p className="profile-bio" onClick={() => setEditingBio(true)}>
                {bio || <span style={{ color:'var(--text-3)' }}>+ Add a bio</span>}
              </p>
            : <div className="bio-edit-row">
                <input value={bioInput} onChange={e => setBioInput(e.target.value)} placeholder="Short bio..." maxLength={100} autoFocus />
                <button className="btn-primary btn-sm" onClick={saveBio}>Save</button>
              </div>
          }
        </div>
        <button className="btn-outline btn-sm" onClick={logout}>Log out</button>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-num">{user.secretCount || 0}</span>
          <span className="stat-label">Secrets</span>
        </div>
        <div className="stat-box">
          <span className="stat-num">{user.tellCount || 0}</span>
          <span className="stat-label">Tells received</span>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">🔗 Your anonymous tell link</h3>
        <p className="section-sub">Share this — anyone can send you a tell anonymously</p>
        <div className="link-box">
          <span className="link-text">{myLink}</span>
          <button className={`btn-sm ${copied ? 'btn-success' : 'btn-outline'}`} onClick={copyLink}>
            {copied ? '✅ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">👻 Send an anonymous tell</h3>
        <p className="section-sub">They'll never know it was you</p>
        <form onSubmit={handleSendTell} className="tell-form">
          <input type="text" placeholder="@username" value={toUser} onChange={e => setToUser(e.target.value)} required />
          <textarea placeholder="Write something honest, kind, or curious..." value={tellText} onChange={e => setTellText(e.target.value)} maxLength={500} rows={3} required />
          <div className="tell-form-footer">
            <span className="char-count">{tellText.length}/500</span>
            <button className="btn-primary btn-sm" type="submit" disabled={sending}>
              {sending ? 'Sending...' : '👻 Send anonymously'}
            </button>
          </div>
        </form>
        {tellMsg && <p className="tell-result">{tellMsg}</p>}
      </div>
    </div>
  );
}