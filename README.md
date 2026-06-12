# 🧠 LearnAI — AI-Powered Learning Chat App

A full-stack mobile-first learning app powered by Claude AI. Users can chat to learn any topic, take quizzes, track progress, upload images for analysis, and download study materials.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | Register / Login with JWT tokens |
| 💬 AI Chat | Claude-powered tutor for any subject |
| 🖼️ Image Upload | Upload images and ask questions about them |
| 🎯 Quizzes | Auto-generated multiple-choice questions |
| 📊 Progress | Track scores per topic with visual rings |
| 📥 Downloads | Generate Study Guide, Flashcards, Notes, Quiz PDF |
| 🖼️ Image Gallery | Auto-shows related topic images |
| 📱 Mobile-first | Works on all phones via browser |

---

## 📁 File Structure

```
learnai/
├── backend/                    # Node.js + Express API
│   ├── server.js               # Entry point
│   ├── package.json
│   ├── .env.example            # Copy to .env and fill in keys
│   ├── routes/
│   │   ├── auth.js             # /api/auth — register, login, me
│   │   ├── chat.js             # /api/chat — sessions, messages (with image)
│   │   ├── progress.js         # /api/progress — quiz results, tracking
│   │   └── download.js         # /api/download — generate materials
│   ├── middleware/
│   │   └── auth.js             # JWT validation middleware
│   └── models/
│       └── store.js            # In-memory data store (no DB needed)
│
├── frontend/                   # React app
│   ├── public/
│   │   └── index.html          # Mobile-ready HTML shell
│   ├── src/
│   │   ├── index.js            # React entry
│   │   ├── App.js              # Router + auth guards
│   │   ├── index.css           # Global styles (mobile-first)
│   │   ├── context/
│   │   │   └── AuthContext.js  # Global auth state
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── ChatPage.js     # Main AI chat interface
│   │   │   ├── DashboardPage.js
│   │   │   └── ProgressPage.js
│   │   └── components/
│   │       ├── Layout.js       # Shell + bottom nav
│   │       ├── QuizCard.js     # Interactive MCQ quiz
│   │       ├── DownloadPanel.js # Download materials UI
│   │       └── ImageGallery.js  # Topic image display
│   └── package.json
│
├── package.json                # Root scripts
├── render.yaml                 # Render.com backend deploy
├── vercel.json                 # Vercel frontend deploy
└── .gitignore
```

---

## 🚀 Run on Your Laptop (Step by Step)

### Step 1 — Install Node.js

Download and install from: https://nodejs.org (choose LTS version)

Verify:
```bash
node --version    # should show v18+ or v20+
npm --version     # should show 9+
```

### Step 2 — Get an Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click "API Keys" → "Create Key"
4. Copy the key (starts with `sk-ant-...`)

### Step 3 — Set Up the Backend

```bash
# Navigate to backend folder
cd learnai/backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Now open `backend/.env` in any text editor and fill in:
```
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=any_long_random_string_like_this_abc123xyz789
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
# You should see: "LearnAI Backend running on port 5000"
```

### Step 4 — Set Up the Frontend

Open a **new terminal window**:

```bash
# Navigate to frontend folder
cd learnai/frontend

# Install dependencies
npm install

# Start the frontend
npm start
# Browser opens automatically at http://localhost:3000
```

### Step 5 — Use the App

1. Go to http://localhost:3000
2. Click "Create Account" and register
3. Start chatting to learn anything!

---

## 📱 Access on Your Phone (Same WiFi)

While both servers are running:

1. Find your laptop's IP:
   - **Windows:** Open Command Prompt → type `ipconfig` → find "IPv4 Address"
   - **Mac:** System Preferences → Network → find IP (like `192.168.1.5`)

2. On your phone, open browser and go to:
   ```
   http://192.168.1.5:3000
   ```
   (replace with your laptop's actual IP)

3. Works like an app! On iPhone/Android, tap **"Add to Home Screen"** for an app-like experience.

---

## 🌐 Deploy to the Internet (Free)

### Deploy Backend → Render.com (Free)

1. Push your code to GitHub
2. Go to https://render.com and sign up
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
6. Add Environment Variables:
   - `ANTHROPIC_API_KEY` = your key
   - `JWT_SECRET` = any 32+ char random string
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = your Vercel URL (add after frontend deploy)
7. Click **Deploy**
8. Copy the URL (like `https://learnai-backend.onrender.com`)

### Deploy Frontend → Vercel (Free)

1. Go to https://vercel.com and sign up
2. Click "New Project" → Import GitHub repo
3. Set:
   - **Root Directory:** `frontend`
   - **Framework:** Create React App
4. Add Environment Variable:
   - `REACT_APP_API_URL` = your Render backend URL
5. Click **Deploy**
6. Copy the Vercel URL

### Final Step

Go back to Render → your backend service → Environment Variables → update `FRONTEND_URL` to your Vercel URL.

**Your app is now live and works on any phone worldwide! 🎉**

---

## 🧪 How to Test the App

1. Register a new account
2. Type: *"Teach me about the solar system"*
3. The AI will explain and show a quiz question
4. Answer the quiz → see your score update
5. Tap "Download study materials"
6. Go to Progress tab to see your learning stats
7. Tap 🖼️ to upload a photo and ask about it

---

## 🔧 Customization Tips

| What | Where |
|---|---|
| Change AI personality | `backend/routes/chat.js` → `buildSystemPrompt()` |
| Add more quiz types | `backend/routes/download.js` → `typePrompts` |
| Change colors/theme | `frontend/src/index.css` → `:root` CSS variables |
| Add more pages | `frontend/src/pages/` + route in `App.js` |
| Use a real database | Replace `backend/models/store.js` with MongoDB/Postgres |

---

## ❓ Common Issues

**"Cannot connect to API"** → Make sure backend is running on port 5000

**"Invalid API key"** → Check your `.env` file has the correct `ANTHROPIC_API_KEY`

**"CORS error"** → Check `FRONTEND_URL` in backend `.env` matches your frontend URL

**Phone can't connect** → Make sure both devices are on the same WiFi network

**Image upload fails** → Check file is JPG/PNG and under 10MB
