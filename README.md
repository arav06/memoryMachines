# Memory Machines Take-home Task
> Arav Budhiraja | 11/11

Real-time speech, sentiment, and keywords with a p5 visualization

## Project Overview

- Live transcription via Deepgram WebSocket
- FastAPI endpoint using Gemini to extract sentiment and keywords
- React.js frontend with a p5.js flow-field visualization that responds to sentiment

## Features

- Live transcription: Browser mic -> Deepgram -> transcript text
- NLP: Backend returns sentimentScore, sentimentLabel, keywords
- Visualization: Perlin-noise inspired particles and waves respond to sentiment
- UI: Start/Stop recording, status, and a sentiment bar

## User Flow

- Browser mic captured with MediaRecorder
- Audio chunks stream to Deepgram over WebSocket
- Finalized transcript lines makes a POST request to the API's /process_text endpoint
- Backend returns sentimentScore, sentimentLabel, and keywords
- UI updates:
  - Sentiment bar + label
  - Keywords
  - Transcript
  - Visualization adjusts speed/color based on sentiment

## Stack

- Frontend: React, Vite, react-p5, p5, axios
- Backend: FastAPI, google-genai (Gemini), Uvicorn
- Transcription: Deepgram (https://deepgram.com)
- LLM Model: Gemini-2.5 Flash

## Structure

```
memoryMachines/
  backend/
    app.py
    requirements.txt
    .env.example
  frontend/
    src/
      App.jsx
      App.css
      components/
        AuraVisualization.jsx
        Controls.jsx
        Controls.css
        KeywordsDisplay.jsx
        KeywordsDisplay.css
        TranscriptDisplay.jsx
        TranscriptDisplay.css
    vite.config.js
    .env.example
```

## Setup

### Backend

```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

## Frontend

```
cd frontend
npm install
npm run dev
```

## Environment Variables

```
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

- Frontend environment variables: Deepgram API key and API URL
- Backend environment variable: Gemini API key
