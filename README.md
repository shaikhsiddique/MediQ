# 🩺 GlukoBuddy — MediQ

> AI-Based Early Diabetes Risk Monitoring System for Children

**🏆 2nd Place — Hacknovate 2K26 | Smart Healthcare Domain**

---

## Overview

Most diabetes tools give parents a number and leave them confused. GlukoBuddy gives them context they can actually act on.

Instead of:
> *"Risk Score: 28%"*

GlukoBuddy explains:
> *"Recent glucose fluctuations combined with reduced sleep and energy levels may indicate early diabetic risk patterns. Monitoring sugar intake and maintaining insulin schedules is recommended."*

Built in 30 hours by a team of 4 during Hacknovate 2K26.

---

## Features

| Feature | Description |
|---|---|
| 🩺 AI Risk Prediction | Custom weighted scoring engine across glucose, BMI, sleep, stress, heredity |
| 🤖 Explainable AI Insights | LLM-generated health narratives via Ollama (llama3.2) |
| 📊 30-Day Trend Analysis | Monthly report summarization with risk trend detection |
| 🐶 KidsBuddy | Gamified questionnaire designed for children |
| 🍫 NutriFinder | Food label scanner for nutrition/sugar tracking |
| 📲 Guardian Alerts | Real-time SMS alerts to parents via Twilio on high risk |
| 👨‍⚕️ Doctor Dashboard | Separate role-based view for medical professionals |
| 💬 AI Chatbot | WebSocket-based healthcare chatbot with session memory & summarization |
| 📄 PDF Reports | Downloadable longitudinal health records |
| 🔍 OCR Lab Reports | Upload PDFs or images — text extracted via Tesseract.js |
| 🌐 Multilingual | Marathi locale support built in |
| ⏰ Insulin Reminders | Scheduled medication alerts |

---

## Tech Stack

**Frontend**
- React + Vite + Tailwind CSS
- Context API (Auth, Theme, Language)
- Socket.io client for real-time chat

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io for WebSocket chat
- JWT + bcrypt for auth
- Joi for request validation
- Multer for file uploads
- Tesseract.js + pdf-parse for OCR
- Twilio for SMS alerts
- node-cron for scheduled reminders

**AI Layer**
- Ollama (local LLM inference)
- Model: `llama3.2:1b`
- Used for: risk analysis, chatbot replies, chat summarization, monthly report summaries

---

## Architecture

```
React Client
    │
    ├── WebSocket ──────► Socket.io (Chat + Live Monitoring)
    │
    └── REST API ───────► Express Server
                              │
                 ┌────────────┼────────────┐
                 │            │            │
              MongoDB      Ollama      Twilio
            (Health DB)  (LLM Layer)  (SMS Alerts)
                              │
                         Tesseract.js
                         (OCR Engine)
```

---

## Local Setup

> ⚠️ This project runs a local LLM via Ollama and is not deployed.

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- [Ollama](https://ollama.com) installed with `llama3.2:1b` pulled

```bash
ollama pull llama3.2:1b
```

### Installation

```bash
# Clone
git clone https://github.com/shaikhsiddique/MediQ
cd MediQ

# Backend
cd Backend
npm install
cp .env.example .env
# Fill in your values
npm run dev

# Frontend
cd ../Frontend
npm install
npm run dev
```

### Environment Variables

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/mediq
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
API_PUBLIC_URL=http://localhost:4000

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b

# Twilio (optional — for SMS alerts)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
PARENT_PHONE_NUMBER=
```

---

## Team

| Name | Profile |
|---|---|
| Siddique Shaikh | [@shaikhsiddique](https://github.com/shaikhsiddique) |
| Omkar Ghorpade | [LinkedIn](https://www.linkedin.com/in/omkar-ghorpade-90a4702b3/) | [@Omkar Ghorpade](https://github.com/ThomasOOO7) |
| Sai Jadhav | [LinkedIn](https://www.linkedin.com/in/sai-jadhav-8b9b54324/) |
| Yash Jagdale | [LinkedIn](https://www.linkedin.com/in/yash-jagdale-7a79ab287/) |

---

## Hackathon

- **Event:** Hacknovate 2K26
- **Domain:** Smart Healthcare
- **Duration:** 30 hours
- **Result:** 🥈 2nd Place

---

## License

MIT
