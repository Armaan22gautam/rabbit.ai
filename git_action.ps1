Set-Location -Path "d:\rabbit.ai"

# Initialize git repository
git init

# Ensure user identity is set (fallback just in case)
$userName = git config user.name
if (-not $userName) { git config user.name "Armaan Gautam" }
$userEmail = git config user.email
if (-not $userEmail) { git config user.email "armaangautam001@gmail.com" }

# Commit 1
git add README.md .gitignore
git commit -m "docs: Initial commit with project setup and documentation"

# Commit 2
git add data/
git commit -m "test: Add reference quarter sales dataset for local testing"

# Commit 3
git add backend/requirements.txt backend/.env.example backend/app/__init__.py backend/app/routers/__init__.py backend/app/services/__init__.py backend/app/middleware/__init__.py
git commit -m "chore(backend): Initialize FastAPI application structure and dependencies"

# Commit 4
git add backend/app/config.py backend/app/middleware/security.py
git commit -m "feat(backend): Implement application configuration and security middleware"

# Commit 5
git add backend/app/services/parser.py
git commit -m "feat(backend): Add Pandas data parser for Excel and CSVs"

# Commit 6
git add backend/app/services/ai_engine.py
git commit -m "feat(backend): Integrate Google Gemini API for executive brief generation"

# Commit 7
git add backend/app/services/email_service.py
git commit -m "feat(backend): Add SMTP email service with professional HTML templates"

# Commit 8
git add backend/app/main.py backend/app/routers/upload.py
git commit -m "feat(backend): Implement core API application and analysis upload router"

# Commit 9
git add frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/eslint.config.js frontend/index.html
git commit -m "chore(frontend): Scaffold React Vite single page application"

# Commit 10
git add frontend/src/
git commit -m "feat(frontend): Implement premium dark-theme UI and API integration"

# Commit 11
git add backend/Dockerfile frontend/Dockerfile docker-compose.yml render.yaml frontend/vercel.json frontend/nginx.conf .github/
git commit -m "chore(devops): Add Dockerfiles, Compose orchestration, and GitHub Actions CI"

# Configure remote and push directly
git remote remove origin 2>$null
git branch -M main
git remote add origin https://github.com/Armaan22gautam/rabbit.ai.git
git push -u origin main
