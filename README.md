# 👻 Whispr

> Share secrets anonymously. Receive anonymous tells. No one knows who you are.

![Whispr](https://img.shields.io/badge/version-1.0.0-7F77DD?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)
![SQLite](https://img.shields.io/badge/SQLite-sql.js-003B57?style=flat-square&logo=sqlite)

---

## ✨ Features

- 👻 **Anonymous Secrets Feed** — Post secrets that show up publicly but never reveal who you are
- 📩 **Anonymous Tells** — Share a personal link and receive honest, anonymous messages
- 🔥 **Emoji Reactions** — React to secrets with 🔥 💀 👀 🌙 ✨ 🫣
- 🌙 **Dark Mode** — Toggle between light and dark theme
- 📝 **Private Notes** — Add personal notes to tells only you can see
- 📷 **Profile Picture** — Upload a custom avatar
- ✏️ **Bio Editing** — Add a short bio to your profile
- 🔔 **Live Inbox Badge** — Auto-updates every 30 seconds
- 🔒 **JWT Authentication** — Secure login and registration
- 🗄️ **SQLite Database** — No external database needed

---

## 🛠 Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | React 18 + Vite     |
| Routing   | React Router v6     |
| HTTP      | Axios               |
| Backend   | Node.js + Express   |
| Database  | SQLite via sql.js   |
| Auth      | JWT + bcryptjs      |
| Styling   | Custom CSS (no framework) |

---

## 📁 Project Structure

```
whispr/
├── server/                  # Node.js backend
│   ├── db.js                # SQLite database setup
│   ├── index.js             # Express server entry point
│   ├── middleware/
│   │   └── auth.js          # JWT auth middleware
│   └── routes/
│       ├── auth.js          # Register & login
│       ├── secrets.js       # Secrets CRUD + reactions
│       └── tells.js         # Anonymous tells
│
└── client/                  # React frontend
    └── src/
        ├── api/
        │   └── index.js     # All API calls
        ├── components/
        │   └── Navbar.jsx   # Navigation + dark mode toggle
        ├── context/
        │   ├── AuthContext.jsx   # Global auth state
        │   └── ThemeContext.jsx  # Dark/light theme
        ├── pages/
        │   ├── Feed.jsx     # Public secrets feed
        │   ├── Inbox.jsx    # Anonymous tells inbox
        │   ├── Login.jsx    # Login page
        │   ├── Profile.jsx  # Profile + send tell
        │   ├── Register.jsx # Register page
        │   └── SendTell.jsx # Public page to send a tell
        ├── App.jsx          # Routes setup
        ├── index.css        # All styles
        └── main.jsx         # React entry point
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org) v18 or higher
- npm (comes with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/whispr.git
cd whispr
```

### 2. Set up the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:

```env
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:5173
PORT=5000
```

Start the server:

```bash
npm run dev
```

You should see:
```
✅ SQLite database ready (whispr.db)
🚀 Server running on http://localhost:5000
```

### 3. Set up the Frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Open your browser at **http://localhost:5173**

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET  | `/api/auth/me` | Get current user |

### Secrets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/secrets` | Get all secrets (feed) |
| POST   | `/api/secrets` | Post a new secret |
| POST   | `/api/secrets/:id/react` | React with emoji |
| DELETE | `/api/secrets/:id` | Delete your secret |

### Tells
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/tells/inbox` | Get your inbox |
| POST   | `/api/tells/:username` | Send anonymous tell |
| PATCH  | `/api/tells/:id/read` | Mark tell as read |
| DELETE | `/api/tells/:id` | Delete a tell |

---

## 🔒 Privacy & Anonymity

- **Secrets** — The author's identity is stored in the database only to allow deletion. It is **never sent to the client or other users**.
- **Tells** — The sender is **never stored anywhere**. Once a tell is sent, there is absolutely no way to trace it back to the sender.

---

## 🌍 Deployment


## 📸 Screenshots

> Feed, Inbox, and Profile pages with dark mode support

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

MIT License — feel free to use this project however you like.

---

## 👨‍💻 Author

Built with ❤️ by **Abdul Samad Khan**

> *"The truth is rarely pure and never simple."* — Oscar Wilde
