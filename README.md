# 🏛️ AI Museum Guide - Professional Full Stack Application

An intelligent museum guide application providing comprehensive historical information about worldwide history, artifacts, exhibits, and historical topics. Features a modern React frontend with a powerful Python Flask backend powered by Google Gemini AI.

---

## ✨ Features

- 🤖 **AI-Powered Responses**: Uses Google Gemini AI for intelligent historical information
- 🌍 **Worldwide History Coverage**: Comprehensive global historical knowledge
- 🔍 **Smart Search Integration**: Wikipedia search for enhanced context
- 🖼️ **Visual Learning**: Automatic historical image integration
- 🌐 **Multi-Language Support**: Real-time translation to 18+ languages
- 📝 **Smart Summarization**: AI-powered content summarization
- 📱 **Responsive Design**: Modern, mobile-first interface
- ⚡ **Production Ready**: Robust error handling and professional UX

---

## 🏗️ Architecture

```
AI Museum Guide/
├── backend/                 # Python Flask API
│   ├── app.py              # Main Flask application
│   └── requirements.txt    # Python dependencies
├── frontend/               # React.js Application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── styles/        # CSS styling
│   │   ├── utils/         # API utilities
│   │   └── App.js         # Main component
│   └── package.json       # Node.js dependencies
├── data/                  # Vector database storage
└── start.bat             # Quick startup script
```

## 🚀 Quick Start

### Option 1: One-Click Start (Recommended)
```bash
# Double-click start.bat in Windows Explorer
# OR run from command prompt:
start.bat
```

### Option 2: Manual Setup

**Prerequisites:**
- Python 3.8+ installed
- Node.js 16+ installed  
- Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))

**Backend Setup:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Frontend Setup:**
```bash
# In a new terminal
cd frontend
npm install
npm start
```

## 🌐 Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 🔑 Configuration

1. **Launch the application** at http://localhost:3000
2. **Click "Configure API"** in the top-right corner
3. **Enter your Google Gemini API key**
4. **Start exploring world history!**

## 📖 Usage Guide

### Quick Questions
- Click on any pre-defined topic card for instant historical insights
- Topics include Ancient Rome, Egypt, Medieval Europe, Renaissance, and more

### Custom Questions  
- Type any historical question in the search box
- Ask about specific dates, people, events, or civilizations
- Examples:
  - "Tell me about the Roman Empire"
  - "What caused World War I?"
  - "Describe the Renaissance period"

### Advanced Features
- **Translation**: Convert responses to 18+ languages
- **Summarization**: Get concise summaries of detailed content
- **Visual Learning**: Automatic Wikipedia image integration

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | System health status |
| POST | `/configure` | Configure Gemini API key |
| POST | `/ask` | Submit historical questions |
| POST | `/translate` | Translate responses |
| POST | `/summarize` | Generate summaries |

## 🎨 Design Philosophy

**Professional Medium-Tone Color Palette:**
- Primary: Sophisticated blues (#3b82f6 to #1d4ed8)
- Secondary: Elegant purples (#a855f7 to #7c3aed)  
- Accent: Warm oranges (#f97316 to #c2410c)
- Neutrals: Professional grays (#f8fafc to #0f172a)

**Modern UI/UX Features:**
- Framer Motion animations for smooth interactions
- Lucide React icons for consistent iconography
- Responsive grid layouts with mobile-first approach
- Professional shadows and gradients
- Accessible color contrasts and typography

## 🚨 Troubleshooting

**Common Issues:**

❌ **"API Key not configured"**
- Enter your Gemini API key via the Configure API button
- Verify the key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)

❌ **"Server not responding"**  
- Ensure backend server is running on port 5000
- Check that Python dependencies are installed

❌ **"Frontend not loading"**
- Verify Node.js dependencies: `npm install`
- Ensure port 3000 is available

## 🌟 Production Features

- **Automatic Model Detection**: Tries multiple Gemini models for compatibility
- **Graceful Fallback**: Wikipedia integration when AI is unavailable
- **Error Boundaries**: User-friendly error messages
- **Performance Optimized**: Lazy loading and efficient API calls
- **Professional Logging**: Comprehensive request/response tracking
- **Security**: API key encryption and secure storage

## 💻 Development

**Tech Stack:**
- **Frontend**: React 18, Framer Motion, Lucide React, Axios
- **Backend**: Flask, Google Generative AI, LangChain, FAISS
- **Styling**: Custom CSS with CSS Variables, Modern Design System
- **APIs**: Google Gemini AI, Wikipedia REST API

## 📄 License

This project is licensed under the MIT License.

---

**🎯 Built for history enthusiasts, students, educators, and curious minds worldwide**
