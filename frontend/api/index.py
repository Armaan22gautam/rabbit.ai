import sys
import os

# Add current directory to path so imports like 'from app.config import settings' work
# Vercel serverless functions run from the root of the project, but having 'api' in the path helps
sys.path.append(os.path.dirname(__file__))

from app.main import app
