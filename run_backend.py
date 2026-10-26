"""
REVIVE Backend Launcher
Starts the FastAPI application with the backend directory properly added to sys.path.
Usage: python run_backend.py
"""

import os
import sys
import uvicorn

# Ensure backend directory is in Python path
sys.path.insert(0, os.path.abspath("backend"))

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Starting REVIVE Backend on http://0.0.0.0:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
