from gtts import gTTS
import uuid
import os

def generate_speech(text):
    filename = f"static/audio/{uuid.uuid4().hex}.mp3"
    tts = gTTS(text)
    tts.save(filename)
    return filename
