# FastRTC Voice Demo

A reference implementation of a browser-based, real-time voice conversation experience. The repository separates a FastAPI/FastRTC backend from a Next.js frontend so the voice pipeline and interface can evolve independently.

## What it demonstrates

- microphone capture and browser voice interaction
- FastRTC-powered real-time transport
- speech-to-text and text-to-speech through ElevenLabs
- LLM responses through an OpenAI-compatible API key
- tunable voice-activity detection settings

## Architecture

```text
Browser (Next.js) → FastAPI + FastRTC → STT / LLM / TTS providers
```

The browser UI lives in `frontend/fastrtc-demo`; the Python backend lives in `backend/`.

## Run locally

### 1. Configure provider keys

Copy `.env.example` to `.env` and supply your own keys:

```env
LLM_API_KEY=...
ELEVENLABS_API_KEY=...
```

Never commit `.env` or expose provider keys in a browser client.

### 2. Start the backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
./run.sh
```

On Windows, run `uvicorn backend.server:app --host 0.0.0.0 --port 8000` after installing dependencies.

### 3. Start the frontend

```bash
cd frontend/fastrtc-demo
npm install
npm run dev
```

Open the local URL printed by Next.js and allow microphone access when prompted.

## Voice tuning

The backend exposes voice-activity detection settings such as speech threshold, silence duration, speech padding, and maximum segment duration. Increase silence duration if the assistant interrupts too quickly; decrease it if responses feel slow.

## Operational notes

This is a demonstration project. Running it requires billable third-party API credentials, HTTPS in most production microphone contexts, and a deployment design that keeps provider keys on the server.

## License

MIT
