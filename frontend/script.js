const recordBtn = document.getElementById("recordBtn");
const responseText = document.getElementById("responseText");
const audioPlayback = document.getElementById("audioPlayback");

let mediaRecorder;
let audioChunks = [];

recordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    try {
      const response = await fetch("http://127.0.0.1:5000/process_audio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("📡 Server:", data);

      if (data.response) {
        responseText.textContent = data.response;
        audioPlayback.src = "http://127.0.0.1:5000" + data.audio_url;
        audioPlayback.onloadedmetadata = () => {
          audioPlayback.play().catch(err => {
            console.error("❌ Playback error:", err);
          });
        };
      } else {
        responseText.textContent = "❌ " + data.error;
      }
    } catch (err) {
      responseText.textContent = "❌ Network Error: " + err.message;
    }
  };

  mediaRecorder.start();
  recordBtn.disabled = true;
  recordBtn.textContent = "Recording...";

  setTimeout(() => {
    mediaRecorder.stop();
    recordBtn.disabled = false;
    recordBtn.textContent = "🎙 Speak Now";
  }, 4000);
};
