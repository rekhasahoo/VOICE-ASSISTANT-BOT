from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from stt_api import transcribe_audio_whisper
from chatbot_api import get_chatbot_response
from tts_api import generate_speech
import os

app = Flask(__name__)
CORS(app)

@app.route('/process_audio', methods=['POST'])
def process_audio():
    audio_file = request.files.get('audio')
    if not audio_file:
        return jsonify({"error": "No audio uploaded"}), 400

    filepath = "temp.wav"
    audio_file.save(filepath)

    try:
        text = transcribe_audio_whisper(filepath)
        print("🗣 User said:", text)

        bot_reply = get_chatbot_response(text)
        print("🤖 Bot replied:", bot_reply)

        audio_path = generate_speech(bot_reply)
        print("🔊 Audio path:", audio_path)

        return jsonify({
            "response": bot_reply,
            "audio_url": "/" + audio_path
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/static/audio/<filename>')
def serve_audio(filename):
    return send_file(f"static/audio/{filename}")

if __name__ == "__main__":
    os.makedirs("static/audio", exist_ok=True)
    app.run(debug=True)
