import os

import fastapi
from fastapi.responses import FileResponse
from fastrtc import ReplyOnPause, Stream, get_stt_model, get_tts_model
from openai import OpenAI
import logging
import time
from fastapi.middleware.cors import CORSMiddleware

from .env import LLM_API_KEY

stt_model = get_stt_model()
tts_model = get_tts_model()

sys_prompt = """
You are a helpful assistant. You are witty, engaging and fun. You love being interactive with the user. 
Begin a conversation with a self-deprecating joke like 'I'm not sure if I'm ready for this...' or 'I bet you already regret clicking that button...'
"""

openai_client = OpenAI(
    api_key=LLM_API_KEY
)

logging.basicConfig(level=logging.INFO)

def echo(audio):
    # yield audio
    stt_time = time.time()
    logging.info("Performing STT")
    prompt = stt_model.stt(audio)
    logging.info(f"STT took {time.time() - stt_time} seconds")

    llm_time = time.time()
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": sys_prompt + "\n\n" + prompt}],
        max_tokens=200,
    )
    prompt = response.choices[0].message.content
    logging.info(f"LLM took {time.time() - llm_time} seconds")

    tts_time = time.time()
    for audio_chunk in tts_model.stream_tts_sync(prompt):
        yield audio_chunk

stream = Stream(ReplyOnPause(echo), modality="audio", mode="send-receive")

app = fastapi.FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stream.mount(app)

@app.get("/")
async def get_index():
    return FileResponse("frontend/index.html")

@app.get("/script.js")
async def get_script():
    return FileResponse("frontend/script.js")
