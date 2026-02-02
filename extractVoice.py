import speech_recognition as sr
import time

def get_headphone_mic_index():
    mic_names = sr.Microphone.list_microphone_names()

    for i, name in enumerate(mic_names):
        lname = name.lower()
        if any(k in lname for k in ['airpods', 'headphone', 'bluetooth', 'headset']):
            print(f"🎧 Using headphone mic: {name}")
            return i

    print("⚠️ Headphone mic not found, using default mic")
    return None  # fallback to system default


def voice_to_text():
    recognizer = sr.Recognizer()
    recognizer.dynamic_energy_threshold = True

    mic_index = get_headphone_mic_index()

    with sr.Microphone(device_index=mic_index) as source:
        print("🎤 Adjusting for ambient noise...")
        recognizer.adjust_for_ambient_noise(source, duration=0.5)

        print("🎤 Recording for exactly 5 seconds...")
        start = time.time()
        audio_chunks = []

        while time.time() - start < 5:
            try:
                audio = recognizer.listen(
                    source,
                    timeout=0.5,
                    phrase_time_limit=0.5
                )
                audio_chunks.append(audio)
            except sr.WaitTimeoutError:
                pass

    if not audio_chunks:
        print("❌ No audio captured")
        return

    combined = b''.join(chunk.get_raw_data() for chunk in audio_chunks)
    audio = sr.AudioData(
        combined,
        audio_chunks[0].sample_rate,
        audio_chunks[0].sample_width
    )

    try:
        text = recognizer.recognize_google(audio)
        print("\n📝 Recognized text:")
        print(text)
    except sr.UnknownValueError:
        print("\n❌ Could not understand the audio")
    except sr.RequestError as e:
        print("\n❌ Speech service error:", e)


if __name__ == "__main__":
    voice_to_text()
