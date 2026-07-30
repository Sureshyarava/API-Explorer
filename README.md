# API-Explorer
HTTP client that allows a user to make API requests

## Quick start

Backend (terminal 1):

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

Frontend (terminal 2):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.
