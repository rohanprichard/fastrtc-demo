import os

import fastapi
from fastapi.responses import FileResponse
from fastrtc import ReplyOnPause, Stream, get_stt_model, get_tts_model
from openai import OpenAI
import logging
import time

from .env import DEEPSEEK_API_KEY

stt_model = get_stt_model()
tts_model = get_tts_model()

sys_prompt = """
You are a helpful assistant. You are witty, engaging and fun. You love being interactive and making jokes.
"""

deepseek_client = OpenAI(
    api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com/v1"
)

logging.basicConfig(level=logging.INFO)

def echo(audio):
    # yield audio
    # Uncomment these lines when you want to use the full functionality
    stt_time = time.time()
    logging.info("Performing STT")
    prompt = stt_model.stt(audio)
    logging.info(f"STT took {time.time() - stt_time} seconds")

    llm_time = time.time()
    response = deepseek_client.chat.completions.create(
        model="deepseek-chat",
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
stream.mount(app)

@app.get("/")
async def get_index():
    return FileResponse("frontend/index.html")

@app.get("/script.js")
async def get_script():
    return FileResponse("frontend/script.js")
