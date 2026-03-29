# 🐰 Rabbitt AI — Sales Insight Automator v1.0.1

> Upload sales data (CSV/XLSX) → Get an AI-generated executive brief → Delivered to your inbox in seconds.

![Stack](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Stack](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Stack](https://img.shields.io/badge/Google%20Gemini-886FBF?style=for-the-badge&logo=googlegemini&logoColor=white)
![Stack](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Quick Start (Docker)](#-quick-start-docker-compose)
- [Local Development](#-local-development)
- [Security Overview](#-security-overview)
- [API Documentation](#-api-documentation)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)

---

## 🏗️ Architecture

```
┌─────────────────┐       ┌──────────────────────────────────┐
│   React SPA     │──────▶│        FastAPI Backend           │
│   (Vite)        │  API  │                                  │
│   Port: 3000    │◀──────│  ┌──────────┐  ┌─────────────┐  │
└─────────────────┘       │  │  Parser   │  │  AI Engine  │  │
                          │  │ (Pandas)  │  │  (Gemini)   │  │
                          │  └──────────┘  └─────────────┘  │
                          │  ┌──────────────────────────┐   │
                          │  │   Email Service (SMTP)    │   │
                          │  └──────────────────────────┘   │
                          │        Port: 8000               │
                          └──────────────────────────────────┘
```

**Flow:** Upload File → Parse Data (Pandas) → Generate Summary (Gemini AI) → Email Report (SMTP) → Return Preview

---

## 🚀 Quick Start (docker-compose)

### Prerequisites
- Docker & Docker Compose installed
- A Google Gemini API Key ([get one here](https://aistudio.google.com/apikey))
- SMTP credentials (Gmail App Password recommended)

### Steps

1. **Clone the repo:**
   ```bash
   git clone https://github.com/your-username/rabbit.ai.git
   cd rabbit.ai
   ```

2. **Configure environment:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your API keys and SMTP credentials
   ```

3. **Launch the stack:**
   ```bash
   docker-compose up --build
   ```

4. **Access the app:**
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

5. **Test the flow:**
   - Upload `data/sales_q1_2026.csv`
   - Enter a recipient email
   - Click "Generate & Send Report"
   - Check the inbox for the AI-generated brief

---

## 💻 Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
cp .env.example .env       # Configure your keys
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                # Starts on http://localhost:5173
```

> The Vite dev server proxies `/api` requests to `http://localhost:8000` automatically.

---

## 🔒 Security Overview

| Layer | Implementation | Details |
|-------|---------------|---------|
| **Authentication** | API Key (`X-API-Key` header) | Optional; toggle by setting `API_KEY` in `.env` |
| **Rate Limiting** | `slowapi` — 10 req/min per IP | Prevents abuse and resource exhaustion |
| **Input Validation** | Pydantic + custom validators | Email format validation, file type whitelist |
| **File Security** | Extension + size validation | Only `.csv`/`.xlsx`, max 10 MB, in-memory processing |
| **CORS** | Explicit origin allowlist | Only configured origins can access the API |
| **Container Security** | Non-root user | Backend runs as `appuser`, never as root |
| **Data Privacy** | No file persistence | Files are processed in-memory and never saved to disk |
| **Transport** | SMTP TLS | Email delivery uses STARTTLS encryption |

---

## 📚 API Documentation

Live Swagger UI is available at `/docs` when the backend is running.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check with config status |
| `POST` | `/api/v1/analyze` | Upload file + email → AI summary + email delivery |
| `GET` | `/docs` | Swagger UI (interactive) |
| `GET` | `/redoc` | ReDoc (alternative docs) |
| `GET` | `/openapi.json` | OpenAPI specification |

### Example cURL

```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "X-API-Key: your_api_key" \
  -F "file=@data/sales_q1_2026.csv" \
  -F "email=ceo@company.com"
```

---

## ⚙️ CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) triggers on:
- Pull Requests to `main`
- Pushes to `main`

### Pipeline Steps:
1. **Lint Backend** — Ruff (Python linter + formatter check)
2. **Lint Frontend** — ESLint (React/JSX rules)
3. **Build Docker** — Builds both images and validates backend health

---

## 🌍 Deployment

### Backend → Render
1. Connect GitHub repo to [Render](https://render.com)
2. Use the `render.yaml` blueprint for automatic setup
3. Set environment variables in the Render dashboard

### Frontend → Vercel
1. Import the `frontend/` directory in [Vercel](https://vercel.com)
2. Update `frontend/vercel.json` with your Render backend URL
3. Set `VITE_API_URL` if using a different backend URL

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `SMTP_HOST` | ✅ | SMTP server hostname |
| `SMTP_PORT` | ✅ | SMTP server port (default: 587) |
| `SMTP_USER` | ✅ | SMTP username/email |
| `SMTP_PASSWORD` | ✅ | SMTP password (App Password for Gmail) |
| `SMTP_FROM` | ✅ | Sender email address |
| `API_KEY` | ❌ | API key for endpoint protection (optional) |
| `CORS_ORIGINS` | ❌ | Comma-separated allowed origins |

See `backend/.env.example` for a complete template.

---

## 📁 Project Structure

```
rabbit.ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Environment configuration
│   │   ├── routers/
│   │   │   └── upload.py        # Upload & analyze endpoint
│   │   ├── services/
│   │   │   ├── parser.py        # CSV/XLSX data parser
│   │   │   ├── ai_engine.py     # Gemini AI integration
│   │   │   └── email_service.py # SMTP email delivery
│   │   └── middleware/
│   │       └── security.py      # API key auth & validation
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main SPA component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Premium design system
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json
│   └── package.json
├── data/
│   └── sales_q1_2026.csv        # Sample test data
├── docker-compose.yml
├── render.yaml
├── .github/workflows/ci.yml
├── .gitignore
└── README.md
```

---

## 📄 License

MIT — Built with ❤️ by Rabbitt AI Engineering
