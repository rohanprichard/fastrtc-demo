import fastapi
from fastapi.responses import FileResponse
from fastrtc import ReplyOnPause, Stream, get_stt_model
from fastrtc import AlgoOptions, SileroVadOptions
from openai import OpenAI
import logging
import time
from fastapi.middleware.cors import CORSMiddleware
from elevenlabs import stream
from elevenlabs.client import ElevenLabs
import numpy as np
import io

from .env import LLM_API_KEY, ELEVENLABS_API_KEY

stt_model = get_stt_model()

sys_prompt = """
You are a helpful assistant. You are witty, engaging and fun. You love being interactive with the user. 
Begin a conversation with a self-deprecating joke like 'I'm not sure if I'm ready for this...' or 'I bet you already regret clicking that button...'
"""

messages = [{"role": "system", "content": sys_prompt}]

openai_client = OpenAI(
    api_key=LLM_API_KEY
)

elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

logging.basicConfig(level=logging.INFO)

def echo(audio):
    # yield audio
    stt_time = time.time()

    logging.info("Performing STT")
    prompt = stt_model.stt(audio)
    if prompt == "":
        logging.info("STT returned empty string")
        return
    logging.info(f"STT response: {prompt}")

    messages.append({"role": "user", "content": prompt})

    logging.info(f"STT took {time.time() - stt_time} seconds")

    llm_time = time.time()

    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=200,
    )
    prompt = response.choices[0].message.content
    messages.append({"role": "assistant", "content": prompt})
    logging.info(f"LLM response: {prompt}")

    logging.info(f"LLM took {time.time() - llm_time} seconds")

    audio_stream = elevenlabs_client.text_to_speech.convert_as_stream(
        text=prompt,
        voice_id="JBFqnCBsd6RMkjVDRZzb",
        model_id="eleven_multilingual_v2",
        output_format="pcm_24000",
    )
    
    for audio_chunk in audio_stream:
        audio_array = np.frombuffer(audio_chunk, dtype=np.int16).astype(np.float32) / 32768.0
        yield (24000, audio_array)


stream = Stream(ReplyOnPause(echo,
            algo_options=AlgoOptions(
                audio_chunk_duration=0.8,
                started_talking_threshold=0.25,
                speech_threshold=0.3
            ),
            model_options=SileroVadOptions(
                threshold=0.7,
                min_speech_duration_ms=450,
                min_silence_duration_ms=1000
            )), 
            modality="audio", 
            mode="send-receive"
        )

app = fastapi.FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stream.mount(app)

@app.get("/reset")
async def reset():
    global messages
    logging.info("Resetting chat")
    messages = [{"role": "system", "content": sys_prompt}]
    return {"status": "success"}