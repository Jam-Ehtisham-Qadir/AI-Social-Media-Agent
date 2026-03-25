# ✦ AI Social Media Agent

A production-ready AI agent that researches any topic on the web and generates platform-perfect social media posts for LinkedIn, Twitter/X, and Instagram — with optional image and video analysis via GPT-4o Vision.

![AI Agent](https://img.shields.io/badge/AI-Social%20Media%20Agent-f472b6?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai)

---

## ✨ Features

- 🔍 **Web Research** — Serper API searches the web for latest info on any topic
- 🤖 **AI Post Generation** — GPT-4o writes SEO-optimized posts for 3 platforms
- 🖼️ **Image Analysis** — GPT-4o Vision analyzes attached images for context
- 🎬 **Video Analysis** — Extracts frames from video and analyzes with GPT-4o Vision
- 📋 **One-click Copy** — Copy any post instantly to clipboard
- 🎨 **Sidebar Layout** — Clean professional UI with Pink & Purple theme

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Backend | Python, Flask |
| AI Model | OpenAI GPT-4o |
| Vision | GPT-4o Vision API |
| Web Search | Serper API |
| Video Processing | OpenCV |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key (with GPT-4o access)
- Serper API key (free at serper.dev)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ai-social-media-agent.git
cd ai-social-media-agent
```

### 2. Backend Setup
```bash
python -m venv venv
venv\Scripts\activate        # Windows
pip install flask flask-cors python-dotenv openai requests opencv-python
```

Create a `.env` file in the root:
```
OPENAI_API_KEY=your_openai_api_key_here
SERPER_API_KEY=your_serper_api_key_here
```

Run the backend:
```bash
python backend/app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app
Visit `http://localhost:5173`

---

## 💡 How It Works

1. **Topic Input** — User enters a topic and optionally attaches an image or video
2. **Web Research** — Serper API fetches top 5 search results for the topic
3. **Media Analysis** — GPT-4o Vision analyzes attached image or video frames
4. **Post Generation** — GPT-4o combines research + media context to write posts
5. **Platform Formatting** — Each post follows strict rules for LinkedIn, Twitter/X, Instagram

---

## 📁 Project Structure
```
ai-social-media-agent/
├── backend/
│   └── app.py              # Flask API with agent pipeline
├── frontend/
│   ├── src/
│   │   └── App.jsx         # React UI with sidebar layout
│   └── index.html
├── .env                    # API keys (not committed)
└── README.md
```

---

## 👤 Author

**Jam Ehtisham Qadir** — Python Developer & AI/ML Engineer  
[LinkedIn](https://www.linkedin.com/in/jam-ehtisham-qadir-aaa691243)

---

## 📄 License

MIT License